"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { createAuditLog } from "@/lib/audit"
import { BookingStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized")
  return session
}

export async function bulkUpdateBookingStatusAction(
  ids: string[],
  status: BookingStatus,
  reason?: string
) {
  const session = await requireAdmin()
  try {
    const now = new Date()
    const timestampField: Record<string, Date | undefined> = {}
    if (status === "CONFIRMED") timestampField.confirmedAt = now
    if (status === "CANCELLED") timestampField.cancelledAt = now
    if (status === "CHECKED_IN") timestampField.checkedInAt = now
    if (status === "COMPLETED") timestampField.checkedOutAt = now
    if (status === "NO_SHOW") timestampField.noShowAt = now

    await prisma.booking.updateMany({
      where: { id: { in: ids } },
      data: {
        status,
        ...(reason ? { cancellationReason: reason } : {}),
        ...timestampField,
      },
    })

    await createAuditLog({
      action: "BULK_UPDATE",
      entity: "BOOKING",
      userId: session.user.id,
      details: { action: "BULK_STATUS_UPDATE", status, ids, count: ids.length, reason },
    })

    revalidatePath("/admin/bookings")
    return { success: true, count: ids.length }
  } catch {
    return { error: "Failed to update booking statuses." }
  }
}

export async function bulkCancelBookingsAction(ids: string[], reason: string) {
  return bulkUpdateBookingStatusAction(ids, BookingStatus.CANCELLED, reason)
}
