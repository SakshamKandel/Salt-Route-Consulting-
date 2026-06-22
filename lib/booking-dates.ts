// Shared calendar-day helpers for bookings.
//
// Bookings created through the public form historically stored check-in/out as
// local-midnight ISO timestamps (e.g. Nepal midnight = previous day 18:15 UTC),
// while admin-created ones stored UTC midnight. Rounding to the NEAREST
// midnight before truncating absorbs both formats, so a stay saved for
// June 10 always renders as June 10 regardless of which path created it.

const DAY_MS = 24 * 60 * 60 * 1000

/** Normalize a stored timestamp to local midnight of the calendar day it represents. */
export function toLocalDay(value: string | Date): Date {
  const d = new Date(value)
  const rounded = new Date(d.getTime() + DAY_MS / 2)
  return new Date(rounded.getFullYear(), rounded.getMonth(), rounded.getDate())
}

/** Normalize a stored timestamp to UTC midnight of the calendar day it represents (server-side). */
export function toUtcDay(value: string | Date): Date {
  const d = new Date(value)
  const rounded = new Date(d.getTime() + DAY_MS / 2)
  return new Date(Date.UTC(rounded.getUTCFullYear(), rounded.getUTCMonth(), rounded.getUTCDate()))
}

/** "yyyy-MM-dd" from local date parts (timezone-safe, unlike toISOString). */
export function toDateOnlyString(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${m}-${day}`
}

/** Every calendar day from `from` to `to`, both ends INCLUSIVE. */
export function eachDayInclusive(from: Date, to: Date): Date[] {
  const days: Date[] = []
  const cur = new Date(from)
  while (cur <= to) {
    days.push(new Date(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

/** Every calendar day from `from` up to (but NOT including) `to` — night-based [checkIn, checkOut). */
export function eachNightDay(from: Date, to: Date): Date[] {
  const days: Date[] = []
  const cur = new Date(from)
  while (cur < to) {
    days.push(new Date(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

/** Number of nights between two day-normalized dates. */
export function nightsBetween(checkIn: Date, checkOut: Date): number {
  return Math.max(0, Math.round((checkOut.getTime() - checkIn.getTime()) / DAY_MS))
}
