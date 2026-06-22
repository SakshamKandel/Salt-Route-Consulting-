import { prisma } from "@/lib/db"
import { getBookingStatusTimestampUpdate } from "@/lib/booking-lifecycle"
import type { Prisma } from "@prisma/client"

type BookingClient = typeof prisma | Prisma.TransactionClient

/**
 * Lazily expire PENDING bookings whose hold has passed.
 *
 * This can be called:
 * - Before availability checks (to free up inventory from stale holds).
 * - From a cron job or scheduled task.
 * - On any admin/owner dashboard load.
 *
 * Returns the number of bookings that were expired.
 */
export async function expireStalePendingBookings(
  now = new Date(),
  client: BookingClient = prisma
): Promise<number> {
  const result = await client.booking.updateMany({
    where: {
      status: "PENDING",
      holdExpiresAt: { lt: now },
    },
    data: {
      status: "CANCELLED",
      cancellationReason: "Booking hold expired",
      ...getBookingStatusTimestampUpdate("CANCELLED", now),
    },
  })

  return result.count
}
