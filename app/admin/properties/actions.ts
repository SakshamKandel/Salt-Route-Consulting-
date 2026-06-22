"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { PropertyStatus, Prisma } from "@prisma/client"
import { createAuditLog } from "@/lib/audit"
import { cloudinary } from "@/lib/cloudinary"
import { getCloudinaryResourceType } from "@/lib/property-media"
import { assignFeatureIcons } from "@/lib/ai/property-ai"
import { assertPropertyCapacityCanShrink, assertRoomTypeCapacityCanShrink } from "@/lib/booking-admin-guards"

const propertyListItem = z.string().trim().min(1).max(160)

const roomTypeDraftSchema = z.object({
  id: z.string().optional(),
  classType: z.string().trim().min(2, "Room type name is too short").max(60),
  name: z.string().trim().min(1).max(120),
  totalUnits: z.number().int().min(1).max(10000),
  pricePerNight: z.number().positive(),
  maxGuests: z.number().int().min(1).max(50),
  bedrooms: z.number().int().min(0).max(50),
  bathrooms: z.number().int().min(0).max(50),
  imageUrl: z.string().url().optional().or(z.literal("")),
  images: z.array(z.string().url()).max(20).optional(),
})

const propertySchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  propertyType: z.string().trim().min(2).max(60).default("Hotel"),
  description: z.string().min(10),
  location: z.string().min(3),
  address: z.string().optional(),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  maxGuests: z.number().min(1),
  pricePerNight: z.number().min(0),
  totalUnits: z.number().int().min(1).max(10000).default(1),
  checkInTime: z.string().max(40).optional(),
  checkOutTime: z.string().max(40).optional(),
  tagline: z.string().max(200).optional(),
  story: z.string().max(5000).optional(),
  neighborhood: z.string().max(3000).optional(),
  hostNote: z.string().max(2000).optional(),
  highlightsTitle: z.string().max(80).optional(),
  amenitiesTitle: z.string().max(80).optional(),
  status: z.nativeEnum(PropertyStatus),
  ownerId: z.string().min(1),
  highlights: z.array(propertyListItem).max(40).default([]),
  amenities: z.array(propertyListItem).max(80).default([]),
  rules: z.array(propertyListItem).max(40).default([]),
  services: z.array(propertyListItem).max(40).default([]),
  whatToExpect: z.array(propertyListItem).max(20).default([]),
  stayDetails: z.array(z.object({ label: z.string().trim().min(1).max(60), value: z.string().trim().min(1).max(80) })).max(12).default([]),
  gettingHere: z.array(z.object({ time: z.string().trim().min(1).max(40), from: z.string().trim().min(1).max(160), distance: z.string().trim().max(80).optional() })).max(6).default([]),
  media: z
    .array(
      z.object({
        url: z.string().url(),
        publicId: z.string().min(1),
        alt: z.string().optional().nullable(),
      })
    )
    .optional(),
  roomTypes: z.array(roomTypeDraftSchema).max(50).optional(),
  removedRoomTypeIds: z.array(z.string()).max(100).optional(),
})

