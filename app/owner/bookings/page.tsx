import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { formatNpr } from "@/lib/currency"
import { BOOKING_STATUS_LABELS } from "@/lib/booking-lifecycle"
import { getPagination, parsePage } from "@/lib/pagination"
import { PaginationControls } from "@/components/shared/pagination-controls"
import { BookingStatus, Prisma } from "@prisma/client"
import { ArrowRight, CalendarDays, Home, Users } from "lucide-react"

const statusStyles: Record<string, { color: string; border: string; bg: string }> = {
  CONFIRMED: { color: "rgba(96,165,250,0.9)", border: "rgba(96,165,250,0.22)", bg: "rgba(96,165,250,0.06)" },
  CHECKED_IN: { color: "rgba(52,211,153,0.9)", border: "rgba(52,211,153,0.22)", bg: "rgba(52,211,153,0.06)" },
  COMPLETED: { color: "rgba(27,58,92,0.45)", border: "rgba(27,58,92,0.12)", bg: "rgba(27,58,92,0.025)" },
}

function formatDate(value: Date) {
  return value.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export default async function OwnerBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const params = await searchParams
  const requestedPage = parsePage(params.page)

  const visibleStatuses: BookingStatus[] = ["CONFIRMED", "CHECKED_IN", "COMPLETED"]
  const where: Prisma.BookingWhereInput = {
    property: { ownerId: session.user.id },
    status: { in: visibleStatuses },
  }

  const total = await prisma.booking.count({ where })
  const pagination = getPagination(requestedPage, total)

  const [bookings, revenue] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: [{ checkIn: "asc" }, { createdAt: "desc" }],
      skip: pagination.skip,
      take: pagination.take,
      include: {
        guest: { select: { name: true, email: true } },
        property: { select: { title: true, id: true, location: true } },
      },
    }),
    prisma.booking.aggregate({
      where,
      _sum: { totalPrice: true },
    }),
  ])

  return (
    <div className="space-y-14">
      <section className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="h-px w-8 bg-gold/40" />
            <p className="text-[9px] uppercase tracking-[0.45em] text-gold/60">Guest Stays</p>
          </div>
          <h1 className="font-display text-4xl leading-[1.12] tracking-wide text-[#1B3A5C] md:text-5xl">
            Guest stays, property by property.
          </h1>
          <p className="max-w-2xl text-sm font-light leading-[1.85] text-[#1B3A5C]/50">
            A clear view of confirmed, checked-in, and completed stays across your Salt Route properties.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-px bg-[#1B3A5C]/5">
          {[
            ["Total", total],
            ["Shown", bookings.length],
            ["Value", formatNpr(revenue._sum.totalPrice)],
          ].map(([label, value]) => (
            <div key={label} className="bg-[#FFFDF8] p-5">
              <p className="text-[8px] uppercase tracking-[0.28em] text-[#1B3A5C]/40">{label}</p>
              <p className="mt-3 break-words font-display text-2xl text-gold/75">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {bookings.length > 0 ? (
        <section className="grid grid-cols-1 gap-px bg-[#1B3A5C]/5 xl:grid-cols-2">
          {bookings.map((booking) => {
            const status = statusStyles[booking.status] ?? statusStyles.COMPLETED
            const nights = Math.max(
              1,
              Math.round((booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24))
            )

            return (
              <Link
                key={booking.id}
                href={`/owner/bookings/${booking.id}`}
                className="group bg-[#FFFDF8] p-6 transition-colors duration-500 hover:bg-[#F5F1E8] sm:p-7"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-mono text-[9.5px] text-[#1B3A5C]/40 transition-colors duration-500 group-hover:text-[#1B3A5C]">
                      {booking.bookingCode}
                    </p>
                    <h2 className="mt-3 font-display text-2xl tracking-wide text-[#1B3A5C]">
                      {booking.property.title}
                    </h2>
                    <p className="mt-2 text-[9px] uppercase tracking-[0.25em] text-gold/45">
                      {booking.property.location}
                    </p>
                  </div>
                  <span
                    className="self-start px-4 py-2 text-[8px] uppercase tracking-[0.28em]"
                    style={{ color: status.color, border: `1px solid ${status.border}`, background: status.bg }}
                  >
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </span>
                </div>

                <div className="mt-8 grid gap-px bg-[#1B3A5C]/5 sm:grid-cols-3">
                  <div className="bg-[#FFFDF8] p-4">
                    <CalendarDays className="mb-4 h-4 w-4 text-gold/35 stroke-[1.3]" />
                    <p className="text-[8px] uppercase tracking-[0.25em] text-[#1B3A5C]/30">Dates</p>
                    <p className="mt-2 text-[12px] font-light leading-[1.6] text-[#1B3A5C]/70">
                      {formatDate(booking.checkIn)} to {formatDate(booking.checkOut)}
                    </p>
                  </div>
                  <div className="bg-[#FFFDF8] p-4">
                    <Users className="mb-4 h-4 w-4 text-gold/35 stroke-[1.3]" />
                    <p className="text-[8px] uppercase tracking-[0.25em] text-[#1B3A5C]/30">Guest</p>
                    <p className="mt-2 text-[12px] font-light leading-[1.6] text-[#1B3A5C]/70">
                      {booking.guest.name || booking.guest.email}
                    </p>
                  </div>
                  <div className="bg-[#FFFDF8] p-4">
                    <Home className="mb-4 h-4 w-4 text-gold/35 stroke-[1.3]" />
                    <p className="text-[8px] uppercase tracking-[0.25em] text-[#1B3A5C]/30">Value</p>
                    <p className="mt-2 font-display text-xl text-gold/72">
                      {formatNpr(booking.totalPrice)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#1B3A5C]/8 pt-5">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-[#1B3A5C]/40">
                    {nights} night{nights !== 1 ? "s" : ""} stay
                  </p>
                  <span className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-gold/55 transition-colors duration-500 group-hover:text-gold">
                    Stay Details
                    <ArrowRight className="h-3.5 w-3.5 stroke-[1.3] transition-transform duration-500 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            )
          })}
        </section>
      ) : (
        <div className="border border-[#1B3A5C]/8 py-24 text-center">
          <CalendarDays className="mx-auto mb-6 h-8 w-8 text-gold/24 stroke-[1.2]" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#1B3A5C]/30">
            No confirmed reservations in your portfolio
          </p>
          <p className="mt-3 text-[11px] font-light text-[#1B3A5C]/30">
            Confirmed guest stays will appear here automatically.
          </p>
        </div>
      )}

      <PaginationControls
        basePath="/owner/bookings"
        page={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={total}
        startItem={pagination.startItem}
        endItem={pagination.endItem}
        label="reservations"
      />
    </div>
  )
}
