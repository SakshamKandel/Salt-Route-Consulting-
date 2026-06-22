import Link from "next/link"
import { CalendarDays } from "lucide-react"
import { BOOKING_STATUS_LABELS } from "@/lib/booking-lifecycle"

const DAY_MS = 24 * 60 * 60 * 1000

type BookingGanttItem = {
  id: string
  bookingCode: string
  checkIn: Date | string
  checkOut: Date | string
  status: string
  units: number
  guests: number
  guest: { name: string | null } | null
  property: { title: string } | null
  roomType: { name: string; classType: string } | null
}

const STATUS_BAR_STYLES: Record<string, string> = {
  PENDING: "bg-amber-400",
  CONFIRMED: "bg-emerald-500",
  CHECKED_IN: "bg-sky-500",
  COMPLETED: "bg-blue-500",
  CANCELLED: "bg-red-400",
  NO_SHOW: "bg-orange-500",
}

const STATUS_DOT_STYLES: Record<string, string> = {
  PENDING: "bg-amber-400",
  CONFIRMED: "bg-emerald-500",
  CHECKED_IN: "bg-sky-500",
  COMPLETED: "bg-blue-500",
  CANCELLED: "bg-red-400",
  NO_SHOW: "bg-orange-500",
}

function dayStart(value: Date | string) {
  const date = new Date(value)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS)
}

function daysBetween(from: Date, to: Date) {
  return Math.max(0, Math.round((to.getTime() - from.getTime()) / DAY_MS))
}

function formatDay(date: Date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function formatLong(date: Date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

function buildTicks(start: Date, totalDays: number) {
  const targetTicks = totalDays <= 14 ? totalDays + 1 : 8
  const step = Math.max(1, Math.ceil(totalDays / targetTicks))
  const ticks: Date[] = []
  for (let day = 0; day <= totalDays; day += step) {
    ticks.push(addDays(start, day))
  }
  const end = addDays(start, totalDays)
  if (ticks[ticks.length - 1]?.getTime() !== end.getTime()) ticks.push(end)
  return ticks
}

export function BookingGanttChart({ bookings }: { bookings: BookingGanttItem[] }) {
  const items = bookings
    .map((booking) => ({
      ...booking,
      checkInDate: dayStart(booking.checkIn),
      checkOutDate: dayStart(booking.checkOut),
    }))
    .filter((booking) => booking.checkOutDate > booking.checkInDate)
    .sort((a, b) => a.checkInDate.getTime() - b.checkInDate.getTime())

  const rangeStart = items.length
    ? addDays(new Date(Math.min(...items.map((booking) => booking.checkInDate.getTime()))), -1)
    : dayStart(new Date())
  const rangeEnd = items.length
    ? addDays(new Date(Math.max(...items.map((booking) => booking.checkOutDate.getTime()))), 1)
    : addDays(rangeStart, 14)
  const totalDays = Math.max(1, daysBetween(rangeStart, rangeEnd))
  const ticks = buildTicks(rangeStart, totalDays)

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B3A5C]/5 text-[#1B3A5C]">
              <CalendarDays className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Booking Gantt Chart</h2>
              <p className="text-xs text-slate-500">
                Stay duration by property, room class, guest, and status.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(BOOKING_STATUS_LABELS).map(([status, label]) => (
            <span key={status} className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
              <span className={`h-2 w-2 rounded-full ${STATUS_DOT_STYLES[status] ?? "bg-slate-300"}`} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium text-slate-500">No bookings to plot for the current filters.</p>
          <p className="mt-1 text-xs text-slate-400">Change status, search, or date filters to see stay timelines.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[920px]">
            <div className="grid grid-cols-[260px_1fr] border-b border-slate-100 bg-slate-50/70">
              <div className="border-r border-slate-100 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Booking
              </div>
              <div className="relative px-4 py-3">
                <div className="relative h-8">
                  {ticks.map((tick) => {
                    const left = (daysBetween(rangeStart, tick) / totalDays) * 100
                    return (
                      <div
                        key={tick.toISOString()}
                        className="absolute top-0 flex h-full -translate-x-1/2 flex-col items-center justify-between"
                        style={{ left: `${left}%` }}
                      >
                        <span className="h-3 w-px bg-slate-200" />
                        <span className="whitespace-nowrap text-[10px] font-medium text-slate-400">{formatDay(tick)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div>
              {items.map((booking) => {
                const left = (daysBetween(rangeStart, booking.checkInDate) / totalDays) * 100
                const width = Math.max(
                  1.5,
                  (daysBetween(booking.checkInDate, booking.checkOutDate) / totalDays) * 100,
                )
                const nights = Math.max(1, daysBetween(booking.checkInDate, booking.checkOutDate))
                const roomLabel = booking.roomType?.name ?? "Entire property"

                return (
                  <div
                    key={booking.id}
                    className="grid min-h-[72px] grid-cols-[260px_1fr] border-b border-slate-100 last:border-b-0"
                  >
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="flex min-w-0 flex-col justify-center border-r border-slate-100 px-5 py-3 transition-colors hover:bg-slate-50"
                    >
                      <span className="font-mono text-[11px] font-semibold tracking-wider text-[#1B3A5C]">
                        {booking.bookingCode}
                      </span>
                      <span className="mt-1 truncate text-xs font-medium text-slate-700">
                        {booking.property?.title ?? "Untitled property"}
                      </span>
                      <span className="mt-0.5 truncate text-[11px] text-slate-400">
                        {roomLabel} · {booking.guest?.name ?? "Guest"}
                      </span>
                    </Link>

                    <div className="relative px-4 py-3">
                      <div className="absolute inset-y-0 left-4 right-4">
                        {ticks.map((tick) => {
                          const left = (daysBetween(rangeStart, tick) / totalDays) * 100
                          return (
                            <span
                              key={tick.toISOString()}
                              className="absolute top-0 h-full w-px bg-slate-100"
                              style={{ left: `${left}%` }}
                            />
                          )
                        })}
                      </div>

                      <div className="relative h-full min-h-[46px]">
                        <Link
                          href={`/admin/bookings/${booking.id}`}
                          className={`absolute top-1/2 flex min-h-9 -translate-y-1/2 items-center overflow-hidden rounded-lg px-3 text-left text-white shadow-sm transition-transform hover:scale-[1.01] ${
                            STATUS_BAR_STYLES[booking.status] ?? "bg-slate-400"
                          }`}
                          style={{ left: `${left}%`, width: `${width}%` }}
                          title={`${booking.bookingCode}: ${formatLong(booking.checkInDate)} to ${formatLong(booking.checkOutDate)}`}
                        >
                          <span className="min-w-0 truncate text-[11px] font-semibold">
                            {nights} night{nights === 1 ? "" : "s"} · {booking.guests} guest{booking.guests === 1 ? "" : "s"}
                            {booking.units > 1 ? ` · ${booking.units} units` : ""}
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
