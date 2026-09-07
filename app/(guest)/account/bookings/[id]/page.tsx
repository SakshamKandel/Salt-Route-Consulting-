import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CancelBookingButton } from "./CancelBookingButton"
import { ArrowLeft, Calendar, Users, MapPin, Star, Hash } from "lucide-react"
import { BOOKING_STATUS_LABELS, canReviewBooking } from "@/lib/booking-lifecycle"
import { formatNpr } from "@/lib/currency"

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return redirect("/login")

  const { id } = await params

  // Check if user has already reviewed this completed stay (fetched in
  // parallel with the booking; the review is keyed by the same booking id)
  const [booking, existingReview] = await Promise.all([
    prisma.booking.findUnique({
      where: { id },
      include: {
        property: { select: { title: true, location: true } },
        roomType: { select: { name: true, classType: true } },
      },
    }),
    prisma.review.findUnique({
      where: { bookingId: id },
      select: { id: true },
    }),
  ])

  if (!booking || booking.guestId !== session.user.id) {
    return redirect("/account/bookings")
  }

  const nights = Math.ceil(
    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)
  )

  const canReview = canReviewBooking(booking) && !existingReview

  const statusChip =
    booking.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" :
    booking.status === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200/60" :
    booking.status === "CHECKED_IN" ? "bg-sky-50 text-sky-700 border-sky-200/60" :
    booking.status === "COMPLETED" ? "bg-[#1B3A5C]/5 text-[#1B3A5C]/70 border-[#1B3A5C]/10" :
    booking.status === "NO_SHOW" ? "bg-amber-50 text-amber-700 border-amber-200/60" :
    "bg-rose-50 text-rose-600 border-rose-200/60"

  return (
    <div className="space-y-10">

      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-start gap-5">
          <Link
            href="/account/bookings"
            className="mt-1.5 w-9 h-9 flex items-center justify-center rounded-lg border border-[#1B3A5C]/10 text-[#1B3A5C]/40 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/25 transition-colors shrink-0"
            aria-label="Back to reservations"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <p className="text-[11px] text-[#C9A96E] uppercase tracking-[0.18em] font-medium mb-1.5 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {booking.property.location}
            </p>
            <h1 className="font-display text-3xl md:text-4xl text-[#1B3A5C] tracking-wide">{booking.property.title}</h1>
            {booking.roomType && (
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#1B3A5C]/55 mt-2 font-medium">{booking.roomType.name}</p>
            )}
          </div>
        </div>
        <span className={`inline-flex items-center rounded-full text-[11px] font-semibold border uppercase tracking-[0.1em] px-2.5 py-1 shrink-0 ${statusChip}`}>
          {BOOKING_STATUS_LABELS[booking.status]}
        </span>
      </div>

      {/* ─── BOOKING DETAILS GRID ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-6 sm:p-7">
          <Calendar className="w-4 h-4 text-[#1B3A5C]/25 mb-3 stroke-[1.5]" />
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#1B3A5C]/55 font-medium mb-1.5">Check in</p>
          <p className="text-base font-semibold text-[#1B3A5C]">
            {new Date(booking.checkIn).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-6 sm:p-7">
          <Calendar className="w-4 h-4 text-[#1B3A5C]/25 mb-3 stroke-[1.5]" />
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#1B3A5C]/55 font-medium mb-1.5">Check out</p>
          <p className="text-base font-semibold text-[#1B3A5C]">
            {new Date(booking.checkOut).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-6 sm:p-7">
          <Users className="w-4 h-4 text-[#1B3A5C]/25 mb-3 stroke-[1.5]" />
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#1B3A5C]/55 font-medium mb-1.5">Guests</p>
          <p className="text-base font-semibold text-[#1B3A5C] tabular-nums">{booking.guests} Guests</p>
        </div>
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-6 sm:p-7">
          <Hash className="w-4 h-4 text-[#1B3A5C]/25 mb-3 stroke-[1.5]" />
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#1B3A5C]/55 font-medium mb-1.5">Reference</p>
          <p className="text-base font-semibold text-[#1B3A5C] font-mono tracking-wider">{booking.bookingCode}</p>
        </div>
      </div>

      {/* ─── PRICING & INVOICE SUMMARY ─── */}
      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[#1B3A5C]/8">
          <div>
            <p className="text-[9px] uppercase tracking-[0.25em] text-[#1B3A5C]/40 font-medium">Reservation Invoice</p>
            <h2 className="font-display text-lg text-[#1B3A5C] tracking-wide mt-0.5">Stay Summary</h2>
          </div>
          <Image
            src="/brand/logo.png"
            alt="Salt Route"
            width={1947}
            height={808}
            priority
            className="h-7 w-auto object-contain"
          />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between text-[14px] text-[#1B3A5C]/65">
            <span>{nights} night{nights > 1 ? "s" : ""} x {formatNpr(Number(booking.totalPrice) / nights)}</span>
            <span className="tabular-nums">{formatNpr(booking.totalPrice)}</span>
          </div>
          <div className="pt-4 border-t border-[#1B3A5C]/5 flex justify-between items-center">
            <span className="text-[11px] uppercase tracking-[0.18em] text-[#1B3A5C]/55 font-medium">Total</span>
            <span className="font-display text-2xl text-[#1B3A5C] tracking-wide tabular-nums">{formatNpr(booking.totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* ─── NOTES ─── */}
      {booking.notes && (
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#1B3A5C]/55 font-medium mb-4">Special Requests</p>
          <p className="text-[15px] text-[#1B3A5C]/70 leading-relaxed italic">{booking.notes}</p>
        </div>
      )}

      {/* ─── CANCELLATION INFO ─── */}
      {booking.cancellationReason && (
        <div className="bg-rose-50/60 border border-rose-200/60 rounded-xl p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.18em] text-rose-600 font-medium mb-4">Cancellation Note</p>
          <p className="text-[15px] text-rose-700/90 leading-relaxed">{booking.cancellationReason}</p>
        </div>
      )}

      {/* ─── STATUS TIMELINE ─── */}
      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-6 sm:p-8">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#1B3A5C]/55 font-medium mb-6">Journey Timeline</p>
        <div className="flex flex-col gap-6">
          <TimelineStep label="Requested" date={booking.createdAt} active />
          <TimelineStep
            label="Confirmed"
            active={["CONFIRMED", "CHECKED_IN", "COMPLETED"].includes(booking.status)}
            note={booking.status === "PENDING" ? "Awaiting Salt Route confirmation" : undefined}
          />
          <TimelineStep
            label="Checked in"
            active={["CHECKED_IN", "COMPLETED"].includes(booking.status)}
          />
          <TimelineStep
            label="Checked out"
            active={booking.status === "COMPLETED"}
            note={booking.status === "COMPLETED" ? "We hope you enjoyed your stay" : undefined}
          />
          {booking.status === "CANCELLED" && (
            <TimelineStep label="Cancelled" active color="red" />
          )}
          {booking.status === "NO_SHOW" && (
            <TimelineStep label="No Show" active color="orange" />
          )}
        </div>
      </div>

      {/* ─── REVIEW PROMPT ─── */}
      {canReview && (
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-8 sm:p-12 text-center">
          <Star className="w-6 h-6 text-[#C9A96E]/60 mx-auto mb-4 stroke-[1.5]" />
          <h3 className="font-display text-xl text-[#1B3A5C] tracking-wide mb-2">
            Your stay at {booking.property.title} is complete
          </h3>
          <p className="text-[14px] text-[#1B3A5C]/60 mb-6 max-w-sm mx-auto">
            We would love to hear about your experience.
          </p>
          <Link
            href={`/account/reviews?booking=${booking.id}`}
            className="inline-flex items-center px-6 py-3 bg-[#1B3A5C] text-[#FFFAF3] rounded-lg text-[13px] font-medium hover:bg-[#2A4F7A] transition-colors"
          >
            Share Experience
          </Link>
        </div>
      )}

      {/* ─── ACTIONS ─── */}
      {booking.status === "PENDING" && (
        <CancelBookingButton bookingId={booking.id} />
      )}
    </div>
  )
}

function TimelineStep({ label, date, active, note, color = "navy" }: {
  label: string
  date?: Date | string
  active: boolean
  note?: string
  color?: string
}) {
  const dotColor = !active ? "bg-[#1B3A5C]/10" : color === "red" ? "bg-rose-400" : color === "orange" ? "bg-amber-400" : "bg-[#1B3A5C]"
  return (
    <div className="flex gap-5 items-start">
      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
      <div>
        <p className={`text-[15px] font-medium ${active ? "text-[#1B3A5C]" : "text-[#1B3A5C]/55"}`}>{label}</p>
        {date && (
          <p className="text-[11px] text-[#1B3A5C]/55 mt-1 uppercase tracking-[0.15em] font-medium">
            {new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
        {note && <p className="text-[13px] text-[#1B3A5C]/60 mt-1 italic">{note}</p>}
      </div>
    </div>
  )
}
