import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mail, Phone, User, Home, FileText, Calendar, Clock, Banknote, Check } from "lucide-react"
import { BookingActions } from "./BookingActions"
import { BOOKING_STATUS_LABELS } from "@/lib/booking-lifecycle"
import { formatNpr } from "@/lib/currency"

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-200/60",
  CONFIRMED: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
  CHECKED_IN: "bg-sky-50 text-sky-600 border-sky-200/60",
  COMPLETED: "bg-[#1B3A5C]/5 text-[#1B3A5C]/60 border-[#1B3A5C]/10",
  CANCELLED: "bg-rose-50 text-rose-600 border-rose-200/60",
  NO_SHOW: "bg-orange-50 text-orange-600 border-orange-200/60",
}

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      guest: true,
      property: true,
      roomType: { select: { name: true, classType: true } },
    }
  })

  if (!booking) return notFound()

  const nights = Math.ceil(
    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)
  )

  const card = "bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl"
  const microLabel = "text-[10px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.2em]"

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/bookings"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#1B3A5C]/40 hover:text-[#1B3A5C] hover:bg-[#1B3A5C]/5 transition-colors shrink-0"
            aria-label="Back to bookings"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Reservation</p>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide font-mono">{booking.bookingCode}</h1>
              <span className={`inline-flex rounded-full text-[9px] font-semibold border uppercase tracking-[0.15em] px-2.5 py-1 ${STATUS_STYLES[booking.status] || "bg-[#1B3A5C]/5 text-[#1B3A5C]/60 border-[#1B3A5C]/10"}`}>
                {BOOKING_STATUS_LABELS[booking.status]}
              </span>
            </div>
            <p className="text-[13px] text-[#1B3A5C]/45 mt-1">
              Requested on {booking.createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* ─── STATUS ACTIONS ─── */}
        <BookingActions booking={{ id: booking.id, status: booking.status }} />
      </div>

      {/* ─── INFO GRID ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Guest Info */}
        <div className={`${card} p-5 space-y-4`}>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#C9A96E]" />
            <h3 className={microLabel}>Guest</h3>
          </div>
          <div className="space-y-3">
            <p className="font-display text-lg text-[#1B3A5C]">{booking.guest.name || "Unknown Name"}</p>
            <p className="flex items-center gap-2 text-[12px] text-[#1B3A5C]/60">
              <Mail className="w-3.5 h-3.5 text-[#1B3A5C]/30 shrink-0" />
              <a href={`mailto:${booking.guest.email}`} className="hover:text-[#C9A96E] transition-colors break-all">{booking.guest.email}</a>
            </p>
            {booking.guest.phone && (
              <p className="flex items-center gap-2 text-[12px] text-[#1B3A5C]/60">
                <Phone className="w-3.5 h-3.5 text-[#1B3A5C]/30 shrink-0" />
                <a href={`tel:${booking.guest.phone}`} className="hover:text-[#C9A96E] transition-colors">{booking.guest.phone}</a>
              </p>
            )}
          </div>
        </div>

        {/* Property & Dates */}
        <div className={`${card} p-5 space-y-5 md:col-span-2`}>
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-[#C9A96E]" />
            <h3 className={microLabel}>Stay Details</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] text-[#1B3A5C]/35 uppercase tracking-[0.15em] mb-1">Property</p>
              <Link href={`/admin/properties/${booking.propertyId}`} className="text-[13px] font-medium text-[#1B3A5C] hover:text-[#C9A96E] transition-colors">
                {booking.property.title}
              </Link>
              {booking.roomType && (
                <p className="text-[11px] text-[#1B3A5C]/40 mt-1">
                  {booking.roomType.name} ({booking.roomType.classType})
                </p>
              )}
            </div>
            <div>
              <p className="text-[10px] text-[#1B3A5C]/35 uppercase tracking-[0.15em] mb-1">Guests</p>
              <p className="text-[13px] font-medium text-[#1B3A5C] tabular-nums">{booking.guests} guests</p>
            </div>
            <div>
              <p className="text-[10px] text-[#1B3A5C]/35 uppercase tracking-[0.15em] mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Check-in</p>
              <p className="text-[13px] font-medium text-[#1B3A5C] tabular-nums">{new Date(booking.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#1B3A5C]/35 uppercase tracking-[0.15em] mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Check-out</p>
              <p className="text-[13px] font-medium text-[#1B3A5C] tabular-nums">{new Date(booking.checkOut).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1B3A5C]/8 grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] text-[#1B3A5C]/35 uppercase tracking-[0.15em] mb-1">Nights</p>
              <p className="text-xl font-semibold text-[#1B3A5C] tabular-nums flex items-center gap-2"><Clock className="w-4 h-4 text-[#1B3A5C]/25" /> {nights}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#1B3A5C]/35 uppercase tracking-[0.15em] mb-1">Rate / Night</p>
              <p className="text-xl font-semibold text-[#1B3A5C] tabular-nums">{formatNpr(Number(booking.totalPrice) / nights)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#1B3A5C]/35 uppercase tracking-[0.15em] mb-1">Total Price</p>
              <p className="text-xl font-semibold text-[#1B3A5C] tabular-nums flex items-center gap-2"><Banknote className="w-4 h-4 text-[#C9A96E]" /> {formatNpr(booking.totalPrice)}</p>
            </div>
          </div>
        </div>

        {/* Notes / Cancellation */}
        <div className={`${card} p-5 md:col-span-3 space-y-4`}>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#C9A96E]" />
            <h3 className={microLabel}>Special Requests &amp; Notes</h3>
          </div>
          <p className="text-[13px] text-[#1B3A5C]/70 whitespace-pre-wrap leading-relaxed">
            {booking.notes || <span className="text-[#1B3A5C]/30 italic">No special requests provided by guest.</span>}
          </p>
          {booking.cancellationReason && (
            <div className="mt-4 p-4 bg-rose-50 border border-rose-200/60 rounded-xl">
              <p className="text-[10px] font-medium text-[#B84040] uppercase tracking-[0.2em] mb-1.5">Rejection / Cancellation Reason</p>
              <p className="text-[13px] text-[#B84040]/90 leading-relaxed">{booking.cancellationReason}</p>
            </div>
          )}
        </div>

        {/* Status Timeline */}
        <div className={`${card} p-5 md:col-span-3`}>
          <p className={`${microLabel} mb-5`}>Booking Lifecycle</p>
          <div className="flex flex-wrap gap-3">
            {["PENDING", "CONFIRMED", "CHECKED_IN", "COMPLETED", "NO_SHOW", "CANCELLED"].map((step) => {
              const isActive = step === booking.status
              const isPast = (
                (step === "PENDING" && ["CONFIRMED", "CHECKED_IN", "COMPLETED"].includes(booking.status)) ||
                (step === "CONFIRMED" && ["CHECKED_IN", "COMPLETED"].includes(booking.status)) ||
                (step === "CHECKED_IN" && booking.status === "COMPLETED")
              )
              return (
                <div
                  key={step}
                  className={`flex-1 min-w-[120px] px-4 py-3.5 rounded-xl border text-center transition-all ${
                    isActive ? STATUS_STYLES[step] :
                    isPast ? "bg-[#FBF9F4] text-[#1B3A5C]/45 border-[#1B3A5C]/8" :
                    "bg-[#FBF9F4]/50 text-[#1B3A5C]/20 border-[#1B3A5C]/5"
                  }`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em]">{BOOKING_STATUS_LABELS[step as keyof typeof BOOKING_STATUS_LABELS]}</p>
                  {isActive && <p className="text-[9px] mt-1 opacity-70 uppercase tracking-[0.15em]">Current</p>}
                  {isPast && <Check className="h-3 w-3 mx-auto mt-1" />}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
