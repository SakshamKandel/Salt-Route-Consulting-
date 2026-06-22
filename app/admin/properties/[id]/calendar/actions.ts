"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { toDateOnlyString } from "@/lib/booking-dates"
import { assertBlockedRangeHasNoActiveBookings } from "@/lib/booking-admin-guards"

export async function addBlockedDatesAction(
  propertyId: string,
  from: string,
  to: string,
  roomTypeId?: string | null
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  try {
    z.string().date().parse(from)
    z.string().date().parse(to)

    if (roomTypeId) {
      const roomType = await prisma.roomType.findFirst({
        where: { id: roomTypeId, propertyId },
        select: { id: true },
      })
      if (!roomType) return { error: "Room class not found for this property." }
    }

    const start = new Date(from)
    const end = new Date(to)
    if (start > end) return { error: "Start date must be before end date." }
    const endExclusive = new Date(end)
    endExclusive.setDate(endExclusive.getDate() + 1)

    await assertBlockedRangeHasNoActiveBookings(prisma, propertyId, start, endExclusive, roomTypeId)

    const dates: Date[] = []
    const cur = new Date(start)
    while (cur <= end) {
      dates.push(new Date(cur))
      cur.setDate(cur.getDate() + 1)
    }

    // Postgres treats NULL as distinct in unique indexes, so whole-property
    // blocks must be deduplicated manually instead of relying on skipDuplicates.
    const existing = await prisma.blockedDate.findMany({
      where: {
        propertyId,
        roomTypeId: roomTypeId ?? null,
        date: { gte: start, lte: end },
      },
      select: { date: true },
    })
    const existingKeys = new Set(existing.map((e) => toDateOnlyString(new Date(e.date))))
    const fresh = dates.filter((d) => !existingKeys.has(toDateOnlyString(d)))

    if (fresh.length > 0) {
      await prisma.blockedDate.createMany({
        data: fresh.map((date) => ({ propertyId, date, roomTypeId: roomTypeId ?? null })),
        skipDuplicates: true,
      })
    }

    revalidatePath(`/admin/properties/${propertyId}/calendar`)
    revalidatePath(`/api/properties/${propertyId}/availability`)
    return { success: `${fresh.length} date(s) blocked${dates.length !== fresh.length ? ` (${dates.length - fresh.length} already blocked)` : ""}.` }
  } catch (err) {
    console.error("[BLOCK_DATES]", err)
    return { error: "Failed to block dates." }
  }
}

export async function removeBlockedDateAction(blockedDateId: string, propertyId: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  try {
    await prisma.blockedDate.delete({ where: { id: blockedDateId } })
    revalidatePath(`/admin/properties/${propertyId}/calendar`)
    revalidatePath(`/api/properties/${propertyId}/availability`)
    return { success: true }
  } catch (err) {
    console.error("[REMOVE_BLOCKED_DATE]", err)
    return { error: "Failed to remove blocked date." }
  }
}
