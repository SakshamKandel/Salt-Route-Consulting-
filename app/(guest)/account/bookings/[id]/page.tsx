import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { CancelBookingButton } from "./CancelBookingButton"
import { ArrowLeft, Calendar, Users, MapPin, Star } from "lucide-react"
import { BOOKING_STATUS_LABELS, canReviewBooking } from "@/lib/booking-lifecycle"
import { formatNpr } from "@/lib/currency"

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return redirect("/login")
  
  const { id } = await params

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { property: true }
  })

  if (!booking || booking.guestId !== session.user.id) {
    return redirect("/account/bookings")
  }

  // Check if user has already reviewed this completed stay
  const existingReview = await prisma.review.findUnique({
    where: { bookingId: booking.id }
  })

  const nights = Math.ceil(
    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)
  )

  const canReview = canReviewBooking(booking) && !existingReview

  const statusColor = 
    booking.status === "CONFIRMED" ? "border-charcoal/20 text-charcoal bg-charcoal/[0.02]" :
    booking.status === "PENDING" ? "border-gold/30 text-gold-dark bg-gold/5" :
    booking.status === "CHECKED_IN" ? "border-blue-200 text-blue-500 bg-blue-50" :
    booking.status === "COMPLETED" ? "border-emerald-200 text-emerald-500 bg-emerald-50" :
    booking.status === "NO_SHOW" ? "border-orange-200 text-orange-500 bg-orange-50" :
    "border-red-200 text-red-500 bg-red-50"

  return (
    <div className="space-y-16">

      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <Link href="/account/bookings" className="text-charcoal/30 hover:text-charcoal transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display text-2xl text-charcoal uppercase tracking-widest">{booking.property.title}</h1>
            <p className="text-[9px] uppercase tracking-[0.3em] text-charcoal/30 mt-2 font-sans">{booking.property.location}</p>
          </div>
        </div>
        <div className={`px-5 py-2.5 text-[8px] uppercase tracking-[0.4em] border ${statusColor}`}>
          {BOOKING_STATUS_LABELS[booking.status]}
        </div>
      </div>

      {/* ─── BOOKING DETAILS GRID ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-charcoal/5 border border-charcoal/5">
        <div className="bg-white p-10 flex flex-col gap-2">
          <Calendar className="w-4 h-4 text-charcoal/20 mb-2 stroke-[1.2]" />
          <p className="text-[8px] uppercase tracking-[0.4em] text-charcoal/25">Check In</p>
          <p className="text-lg font-display text-charcoal uppercase tracking-widest">
            {new Date(booking.checkIn).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="bg-white p-10 flex flex-col gap-2">
          <Calendar className="w-4 h-4 text-charcoal/20 mb-2 stroke-[1.2]" />
          <p className="text-[8px] uppercase tracking-[0.4em] text-charcoal/25">Check Out</p>
          <p className="text-lg font-display text-charcoal uppercase tracking-widest">
            {new Date(booking.checkOut).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="bg-white p-10 flex flex-col gap-2">
          <Users className="w-4 h-4 text-charcoal/20 mb-2 stroke-[1.2]" />
          <p className="text-[8px] uppercase tracking-[0.4em] text-charcoal/25">Guests</p>
          <p className="text-lg font-display text-charcoal uppercase tracking-widest">{booking.guests} Guests</p>
        </div>
        <div className="bg-white p-10 flex flex-col gap-2">
          <MapPin className="w-4 h-4 text-charcoal/20 mb-2 stroke-[1.2]" />
          <p className="text-[8px] uppercase tracking-[0.4em] text-charcoal/25">Reference</p>
          <p className="text-sm font-mono text-charcoal/40 tracking-wider">{booking.bookingCode}</p>
        </div>
      </div>

      {/* ─── PRICING ─── */}
      <div className="border border-charcoal/5 bg-white p-10">
        <p className="text-[9px] uppercase tracking-[0.4em] text-charcoal/30 mb-8 font-sans font-bold">Pricing Breakdown</p>
        <div className="space-y-4">
          <div className="flex justify-between text-charcoal/50 text-sm font-sans">
            <span>{nights} night{nights > 1 ? "s" : ""} x {formatNpr(Number(booking.totalPrice) / nights)}</span>
            <span>{formatNpr(booking.totalPrice)}</span>
          </div>
          <div className="pt-4 border-t border-charcoal/5 flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-[0.3em] text-charcoal/25 font-bold">Total Amount</span>
            <span className="text-2xl font-display text-charcoal tracking-widest">{formatNpr(booking.totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* ─── NOTES ─── */}
      {booking.notes && (
        <div className="border border-charcoal/5 bg-white p-10">
          <p className="text-[9px] uppercase tracking-[0.4em] text-charcoal/30 mb-6 font-sans font-bold">Special Requests</p>
          <p className="text-charcoal/60 text-sm leading-relaxed font-sans font-light italic">{booking.notes}</p>
        </div>
      )}

      {/* ─── CANCELLATION INFO ─── */}
      {booking.cancellationReason && (
        <div className="border border-red-900/20 bg-red-950/10 p-10">
          <p className="text-[9px] uppercase tracking-[0.4em] text-red-400/60 mb-6 font-sans font-bold">Cancellation Reason</p>
          <p className="text-red-300/80 text-sm leading-relaxed font-sans font-light">{booking.cancellationReason}</p>
        </div>
      )}

      {/* ─── STATUS TIMELINE ─── */}
      <div className="border border-charcoal/5 bg-white p-10">
        <p className="text-[9px] uppercase tracking-[0.4em] text-charcoal/30 mb-8 font-sans font-bold">Journey Timeline</p>
        <div className="flex flex-col gap-6">
          <TimelineStep label="Requested" date={booking.createdAt} active />
          <TimelineStep
            label="Confirmed"
            active={["CONFIRMED", "CHECKED_IN", "COMPLETED"].includes(booking.status)}
            note={booking.status === "PENDING" ? "Awaiting host approval" : undefined}
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
        <div className="border border-charcoal/10 bg-charcoal/[0.02] p-12 text-center">
          <Star className="w-6 h-6 text-charcoal/20 mx-auto mb-6 stroke-[1.2]" />
          <p className="text-[11px] uppercase tracking-[0.4em] text-charcoal/60 font-sans mb-8 leading-loose">
            Your stay at {booking.property.title} is complete.<br/>We would love to hear about your experience.
          </p>
          <Link
            href={`/account/reviews?booking=${booking.id}`}
            className="inline-block bg-charcoal text-white px-12 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-charcoal/90 transition-all duration-300"
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

function TimelineStep({ label, date, active, note, color = "charcoal" }: {
  label: string
  date?: Date | string
  active: boolean
  note?: string
  color?: string
}) {
  const dotColor = !active ? "bg-charcoal/10" : color === "red" ? "bg-red-400" : color === "orange" ? "bg-orange-400" : "bg-charcoal"
  return (
    <div className="flex gap-6 items-start">
      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
      <div>
        <p className={`text-sm font-sans tracking-tight ${active ? "text-charcoal" : "text-charcoal/20"}`}>{label}</p>
        {date && <p className="text-[9px] text-charcoal/30 mt-1 uppercase tracking-wider">{new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>}
        {note && <p className="text-[9px] text-charcoal/40 mt-1 italic font-sans">{note}</p>}
      </div>
    </div>
  )
}
