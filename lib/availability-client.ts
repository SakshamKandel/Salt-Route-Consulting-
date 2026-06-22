// Client-side availability math, shared by the booking calendar and the
// booking form so they always agree. Mirrors lib/room-availability.ts
// (server) but works from the /availability API payload.

import { toLocalDay, eachNightDay, toDateOnlyString } from "@/lib/booking-dates"

export type AvailabilityPayload = {
  blockedDates: Array<{ date: string | Date; roomTypeId?: string | null }>
  bookings: Array<{ checkIn: string | Date; checkOut: string | Date; roomTypeId?: string | null; units?: number | null }>
  roomTypes?: Array<{ id: string; name: string; totalUnits: number }>
  propertyUnits?: number
}

type Span = { from: Date; to: Date; roomTypeId: string | null; units: number }

function spansOf(data: AvailabilityPayload): Span[] {
  return data.bookings.map((b) => ({
    from: toLocalDay(b.checkIn),
    to: toLocalDay(b.checkOut),
    roomTypeId: b.roomTypeId ?? null,
    units: Math.max(1, b.units ?? 1),
  }))
}

function blockedSets(data: AvailabilityPayload) {
  const byClass = new Map<string | null, Set<string>>()
  for (const bd of data.blockedDates) {
    const key = bd.roomTypeId ?? null
    if (!byClass.has(key)) byClass.set(key, new Set())
    byClass.get(key)!.add(toDateOnlyString(toLocalDay(bd.date)))
  }
  return byClass
}

const covers = (s: Span, day: Date) => s.from <= day && day < s.to

/** Units already taken for a class (or whole property) on a given day. */
function takenOn(spans: Span[], day: Date, classId: string | null): number {
  return spans
    .filter((s) => (classId ? s.roomTypeId === classId || s.roomTypeId === null : true) && covers(s, day))
    .reduce((sum, s) => sum + s.units, 0)
}

/**
 * Days that cannot host even ONE more unit of the selected room type (or the
 * whole property when no class is chosen / none exist).
 */
export function computeDisabledDays(data: AvailabilityPayload, roomTypeId?: string | null): Date[] {
  const roomTypes = data.roomTypes ?? []
  const propertyUnits = Math.max(1, data.propertyUnits ?? 1)
  const spans = spansOf(data)
  const byClass = blockedSets(data)
  const wholeBlocked = byClass.get(null) ?? new Set<string>()

  const candidates = new Map<string, Date>()
  for (const s of spans) for (const d of eachNightDay(s.from, s.to)) candidates.set(toDateOnlyString(d), d)
  for (const bd of data.blockedDates) {
    const d = toLocalDay(bd.date)
    candidates.set(toDateOnlyString(d), d)
  }

  const classFullOn = (classId: string, totalUnits: number, day: Date, key: string) => {
    if (wholeBlocked.has(key)) return true
    if (byClass.get(classId)?.has(key)) return true
    return takenOn(spans, day, classId) >= totalUnits
  }

  const disabled: Date[] = []
  for (const [key, day] of candidates) {
    let isFull: boolean
    if (roomTypeId) {
      const rt = roomTypes.find((r) => r.id === roomTypeId)
      isFull = rt ? classFullOn(rt.id, rt.totalUnits, day, key) : wholeBlocked.has(key)
    } else if (roomTypes.length > 0) {
      isFull = roomTypes.every((rt) => classFullOn(rt.id, rt.totalUnits, day, key))
    } else {
      isFull = wholeBlocked.has(key) || takenOn(spans, day, null) >= propertyUnits
    }
    if (isFull) disabled.push(day)
  }
  return disabled
}

/**
 * Maximum number of units of `roomTypeId` (or the whole property) bookable
 * across the entire [from..to] range — the minimum free units across every day.
 * Returns 0 if any day is blocked or full. `null` range → the class capacity.
 */
export function maxUnitsForRange(
  data: AvailabilityPayload,
  roomTypeId: string | null | undefined,
  from?: Date,
  to?: Date
): number {
  const roomTypes = data.roomTypes ?? []
  const propertyUnits = Math.max(1, data.propertyUnits ?? 1)
  const capacity = roomTypeId
    ? roomTypes.find((r) => r.id === roomTypeId)?.totalUnits ?? 0
    : propertyUnits
  if (!from || !to) return capacity

  const spans = spansOf(data)
  const byClass = blockedSets(data)
  const wholeBlocked = byClass.get(null) ?? new Set<string>()
  const classBlocked = roomTypeId ? byClass.get(roomTypeId) ?? new Set<string>() : new Set<string>()

  let minFree = capacity
  for (const day of eachNightDay(toLocalDay(from), toLocalDay(to))) {
    const key = toDateOnlyString(day)
    if (wholeBlocked.has(key) || classBlocked.has(key)) return 0
    const free = capacity - takenOn(spans, day, roomTypeId ?? null)
    if (free < minFree) minFree = free
  }
  return Math.max(0, minFree)
}
