import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { safeErrorResponse } from "@/lib/security"

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

    const fromDate = new Date(validated.from)
    const toDate = new Date(validated.to)

    const [bookings, blockedDates] = await Promise.all([
      prisma.booking.findMany({
        where: {
          propertyId: id,
          status: { in: ["CONFIRMED", "PENDING"] },
          OR: [
            { checkIn: { lte: toDate }, checkOut: { gte: fromDate } },
          ],
        },
        select: { checkIn: true, checkOut: true },
      }),
      prisma.blockedDate.findMany({
        where: {
          propertyId: id,
          date: { gte: fromDate, lte: toDate },
        },
        select: { date: true, reason: true },
      }),
    ])

    return NextResponse.json({ bookings, blockedDates })
  } catch (error: unknown) {
    return safeErrorResponse(error, "GET /api/properties/[id]/availability")
  }
}
