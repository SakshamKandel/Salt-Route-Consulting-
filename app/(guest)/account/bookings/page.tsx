import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import Image from "next/image"
import { BookingStatus, Prisma } from "@prisma/client"
import { getPrimaryImageUrl } from "@/lib/property-media"
import { BOOKING_STATUS_LABELS } from "@/lib/booking-lifecycle"
import { formatNpr } from "@/lib/currency"
import { ArrowRight, Calendar, MapPin } from "lucide-react"
import { getPagination, parsePage } from "@/lib/pagination"
import { PaginationControls } from "@/components/shared/pagination-controls"

const STATUS_CHIP: Record<string, string> = {
  PENDING:    "bg-amber-50 text-amber-700 border-amber-200/60",
  CONFIRMED:  "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  CHECKED_IN: "bg-sky-50 text-sky-700 border-sky-200/60",
  COMPLETED:  "bg-[#1B3A5C]/5 text-[#1B3A5C]/70 border-[#1B3A5C]/10",
  CANCELLED:  "bg-rose-50 text-rose-600 border-rose-200/60",
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()
  if (!session?.user?.id) return null

  const resolvedParams = await searchParams
  const statusFilter = resolvedParams.status as string | undefined
  const requestedPage = parsePage(resolvedParams.page)

  const whereClause: Prisma.BookingWhereInput = { guestId: session.user.id }
  if (
    statusFilter &&
    statusFilter !== "ALL" &&
    Object.values(BookingStatus).includes(statusFilter as BookingStatus)
  ) {
    whereClause.status = statusFilter as BookingStatus
  }
  const total = await prisma.booking.count({ where: whereClause })
  const pagination = getPagination(requestedPage, total)

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    skip: pagination.skip,
    take: pagination.take,
    select: {
      id: true,
      status: true,
      checkIn: true,
      checkOut: true,
      totalPrice: true,
      bookingCode: true,
      property: {
        select: {
          title: true,
          location: true,
          images: {
            take: 1,
            orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
            select: { url: true, isPrimary: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" }
  })

  const statuses = ["ALL", "PENDING", "CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED"]

  return (
    <div className="space-y-10">
      {/* ─── PAGE HEADER ─── */}
      <div>
        <p className="text-[11px] font-medium text-[#C9A96E] uppercase tracking-[0.18em] mb-1.5">
          Guest Journey
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-[#1B3A5C] tracking-wide">
          Your Reservations
        </h1>
        <p className="text-[15px] leading-relaxed text-[#1B3A5C]/70 mt-2">
          Every stay you have planned with Salt Route, past and upcoming.
        </p>
      </div>

      {/* ─── FILTER TABS ─── */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {statuses.map((status) => {
          const isActive = (!statusFilter && status === "ALL") || statusFilter === status
          return (
            <Link
              key={status}
              href={status === "ALL" ? "/account/bookings" : `/account/bookings?status=${status}`}
              className={`rounded-full text-[12px] uppercase tracking-[0.1em] px-4 py-2.5 border font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-[#1B3A5C] text-[#FFFAF3] border-[#1B3A5C]"
                  : "bg-[#FFFAF3] text-[#1B3A5C]/60 border-[#1B3A5C]/10 hover:border-[#1B3A5C]/25 hover:text-[#1B3A5C]/80"
              }`}
            >
              {status.replace("_", " ")}
            </Link>
          )
        })}
      </div>

      {/* ─── BOOKING CARDS ─── */}
      {bookings.length === 0 ? (
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-8 sm:p-16 text-center">
          <Calendar className="h-8 w-8 text-[#1B3A5C]/15 mx-auto mb-4" strokeWidth={1.5} />
          <h3 className="font-display text-xl text-[#1B3A5C] tracking-wide mb-2">No reservations found</h3>
          <p className="text-[14px] text-[#1B3A5C]/60 mb-6 max-w-sm mx-auto">
            When you reserve a stay, it will appear here with every detail at hand.
          </p>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B3A5C] text-[#FFFAF3] rounded-lg text-[13px] font-medium hover:bg-[#2A4F7A] transition-colors"
          >
            Browse stays <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {bookings.map((booking) => {
            const imageUrl = getPrimaryImageUrl(booking.property.images) || "/placeholder-property.jpg"
            const nights = Math.ceil(
              (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)
            )
            const chip = STATUS_CHIP[booking.status] ?? STATUS_CHIP.PENDING

            return (
              <Link
                key={booking.id}
                href={`/account/bookings/${booking.id}`}
                className="group flex flex-col md:flex-row bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl overflow-hidden hover:border-[#1B3A5C]/15 transition-colors"
              >
                {/* Image */}
                <div className="relative w-full md:w-64 lg:w-72 aspect-[16/10] md:aspect-auto md:min-h-[200px] overflow-hidden shrink-0 bg-[#1B3A5C]/5">
                  <Image
                    src={imageUrl}
                    alt={booking.property.title}
                    fill
                    sizes="(min-width: 768px) 320px, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className={`absolute top-3 left-3 inline-flex items-center rounded-full text-[11px] font-semibold border uppercase tracking-[0.1em] px-2.5 py-1 ${chip}`}>
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 sm:p-6 md:p-7 flex flex-col justify-between gap-5">
                  <div>
                    <p className="text-[11px] text-[#C9A96E] uppercase tracking-[0.18em] font-medium mb-1.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {booking.property.location}
                    </p>
                    <h3 className="font-display text-xl md:text-2xl text-[#1B3A5C] tracking-wide">
                      {booking.property.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                    <div>
                      <p className="text-[11px] text-[#1B3A5C]/55 uppercase tracking-[0.18em] font-medium mb-1">Check in</p>
                      <p className="text-base font-semibold text-[#1B3A5C]">
                        {new Date(booking.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#1B3A5C]/55 uppercase tracking-[0.18em] font-medium mb-1">Check out</p>
                      <p className="text-base font-semibold text-[#1B3A5C]">
                        {new Date(booking.checkOut).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#1B3A5C]/55 uppercase tracking-[0.18em] font-medium mb-1">Duration</p>
                      <p className="text-base font-semibold text-[#1B3A5C] tabular-nums">
                        {nights} night{nights !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#1B3A5C]/55 uppercase tracking-[0.18em] font-medium mb-1">Total</p>
                      <p className="text-base font-semibold text-[#1B3A5C] tabular-nums">
                        {formatNpr(booking.totalPrice)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#1B3A5C]/5 flex items-center justify-between">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#1B3A5C]/55 font-medium">
                      Ref: {booking.bookingCode}
                    </p>
                    <span className="flex items-center gap-1.5 text-[13px] font-medium text-[#1B3A5C]/60 group-hover:text-[#1B3A5C] transition-colors">
                      Stay details
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
      <PaginationControls
        basePath="/account/bookings"
        page={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={total}
        startItem={pagination.startItem}
        endItem={pagination.endItem}
        params={{ status: statusFilter }}
        label="reservations"
      />
    </div>
  )
}
