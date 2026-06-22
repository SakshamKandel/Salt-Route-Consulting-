import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { ACTIVE_BOOKING_STATUSES } from "@/lib/booking-lifecycle"
import { eachNightDay, toDateOnlyString, toUtcDay } from "@/lib/booking-dates"

type BookingClient = typeof prisma | Prisma.TransactionClient

type BookingSpan = {
  checkIn: Date
  checkOut: Date
  units: number
  roomTypeId: string | null
}

function overlapsBlockedScope(bookingRoomTypeId: string | null, blockedRoomTypeId?: string | null) {
  if (!blockedRoomTypeId) return true
  return bookingRoomTypeId === blockedRoomTypeId || bookingRoomTypeId === null
}

function maxUnitsBookedPerNight(bookings: BookingSpan[]) {
  const unitsByDay = new Map<string, number>()

  for (const booking of bookings) {
    const from = toUtcDay(booking.checkIn)
    const to = toUtcDay(booking.checkOut)
    for (const day of eachNightDay(from, to)) {
      const key = toDateOnlyString(day)
      unitsByDay.set(key, (unitsByDay.get(key) ?? 0) + Math.max(1, booking.units))
    }
  }

  return Math.max(0, ...unitsByDay.values())
}

export async function assertRoomTypeCapacityCanShrink(
  client: BookingClient,
  propertyId: string,
  roomTypeId: string,
  nextTotalUnits: number
) {
  const bookings = await client.booking.findMany({
    where: {
      propertyId,
      status: { in: ACTIVE_BOOKING_STATUSES },
      OR: [{ roomTypeId }, { roomTypeId: null }],
    },
    select: { checkIn: true, checkOut: true, units: true, roomTypeId: true },
  })

  const requiredUnits = maxUnitsBookedPerNight(bookings)
  if (nextTotalUnits < requiredUnits) {
    throw new Error(`This room class already has ${requiredUnits} unit(s) booked on at least one night.`)
  }
}

export async function assertPropertyCapacityCanShrink(
  client: BookingClient,
  propertyId: string,
  nextTotalUnits: number
) {
  const bookings = await client.booking.findMany({
    where: {
      propertyId,
      roomTypeId: null,
      status: { in: ACTIVE_BOOKING_STATUSES },
    },
    select: { checkIn: true, checkOut: true, units: true, roomTypeId: true },
  })

  const requiredUnits = maxUnitsBookedPerNight(bookings)
  if (nextTotalUnits < requiredUnits) {
    throw new Error(`This property already has ${requiredUnits} unit(s) booked on at least one night.`)
  }
}

export async function assertBlockedRangeHasNoActiveBookings(
  client: BookingClient,
  propertyId: string,
  checkIn: Date,
  checkOut: Date,
  roomTypeId?: string | null
) {
  const from = toUtcDay(checkIn)
  const to = toUtcDay(checkOut)
  const requestedDays = new Set(eachNightDay(from, to).map(toDateOnlyString))

  const bookings = await client.booking.findMany({
    where: {
      propertyId,
      status: { in: ACTIVE_BOOKING_STATUSES },
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
    select: { checkIn: true, checkOut: true, roomTypeId: true, units: true },
  })

  const conflicts = bookings.some((booking) => {
    if (!overlapsBlockedScope(booking.roomTypeId, roomTypeId)) return false
    return eachNightDay(toUtcDay(booking.checkIn), toUtcDay(booking.checkOut))
      .some((day) => requestedDays.has(toDateOnlyString(day)))
  })

  if (conflicts) {
    throw new Error("This date range already has active bookings. Cancel or move those bookings before blocking it.")
  }
}
