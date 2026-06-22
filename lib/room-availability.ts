import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { ACTIVE_BOOKING_STATUSES } from "@/lib/booking-lifecycle"
import { toUtcDay, eachNightDay } from "@/lib/booking-dates"
import { expireStalePendingBookings } from "@/lib/booking-hold-expiry"

type Tx = Prisma.TransactionClient

export type AvailabilityCheck = {
  propertyId: string
  roomTypeId?: string | null
  checkIn: Date
  checkOut: Date
  /** How many units of the room type (or property) are requested. */
  units?: number
}

type Span = { from: Date; to: Date; roomTypeId: string | null; units: number }

const BUFFER_MS = 36 * 3600_000

function coversDay(span: Span, day: Date) {
  // Night-based: a stay from 10th to 14th occupies nights of 10, 11, 12, 13.
  // The checkout day (14th) is NOT occupied — allows same-day turnover.
  return span.from <= day && day < span.to
}

/**
 * Throws if the requested stay (of `units` units) cannot be accommodated.
 *
 * Capacity model (quantity-aware):
 * - Whole-property blocked dates (roomTypeId = null) always block; class blocks
 *   block only that class.
 * - Property WITHOUT room classes: capacity = property.totalUnits. A day is full
 *   when the sum of booked units already covering it leaves no room for the
 *   requested units.
 * - Room class with N units: bookings of that class (and any legacy class-less
 *   bookings, each consuming their own units) are summed per day; the request
 *   fails if taken + requested > N on any day.
 *
 * Days are compared using night-based [checkIn, checkOut) so the checkout day
 * is NOT treated as occupied — enabling same-day turnover (the standard hotel pattern).
 */
export async function assertStayAvailable(
  tx: Tx,
  { propertyId, roomTypeId, checkIn, checkOut, units = 1 }: AvailabilityCheck
) {
  const want = Math.max(1, units)
  const inDay = toUtcDay(checkIn)
  const outDay = toUtcDay(checkOut)

  // 1. Blocked dates: whole-property blocks always apply; class blocks apply to that class.
  const blocked = await tx.blockedDate.findMany({
    where: {
      propertyId,
      OR: [{ roomTypeId: null }, ...(roomTypeId ? [{ roomTypeId }] : [])],
      date: { gte: new Date(inDay.getTime() - BUFFER_MS), lte: new Date(outDay.getTime() + BUFFER_MS) },
    },
    select: { date: true },
  })
  if (blocked.some((b) => toUtcDay(b.date) >= inDay && toUtcDay(b.date) < outDay)) {
    throw new Error("The property is unavailable for one or more of the selected dates")
  }

  // 2. Overlapping active bookings (inclusive day overlap, with a buffer for legacy timestamps).
  const overlapping: Span[] = (
    await tx.booking.findMany({
      where: {
        propertyId,
        status: { in: ACTIVE_BOOKING_STATUSES },
        checkIn: { lte: new Date(outDay.getTime() + BUFFER_MS) },
        checkOut: { gte: new Date(inDay.getTime() - BUFFER_MS) },
      },
      select: { checkIn: true, checkOut: true, roomTypeId: true, units: true },
    })
  ).map((b) => ({ from: toUtcDay(b.checkIn), to: toUtcDay(b.checkOut), roomTypeId: b.roomTypeId, units: Math.max(1, b.units) }))

  const takenOn = (day: Date, classId: string | null) =>
    overlapping
      .filter((s) => (classId ? s.roomTypeId === classId || s.roomTypeId === null : true) && coversDay(s, day))
      .reduce((sum, s) => sum + s.units, 0)

  if (!roomTypeId) {
    // Class-less property: capacity is the property's own unit count.
    const property = await tx.property.findUnique({
      where: { id: propertyId },
      select: { totalUnits: true },
    })
    const capacity = Math.max(1, property?.totalUnits ?? 1)
    for (const day of eachNightDay(inDay, outDay)) {
      if (takenOn(day, null) + want > capacity) {
        throw new Error(`Only ${Math.max(0, capacity - takenOn(day, null))} unit(s) left on ${day.toISOString().slice(0, 10)}`)
      }
    }
    return
  }

  const roomType = await tx.roomType.findFirst({
    where: { id: roomTypeId, propertyId, active: true },
    select: { totalUnits: true, name: true },
  })
  if (!roomType) throw new Error("Selected room class is no longer available")

  for (const day of eachNightDay(inDay, outDay)) {
    const taken = takenOn(day, roomTypeId)
    if (taken + want > roomType.totalUnits) {
      const left = Math.max(0, roomType.totalUnits - taken)
      throw new Error(
        `Only ${left} ${roomType.name}${left === 1 ? "" : "s"} left on ${day.toISOString().slice(0, 10)} (you requested ${want})`
      )
    }
  }
}

