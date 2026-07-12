import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { formatNpr } from "@/lib/currency"
import { BOOKING_STATUS_LABELS } from "@/lib/booking-lifecycle"
import { getPagination, parsePage } from "@/lib/pagination"
import { PaginationControls } from "@/components/shared/pagination-controls"
import { BookingStatus, Prisma } from "@prisma/client"
import { CalendarDays, ChevronRight, TrendingUp, Users } from "lucide-react"

const STATUS_CHIP: Record<string, string> = {
  PENDING:    "bg-amber-50 text-amber-600 border-amber-200/60",
  CONFIRMED:  "bg-emerald-50 text-emerald-600 border-emerald-200/60",
  CHECKED_IN: "bg-sky-50 text-sky-600 border-sky-200/60",
  COMPLETED:  "bg-[#1B3A5C]/5 text-[#1B3A5C]/50 border-[#1B3A5C]/10",
  CANCELLED:  "bg-rose-50 text-rose-500 border-rose-200/60",
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

  const [total, revenue] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.aggregate({
      where,
      _sum: { totalPrice: true },
    }),
  ])
  const pagination = getPagination(requestedPage, total)

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: [{ checkIn: "asc" }, { createdAt: "desc" }],
    skip: pagination.skip,
    take: pagination.take,
    select: {
      id: true,
      status: true,
      checkIn: true,
      checkOut: true,
      totalPrice: true,
      bookingCode: true,
      guest: { select: { name: true, email: true } },
      property: { select: { title: true, id: true, location: true } },
    },
  })

  const stats = [
    { icon: CalendarDays, label: "Total stays",  value: total },
    { icon: Users,        label: "On this page", value: bookings.length },
    { icon: TrendingUp,   label: "Total value",  value: formatNpr(revenue._sum.totalPrice) },
  ]

  return (
    <div className="pb-12 space-y-8">

      {/* ── PAGE HEADER ── */}
      <div>
        <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.3em] mb-1">
          Guest Stays
        </p>
        <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">
          Reservations
        </h1>
        <p className="text-[12px] text-[#1B3A5C]/45 mt-1.5 max-w-xl">
          Confirmed, checked-in, and completed stays across your Salt Route properties.
        </p>
      </div>

      {/* ── STAT STRIP ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-4 sm:p-5">
            <Icon className="h-4 w-4 text-[#1B3A5C]/25 mb-3" />
            <p className="text-xl sm:text-2xl font-semibold text-[#1B3A5C] leading-tight tabular-nums break-words">{value}</p>
            <p className="text-[10px] text-[#1B3A5C]/40 mt-1 uppercase tracking-[0.2em] font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* ── STAYS LIST ── */}
      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_180px_120px_110px_90px_16px] gap-4 items-center px-5 py-3 border-b border-[#1B3A5C]/5">
          {["Guest & property", "Dates", "Value", "Status", "Code", ""].map((h) => (
            <p key={h} className="text-[10px] uppercase tracking-[0.15em] text-[#1B3A5C]/35 font-medium">{h}</p>
          ))}
        </div>

        {bookings.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarDays className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-3" />
            <p className="text-[13px] text-[#1B3A5C]/35 font-medium">No confirmed reservations yet</p>
            <p className="text-[11px] text-[#1B3A5C]/25 mt-1">Confirmed guest stays will appear here automatically</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1B3A5C]/5">
            {bookings.map((booking) => {
              const chip = STATUS_CHIP[booking.status] ?? STATUS_CHIP.COMPLETED
              const nights = Math.max(
                1,
                Math.round((booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24))
              )

              return (
                <Link
                  key={booking.id}
                  href={`/owner/bookings/${booking.id}`}
                  className="grid grid-cols-1 md:grid-cols-[1fr_180px_120px_110px_90px_16px] gap-2 md:gap-4 md:items-center px-5 py-4 hover:bg-[#FBF9F4] transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#1B3A5C] truncate">
                      {booking.guest.name || booking.guest.email}
                    </p>
                    <p className="text-[11px] text-[#1B3A5C]/40 truncate mt-0.5">
                      {booking.property.title} · {booking.property.location}
                    </p>
                  </div>

                  <div>
                    <p className="text-[12px] text-[#1B3A5C]/60 tabular-nums">
                      {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
                    </p>
                    <p className="text-[10px] text-[#1B3A5C]/35 mt-0.5">
                      {nights} night{nights !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <p className="text-[12px] font-semibold text-[#1B3A5C] tabular-nums">
                    {formatNpr(booking.totalPrice)}
                  </p>

                  <div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-semibold border uppercase tracking-[0.15em] ${chip}`}>
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </span>
                  </div>

                  <p className="font-mono text-[10px] text-[#1B3A5C]/40 truncate">
                    {booking.bookingCode}
                  </p>

                  <ChevronRight className="hidden md:block h-4 w-4 text-[#1B3A5C]/20 group-hover:text-[#1B3A5C]/40" />
                </Link>
              )
            })}
          </div>
        )}
      </div>

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
