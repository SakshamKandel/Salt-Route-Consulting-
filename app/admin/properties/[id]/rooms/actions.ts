"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createAuditLog } from "@/lib/audit"
import { assertRoomTypeCapacityCanShrink } from "@/lib/booking-admin-guards"

const roomTypeSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  classType: z.string().trim().min(2, "Type is required").max(60),
  description: z.string().trim().max(2000).optional(),
  totalUnits: z.number().int().min(1, "At least 1 unit").max(500),
  pricePerNight: z.number().positive("Price must be greater than 0"),
  maxGuests: z.number().int().min(1).max(50),
  bedrooms: z.number().int().min(0).max(50),
  bathrooms: z.number().int().min(0).max(50),
  sizeSqm: z.number().int().min(0).max(10000).optional().nullable(),
  bedType: z.string().trim().max(120).optional(),
  amenities: z.array(z.string().trim().min(1).max(160)).max(40).default([]),
  imageUrl: z.string().url().optional().or(z.literal("")),
  images: z.array(z.string().url()).max(20).default([]),
  active: z.boolean().default(true),
})

export type RoomTypeInput = z.input<typeof roomTypeSchema>

function revalidateProperty(propertyId: string, slug?: string | null) {
  revalidatePath(`/admin/properties/${propertyId}/rooms`)
  revalidatePath(`/admin/properties/${propertyId}`)
  revalidatePath(`/booking-request`)
  if (slug) revalidatePath(`/properties/${slug}`)
}

export async function upsertRoomTypeAction(propertyId: string, data: RoomTypeInput, roomTypeId?: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  try {
    const validated = roomTypeSchema.parse(data)
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, slug: true },
    })
    if (!property) return { error: "Property not found" }

    const images = validated.images.length > 0 ? validated.images : (validated.imageUrl ? [validated.imageUrl] : [])
    const payload = {
      ...validated,
      description: validated.description || null,
      images,
      imageUrl: images[0] || null,
      sizeSqm: validated.sizeSqm || null,
      bedType: validated.bedType || null,
    }

    let reassigned = 0
    if (roomTypeId) {
      await assertRoomTypeCapacityCanShrink(prisma, propertyId, roomTypeId, validated.totalUnits)
      await prisma.roomType.update({
        where: { id: roomTypeId, propertyId },
        data: payload,
      })
    } else {
      const count = await prisma.roomType.count({ where: { propertyId } })
      const created = await prisma.roomType.create({
        data: { ...payload, propertyId, order: count },
      })

      // Automation: the first class created adopts every existing booking that
      // has no class, so old bookings stop blocking the entire property.
      if (count === 0) {
        const result = await prisma.booking.updateMany({
          where: { propertyId, roomTypeId: null },
          data: { roomTypeId: created.id },
        })
        reassigned = result.count
      }
    }

    await createAuditLog({
      action: roomTypeId ? "UPDATE" : "CREATE",
      entity: "ROOM_TYPE",
      entityId: roomTypeId,
      details: { name: validated.name, propertyId, reassignedBookings: reassigned },
      userId: session.user.id,
    })

    revalidateProperty(propertyId, property.slug)
    return { success: true, reassigned }
  } catch (err) {
    console.error("[ROOM_TYPE_UPSERT]", err)
    if (err instanceof z.ZodError) {
      const first = err.issues[0]
      return { error: `${first?.path?.join(".") || "Field"}: ${first?.message || "invalid"}` }
    }
    return { error: "Failed to save room class." }
  }
}

export async function deleteRoomTypeAction(propertyId: string, roomTypeId: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  try {
    const activeBookings = await prisma.booking.count({
      where: { roomTypeId, status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] } },
    })
    if (activeBookings > 0) {
      return { error: `This room class has ${activeBookings} active booking(s). Deactivate it instead of deleting.` }
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { slug: true },
    })

    await prisma.roomType.delete({ where: { id: roomTypeId, propertyId } })

    await createAuditLog({
      action: "DELETE",
      entity: "ROOM_TYPE",
      entityId: roomTypeId,
      details: { propertyId },
      userId: session.user.id,
    })

    revalidateProperty(propertyId, property?.slug)
    return { success: true }
  } catch (err) {
    console.error("[ROOM_TYPE_DELETE]", err)
    return { error: "Failed to delete room class." }
  }
}

export async function reorderRoomTypesAction(propertyId: string, orderedIds: string[]) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  try {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.roomType.update({ where: { id, propertyId }, data: { order: index } })
      )
    )
    const property = await prisma.property.findUnique({ where: { id: propertyId }, select: { slug: true } })
    revalidateProperty(propertyId, property?.slug)
    return { success: true }
  } catch (err) {
    console.error("[ROOM_TYPE_REORDER]", err)
    return { error: "Failed to reorder room classes." }
  }
}
