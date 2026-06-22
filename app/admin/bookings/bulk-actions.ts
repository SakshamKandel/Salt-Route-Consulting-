"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { createAuditLog } from "@/lib/audit"
import { BookingStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { assertBookingTransition, getBookingStatusTimestampUpdate } from "@/lib/booking-lifecycle"
import { expireStalePendingBookings } from "@/lib/booking-hold-expiry"

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
    const result = await prisma.$transaction(async (tx) => {
      await expireStalePendingBookings(new Date(), tx)

      const bookings = await tx.booking.findMany({
        where: { id: { in: ids } },
        select: { id: true, status: true },
      })

      const skipped: { id: string; current: BookingStatus }[] = []
      const updated: string[] = []

      for (const booking of bookings) {
        try {
          assertBookingTransition(booking.status, status, "ADMIN")
          const tsUpdate = getBookingStatusTimestampUpdate(status)
          await tx.booking.update({
            where: { id: booking.id },
            data: {
              status,
              ...tsUpdate,
              ...(reason ? { cancellationReason: reason } : {}),
            },
          })
          updated.push(booking.id)
        } catch {
          skipped.push({ id: booking.id, current: booking.status })
        }
      }

      return { updated, skipped }
    })

    await createAuditLog({
      action: "BULK_UPDATE",
      entity: "BOOKING",
      userId: session.user.id,
      details: {
        action: "BULK_STATUS_UPDATE",
        status,
        updated: result.updated,
        skipped: result.skipped,
        count: result.updated.length,
        reason,
      },
    })

    revalidatePath("/admin/bookings")
    return {
      success: true,
      count: result.updated.length,
      skipped: result.skipped.length,
    }
  } catch {
    return { error: "Failed to update booking statuses." }
  }
}

export async function bulkCancelBookingsAction(ids: string[], reason: string) {
  return bulkUpdateBookingStatusAction(ids, BookingStatus.CANCELLED, reason)
}