function uniqueList(items: string[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = item.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function upsertPropertyAction(data: z.input<typeof propertySchema>, id?: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  try {
    const validated = propertySchema.parse(data)
    const {
      media = [],
      highlights,
      amenities,
      rules,
      services,
      whatToExpect,
      stayDetails,
      gettingHere,
      roomTypes,
      removedRoomTypeIds = [],
      ...basePropertyData
    } = validated
    const propertyData = {
      ...basePropertyData,
      tagline: basePropertyData.tagline?.trim() || null,
      story: basePropertyData.story?.trim() || null,
      neighborhood: basePropertyData.neighborhood?.trim() || null,
      hostNote: basePropertyData.hostNote?.trim() || null,
      highlightsTitle: basePropertyData.highlightsTitle?.trim() || null,
      amenitiesTitle: basePropertyData.amenitiesTitle?.trim() || null,
      checkInTime: basePropertyData.checkInTime?.trim() || null,
      checkOutTime: basePropertyData.checkOutTime?.trim() || null,
      highlights: uniqueList(highlights),
      amenities: uniqueList(amenities),
      rules: uniqueList(rules),
      services: uniqueList(services),
      whatToExpect: uniqueList(whatToExpect),
      stayDetails: stayDetails.length > 0 ? stayDetails : undefined,
      gettingHere: gettingHere.length > 0 ? gettingHere : undefined,
      featureIcons: await assignFeatureIcons([
        ...uniqueList(highlights),
        ...uniqueList(amenities),
        ...uniqueList(services),
        ...uniqueList(whatToExpect),
      ]),
    }

    if (id) {
      if (!roomTypes || roomTypes.length === 0) {
        await assertPropertyCapacityCanShrink(prisma, id, propertyData.totalUnits)
      }

      const [existingMediaCount, existingImageCount] = await Promise.all([
        prisma.propertyImage.count({ where: { propertyId: id } }),
        prisma.propertyImage.count({
          where: {
            propertyId: id,
            NOT: [{ url: { contains: "/video/upload/" } }],
          },
        }),
      ])
      const firstNewImageIndex = media.findIndex((item) => !item.url.includes("/video/upload/"))

      await prisma.property.update({
        where: { id },
        data: {
          ...propertyData,
          ...(media.length > 0
            ? {
                images: {
                  create: media.map((item, index) => {
                    const isVideo = item.url.includes("/video/upload/")
                    return {
                      url: item.url,
                      publicId: item.publicId,
                      alt: item.alt || null,
                      order: existingMediaCount + index,
                      isPrimary: !isVideo && existingImageCount === 0 && index === firstNewImageIndex,
                    }
                  }),
                },
              }
            : {}),
        },
      })

      await createAuditLog({
        action: "UPDATE",
        entity: "PROPERTY",
        entityId: id,
        details: { title: propertyData.title, status: propertyData.status },
        userId: session.user.id,
      })

      revalidatePath(`/admin/properties/${id}`)
    } else {
      const newProperty = await prisma.property.create({
        data: {
          ...propertyData,
          ...(media.length > 0
            ? {
                images: {
                  create: media.map((item, index) => ({
                    url: item.url,
                    publicId: item.publicId,
                    alt: item.alt || null,
                    order: index,
                    isPrimary:
                      !item.url.includes("/video/upload/") &&
                      index === media.findIndex((mediaItem) => !mediaItem.url.includes("/video/upload/")),
                  })),
                },
              }
            : {}),
        },
      })
      id = newProperty.id

      await createAuditLog({
        action: "CREATE",
        entity: "PROPERTY",
        entityId: newProperty.id,
        details: { title: propertyData.title, status: propertyData.status },
        userId: session.user.id,
      })
    }

    // ── Room types & inventory sync (inline editor) ──
    if (roomTypes) {
      const hadTypesBefore = (await prisma.roomType.count({ where: { propertyId: id } })) > 0

      for (const rtId of removedRoomTypeIds) {
        const activeBookings = await prisma.booking.count({
          where: { roomTypeId: rtId, status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] } },
        })
        if (activeBookings > 0) {
          // Keep history intact — deactivate instead of deleting.
          await prisma.roomType.updateMany({ where: { id: rtId, propertyId: id }, data: { active: false } })
        } else {
          await prisma.roomType.deleteMany({ where: { id: rtId, propertyId: id } })
        }
      }

      let firstCreatedId: string | null = null
      for (const [index, rt] of roomTypes.entries()) {
        const images = rt.images ?? (rt.imageUrl ? [rt.imageUrl] : [])
        const data = {
          classType: rt.classType,
          name: rt.name,
          totalUnits: rt.totalUnits,
          pricePerNight: rt.pricePerNight,
          maxGuests: rt.maxGuests,
          bedrooms: rt.bedrooms,
          bathrooms: rt.bathrooms,
          images,
          imageUrl: images[0] ?? null,
          order: index,
        }
        if (rt.id) {
          await assertRoomTypeCapacityCanShrink(prisma, id, rt.id, rt.totalUnits)
          await prisma.roomType.updateMany({ where: { id: rt.id, propertyId: id }, data })
        } else {
          const created = await prisma.roomType.create({ data: { ...data, propertyId: id, active: true } })
          if (!firstCreatedId) firstCreatedId = created.id
        }
      }

      // Automation: the first types a property gets adopt every existing
      // booking that has no room type, so old bookings stop blocking
      // the entire property.
      if (!hadTypesBefore && firstCreatedId) {
        await prisma.booking.updateMany({
          where: { propertyId: id, roomTypeId: null },
          data: { roomTypeId: firstCreatedId },
        })
      }

      // Keep the property-level unit count aligned with class inventory.
      const activeTypes = await prisma.roomType.findMany({
        where: { propertyId: id, active: true },
        select: { totalUnits: true },
      })
      if (activeTypes.length > 0) {
        await prisma.property.update({
          where: { id },
          data: { totalUnits: activeTypes.reduce((sum, t) => sum + t.totalUnits, 0) },
        })
      }
    }

    revalidatePath("/admin/properties")
    revalidatePath("/admin/settings/homepage")
    revalidatePath("/properties")
    revalidatePath(`/properties/${propertyData.slug}`)
    revalidatePath("/booking-request")
    revalidatePath("/")
    return { success: true, id }
  } catch (error) {
    console.error("[PROPERTY_UPSERT]", error)
    if (error instanceof z.ZodError) {
      const first = error.issues[0]
      return { error: `${first?.path?.join(".") || "Field"}: ${first?.message || "invalid"}` }
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[] | undefined)?.join(", ") ?? "field"
        return { error: `A property with that ${target} already exists. Try a different slug.` }
      }
      if (error.code === "P2003" || error.code === "P2025") {
        return { error: "Selected owner no longer exists. Pick a different owner." }
      }
    }
    return { error: error instanceof Error ? error.message : "Failed to save property." }
  }
}

