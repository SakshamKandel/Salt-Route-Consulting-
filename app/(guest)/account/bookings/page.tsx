import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import Image from "next/image"
import { BookingStatus, Prisma } from "@prisma/client"
import { getPrimaryImageUrl } from "@/lib/property-media"
import { BOOKING_STATUS_LABELS } from "@/lib/booking-lifecycle"
import { formatNpr } from "@/lib/currency"
import { ArrowRight, Calendar } from "lucide-react"
import { getPagination, parsePage } from "@/lib/pagination"
import { PaginationControls } from "@/components/shared/pagination-controls"

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
    include: {
      property: {
        include: { images: { take: 1, orderBy: [{ isPrimary: "desc" }, { order: "asc" }] } }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  const statuses = ["ALL", "PENDING", "CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED"]

  return (
    <div className="space-y-12">
      {/* ─── PAGE HEADER ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <div className="w-8 h-[1px] bg-charcoal/20" />
          <h1 className="text-[11px] uppercase tracking-[0.3em] text-charcoal/50 font-medium">
            Your Reservations
          </h1>
        </div>
      </div>

      {/* ─── FILTER TABS ─── */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {statuses.map((status) => {
          const isActive = (!statusFilter && status === "ALL") || statusFilter === status
          return (
            <Link
              key={status}
              href={status === "ALL" ? "/account/bookings" : `/account/bookings?status=${status}`}
              className={`text-[9px] uppercase tracking-[0.2em] px-5 py-2.5 border transition-all duration-300 whitespace-nowrap ${
                isActive
                  ? "bg-charcoal text-white border-charcoal"
                  : "bg-white text-charcoal/40 border-charcoal/10 hover:border-charcoal/20 hover:text-charcoal/60"
              }`}
            >
              {status.replace("_", " ")}
            </Link>
          )
        })}
      </div>

      {/* ─── BOOKING CARDS ─── */}
      {bookings.length === 0 ? (
        <div className="text-center py-24 bg-white border border-charcoal/5">
          <Calendar className="w-8 h-8 text-charcoal/15 mx-auto mb-6" strokeWidth={1} />
          <p className="text-charcoal/40 text-sm font-sans mb-6">No reservations found</p>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 bg-charcoal text-white px-8 py-3.5 text-[9px] uppercase tracking-[0.3em] hover:bg-charcoal/90 transition-colors"
          >
            <span>Browse Properties</span>
            <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const imageUrl = getPrimaryImageUrl(booking.property.images) || "/placeholder-property.jpg"
            const nights = Math.ceil(
              (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)
            )

            return (
              <Link
                key={booking.id}
                href={`/account/bookings/${booking.id}`}
                className="group block bg-white border border-charcoal/5 hover:border-charcoal/15 transition-all duration-300 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="relative w-full md:w-64 lg:w-80 aspect-[16/10] md:aspect-auto md:min-h-[200px] overflow-hidden shrink-0">
                    <Image
                      src={imageUrl}
                      alt={booking.property.title}
                      fill
                      sizes="(min-width: 768px) 320px, 100vw"
                      className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                        <div>
                          <h3 className="font-display text-xl md:text-2xl text-charcoal tracking-wide mb-1 group-hover:text-charcoal/70 transition-colors">
                            {booking.property.title}
                          </h3>
                          <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/30">
                            {booking.property.location}
                          </p>
                        </div>
                        <span className={`text-[8px] uppercase tracking-[0.2em] px-3 py-1.5 border shrink-0 ${
                          booking.status === "CONFIRMED" ? "border-charcoal/15 text-charcoal/60 bg-charcoal/[0.02]" :
                          booking.status === "PENDING" ? "border-gold/30 text-gold-dark bg-gold/5" :
                          booking.status === "CHECKED_IN" ? "border-blue-200 text-blue-500 bg-blue-50" :
                          booking.status === "COMPLETED" ? "border-charcoal/10 text-charcoal/40" :
                          "border-red-200 text-red-400 bg-red-50"
                        }`}>
                          {BOOKING_STATUS_LABELS[booking.status]}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <div>
                          <p className="text-[8px] uppercase tracking-[0.2em] text-charcoal/25 mb-1">Check In</p>
                          <p className="text-sm text-charcoal/70 font-sans">
                            {new Date(booking.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] uppercase tracking-[0.2em] text-charcoal/25 mb-1">Check Out</p>
                          <p className="text-sm text-charcoal/70 font-sans">
                            {new Date(booking.checkOut).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] uppercase tracking-[0.2em] text-charcoal/25 mb-1">Duration</p>
                          <p className="text-sm text-charcoal/70 font-sans">
                            {nights} night{nights !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] uppercase tracking-[0.2em] text-charcoal/25 mb-1">Total</p>
                          <p className="text-sm text-charcoal font-display tracking-wider">
                            {formatNpr(booking.totalPrice)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-charcoal/5 flex items-center justify-between">
                      <p className="text-[8px] uppercase tracking-[0.2em] text-charcoal/20">
                        Ref: {booking.bookingCode}
                      </p>
                      <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-charcoal/30 group-hover:text-charcoal/60 transition-colors">
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
                      </span>
                    </div>
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
