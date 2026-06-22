import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { safeErrorResponse } from "@/lib/security"
import { ACTIVE_BOOKING_STATUSES } from "@/lib/booking-lifecycle"
import { expireStalePendingBookings } from "@/lib/booking-hold-expiry"

// 10.2 — Zod on query params
const availabilityQuerySchema = z.object({
  from: z.string().datetime({ offset: true }).or(z.string().date()),
  to: z.string().datetime({ offset: true }).or(z.string().date()),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)

  try {
    const validated = availabilityQuerySchema.parse({
      from: searchParams.get("from"),
      to: searchParams.get("to"),
    })

    // Widen the window by a day on each side so legacy timestamps that sit
    // just across a UTC-midnight boundary are not missed.
    const fromDate = new Date(new Date(validated.from).getTime() - 24 * 3600_000)
    const toDate = new Date(new Date(validated.to).getTime() + 24 * 3600_000)

    await expireStalePendingBookings()

    const [bookings, blockedDates, roomTypes, property] = await Promise.all([
      prisma.booking.findMany({
        where: {
          propertyId: id,
          status: { in: ACTIVE_BOOKING_STATUSES },
          checkIn: { lte: toDate },
          checkOut: { gte: fromDate },
        },
        select: { checkIn: true, checkOut: true, roomTypeId: true, units: true },
      }),
      prisma.blockedDate.findMany({
        where: {
          propertyId: id,
          date: { gte: fromDate, lte: toDate },
        },
        select: { date: true, reason: true, roomTypeId: true },
      }),
      prisma.roomType.findMany({
        where: { propertyId: id, active: true },
        select: { id: true, name: true, totalUnits: true },
        orderBy: { order: "asc" },
      }),
      prisma.property.findUnique({
        where: { id },
        select: { totalUnits: true },
      }),
    ])

    return NextResponse.json({
      bookings,
      blockedDates,
      roomTypes,
      propertyUnits: Math.max(1, property?.totalUnits ?? 1),
    })
  } catch (error: unknown) {
    return safeErrorResponse(error, "GET /api/properties/[id]/availability")
  }
}
