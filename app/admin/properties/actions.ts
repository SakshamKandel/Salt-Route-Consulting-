"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { PropertyStatus, Prisma } from "@prisma/client"
import { createAuditLog } from "@/lib/audit"
import { cloudinary } from "@/lib/cloudinary"
import { getCloudinaryResourceType } from "@/lib/property-media"

const propertyListItem = z.string().trim().min(1).max(160)

const propertySchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  location: z.string().min(3),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  maxGuests: z.number().min(1),
  pricePerNight: z.number().min(0),
  status: z.nativeEnum(PropertyStatus),
  ownerId: z.string().min(1),
  highlights: z.array(propertyListItem).max(40).default([]),
  amenities: z.array(propertyListItem).max(80).default([]),
  rules: z.array(propertyListItem).max(40).default([]),
  media: z
    .array(
      z.object({
        url: z.string().url(),
        publicId: z.string().min(1),
        alt: z.string().optional().nullable(),
      })
    )
    .optional(),
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
      ...basePropertyData
    } = validated
    const propertyData = {
      ...basePropertyData,
      highlights: uniqueList(highlights),
      amenities: uniqueList(amenities),
      rules: uniqueList(rules),
    }

    if (id) {
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

    revalidatePath("/admin/properties")
    revalidatePath("/admin/settings/homepage")
    revalidatePath("/properties")
    revalidatePath(`/properties/${propertyData.slug}`)
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