export async function deletePropertyAction(id: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: { images: true },
    })

    if (!property) {
      return { error: "Property not found." }
    }

    // 1. Delete property images & videos from Cloudinary
    await Promise.all(
      property.images.map(async (media) => {
        try {
          await cloudinary.uploader.destroy(media.publicId, {
            resource_type: getCloudinaryResourceType(media.url),
          })
        } catch (error) {
          console.error("[PROPERTY_MEDIA_DELETE]", error)
        }
      })
    )

    // 2. Delete review images from Cloudinary (since review records will be cascaded)
    const reviewsWithImages = await prisma.review.findMany({
      where: { propertyId: id },
      include: { images: true },
    })

    const reviewImagePublicIds = reviewsWithImages
      .flatMap((r) => r.images)
      .map((img) => img.publicId)
      .filter((pid): pid is string => !!pid)

    if (reviewImagePublicIds.length > 0) {
      await Promise.all(
        reviewImagePublicIds.map(async (pid) => {
          try {
            await cloudinary.uploader.destroy(pid)
          } catch (err) {
            console.error("[REVIEW_IMAGE_CLEANUP_ERROR]", err)
          }
        })
      )
    }

    await prisma.property.delete({ where: { id } })

    await createAuditLog({
      action: "DELETE",
      entity: "PROPERTY",
      entityId: id,
      details: { title: property.title },
      userId: session.user.id,
    })

    revalidatePath("/admin/properties")
    revalidatePath("/admin/settings/homepage")
    revalidatePath("/properties")
    revalidatePath(`/properties/${property.slug}`)
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("[PROPERTY_DELETE]", error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return { error: "Cannot delete: this property still has bookings or reviews. Archive it instead." }
      }
    }
    return { error: error instanceof Error ? error.message : "Failed to delete property." }
  }
}

export async function geocodeAction(location: string): Promise<{ lat: number; lng: number } | null> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return null

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`, {
      headers: { "User-Agent": "SaltRouteAdminApp/1.0" },
    })
    if (!res.ok) return null
    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      return {
        lat: Number(data[0].lat),
        lng: Number(data[0].lon),
      }
    }
    return null
  } catch (err) {
    console.error("[GEOCODE_ERROR]", err)
    return null
  }
}