/**
 * Property IDs that cannot host ANY stay in the given range — used by the
 * public search filter. A property only becomes unavailable on a day when
 * every unit of every class (or every property unit when no classes exist)
 * is taken.
 */
export async function getUnavailablePropertyIds(checkIn: Date, checkOut: Date): Promise<string[]> {
  await expireStalePendingBookings()

  const inDay = toUtcDay(checkIn)
  const outDay = toUtcDay(checkOut)

  const [bookings, blocks, roomTypes, properties] = await Promise.all([
    prisma.booking.findMany({
      where: {
        status: { in: ACTIVE_BOOKING_STATUSES },
        checkIn: { lte: new Date(outDay.getTime() + BUFFER_MS) },
        checkOut: { gte: new Date(inDay.getTime() - BUFFER_MS) },
      },
      select: { propertyId: true, roomTypeId: true, checkIn: true, checkOut: true, units: true },
    }),
    prisma.blockedDate.findMany({
      where: {
        date: { gte: new Date(inDay.getTime() - BUFFER_MS), lte: new Date(outDay.getTime() + BUFFER_MS) },
      },
      select: { propertyId: true, roomTypeId: true, date: true },
    }),
    prisma.roomType.findMany({
      where: { active: true },
      select: { id: true, propertyId: true, totalUnits: true },
    }),
    prisma.property.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, totalUnits: true },
    }),
  ])

  const touchedProperties = new Set([
    ...bookings.map((b) => b.propertyId),
    ...blocks.map((b) => b.propertyId),
  ])

  const unavailable: string[] = []
  for (const propertyId of touchedProperties) {
    const classes = roomTypes.filter((rt) => rt.propertyId === propertyId)
    const propertyUnits = Math.max(1, properties.find((p) => p.id === propertyId)?.totalUnits ?? 1)
    const spans: Span[] = bookings
      .filter((b) => b.propertyId === propertyId)
      .map((b) => ({ from: toUtcDay(b.checkIn), to: toUtcDay(b.checkOut), roomTypeId: b.roomTypeId, units: Math.max(1, b.units) }))
    const blockDays = blocks
      .filter((b) => b.propertyId === propertyId)
      .map((b) => ({ day: toUtcDay(b.date).getTime(), roomTypeId: b.roomTypeId }))

    const classFullOn = (classId: string, totalUnits: number, day: Date) => {
      if (blockDays.some((b) => b.day === day.getTime() && (b.roomTypeId === null || b.roomTypeId === classId))) return true
      const taken = spans
        .filter((s) => (s.roomTypeId === classId || s.roomTypeId === null) && coversDay(s, day))
        .reduce((sum, s) => sum + s.units, 0)
      return taken >= totalUnits
    }

    const isFullOn = (day: Date) => {
      if (classes.length === 0) {
        if (blockDays.some((b) => b.day === day.getTime() && b.roomTypeId === null)) return true
        return spans.filter((s) => coversDay(s, day)).reduce((sum, s) => sum + s.units, 0) >= propertyUnits
      }
      return classes.every((rt) => classFullOn(rt.id, rt.totalUnits, day))
    }

    if (eachNightDay(inDay, outDay).some(isFullOn)) {
      unavailable.push(propertyId)
    }
  }

  return unavailable
}
