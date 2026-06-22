"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "@/lib/audit"
import { cloudinary } from "@/lib/cloudinary"
import { getCloudinaryResourceType } from "@/lib/property-media"

const CONFIRM_PHRASE = "DELETE"

type ActionResult = { success: true; count: number } | { error: string }

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return null
  return session
}

function checkConfirm(confirmation: string): string | null {
  if (confirmation?.trim().toUpperCase() !== CONFIRM_PHRASE) {
    return `Type ${CONFIRM_PHRASE} to confirm.`
  }
  return null
}

// Revalidate every surface that reads properties / bookings / revenue.
function revalidateDataSurfaces() {
  revalidatePath("/admin/dashboard")
  revalidatePath("/admin/properties")
  revalidatePath("/admin/bookings")
  revalidatePath("/admin/reports")
  revalidatePath("/admin/reviews")
  revalidatePath("/admin/settings")
  revalidatePath("/admin/settings/homepage")
  revalidatePath("/owner/dashboard")
  revalidatePath("/owner/reports")
  revalidatePath("/properties")
  revalidatePath("/")
}

/**
 * Delete ALL properties. Cascades (per schema onDelete: Cascade) to every
 * property image, room type, section, blocked date, booking and review.
 * Cloudinary assets for property + review media are removed first.
 */
export async function deleteAllPropertiesAction(confirmation: string): Promise<ActionResult> {
  const session = await requireAdmin()
  if (!session) return { error: "Unauthorized" }
  const bad = checkConfirm(confirmation)
  if (bad) return { error: bad }

  try {
    const count = await prisma.property.count()
    if (count === 0) return { success: true, count: 0 }

    // Clean up Cloudinary: property media + review media (both cascade-deleted).
    const [images, reviewImages] = await Promise.all([
      prisma.propertyImage.findMany({ select: { url: true, publicId: true } }),
      prisma.reviewImage.findMany({ select: { publicId: true } }),
    ])

    await Promise.all(
      images
        .filter((m) => !!m.publicId)
        .map((m) =>
          cloudinary.uploader
            .destroy(m.publicId, { resource_type: getCloudinaryResourceType(m.url) })
            .catch((e) => console.error("[DATA_MGMT_PROPERTY_MEDIA]", e))
        )
    )
    await Promise.all(
      reviewImages
        .map((m) => m.publicId)
        .filter((pid): pid is string => !!pid)
        .map((pid) =>
          cloudinary.uploader.destroy(pid).catch((e) => console.error("[DATA_MGMT_REVIEW_MEDIA]", e))
        )
    )

    await prisma.property.deleteMany({})

    await createAuditLog({
      action: "BULK_DELETE",
      entity: "PROPERTY",
      details: { scope: "ALL", count },
      userId: session.user.id,
    })

    revalidateDataSurfaces()
    return { success: true, count }
  } catch (error) {
    console.error("[DATA_MGMT_DELETE_PROPERTIES]", error)
    return { error: error instanceof Error ? error.message : "Failed to delete properties." }
  }
}

/**
 * Delete ALL bookings (manual + bulk — there is no source distinction in the
 * schema, so this covers every reservation). Reviews tied to a booking keep
 * their record; their bookingId is cleared automatically (optional relation).
 */
export async function deleteAllBookingsAction(confirmation: string): Promise<ActionResult> {
  const session = await requireAdmin()
  if (!session) return { error: "Unauthorized" }
  const bad = checkConfirm(confirmation)
  if (bad) return { error: bad }

  try {
    const count = await prisma.booking.count()
    if (count === 0) return { success: true, count: 0 }

    // Detach reviews first so deleting bookings never trips a FK restriction.
    await prisma.review.updateMany({
      where: { bookingId: { not: null } },
      data: { bookingId: null },
    })
    await prisma.booking.deleteMany({})

    await createAuditLog({
      action: "BULK_DELETE",
      entity: "BOOKING",
      details: { scope: "ALL", count },
      userId: session.user.id,
    })

    revalidateDataSurfaces()
    return { success: true, count }
  } catch (error) {
    console.error("[DATA_MGMT_DELETE_BOOKINGS]", error)
    return { error: error instanceof Error ? error.message : "Failed to delete bookings." }
  }
}

/**
 * Reset all financial figures. Finances in this app are derived live from
 * booking.totalPrice (no separate finance table), so "removing finances"
 * means zeroing every booking's total — revenue/payments read as 0 while the
 * reservations themselves stay intact.
 */
export async function resetAllFinancesAction(confirmation: string): Promise<ActionResult> {
  const session = await requireAdmin()
  if (!session) return { error: "Unauthorized" }
  const bad = checkConfirm(confirmation)
  if (bad) return { error: bad }

  try {
    const result = await prisma.booking.updateMany({
      where: { totalPrice: { not: 0 } },
      data: { totalPrice: 0 },
    })

    await createAuditLog({
      action: "BULK_UPDATE",
      entity: "BOOKING",
      details: { scope: "ALL", field: "totalPrice", value: 0, count: result.count },
      userId: session.user.id,
    })

    revalidateDataSurfaces()
    return { success: true, count: result.count }
  } catch (error) {
    console.error("[DATA_MGMT_RESET_FINANCES]", error)
    return { error: error instanceof Error ? error.message : "Failed to reset finances." }
  }
}

/**
 * Delete ALL property "data sections" (the custom content blocks shown on
 * property detail pages) across every property. Properties themselves stay.
 */
export async function deleteAllSectionsAction(confirmation: string): Promise<ActionResult> {
  const session = await requireAdmin()
  if (!session) return { error: "Unauthorized" }
  const bad = checkConfirm(confirmation)
  if (bad) return { error: bad }

  try {
    const result = await prisma.propertySection.deleteMany({})

    await createAuditLog({
      action: "BULK_DELETE",
      entity: "PROPERTY_SECTION",
      details: { scope: "ALL", count: result.count },
      userId: session.user.id,
    })

    revalidateDataSurfaces()
    return { success: true, count: result.count }
  } catch (error) {
    console.error("[DATA_MGMT_DELETE_SECTIONS]", error)
    return { error: error instanceof Error ? error.message : "Failed to delete property sections." }
  }
}
