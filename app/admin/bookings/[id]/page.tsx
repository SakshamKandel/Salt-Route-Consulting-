import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, User, Home, FileText, Calendar, DollarSign, Clock } from "lucide-react"
import { BookingActions } from "./BookingActions"
import { BOOKING_STATUS_LABELS } from "@/lib/booking-lifecycle"
import { formatNpr } from "@/lib/currency"

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  CONFIRMED: "bg-green-100 text-green-800 border-green-200",
  CHECKED_IN: "bg-sky-100 text-sky-800 border-sky-200",
  COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  NO_SHOW: "bg-orange-100 text-orange-800 border-orange-200",
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
      property: true
    }
  })

  if (!booking) return notFound()

  const nights = Math.ceil(
    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/bookings"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-display text-navy">{booking.bookingCode}</h2>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${STATUS_STYLES[booking.status] || "bg-gray-100"}`}>
                {BOOKING_STATUS_LABELS[booking.status]}
              </span>
            </div>
            <p className="text-slate-500 text-sm">Requested on {booking.createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* ─── STATUS ACTIONS ─── */}
        <BookingActions booking={{ id: booking.id, status: booking.status }} />
      </div>

      {/* ─── INFO GRID ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Guest Info */}
        <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-navy mb-2">
            <User className="w-5 h-5" />
            <h3 className="font-semibold text-lg">Guest Information</h3>
          </div>
          <div className="space-y-3 text-sm">
            <p className="font-medium text-lg">{booking.guest.name || "Unknown Name"}</p>
            <p className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4" />
              <a href={`mailto:${booking.guest.email}`} className="text-blue-600 hover:underline">{booking.guest.email}</a>
            </p>
            {booking.guest.phone && (
              <p className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4" />
                <a href={`tel:${booking.guest.phone}`} className="text-blue-600 hover:underline">{booking.guest.phone}</a>
              </p>
            )}
          </div>
        </div>

        {/* Property & Dates */}
        <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 text-navy mb-2">
            <Home className="w-5 h-5" />
            <h3 className="font-semibold text-lg">Stay Details</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-500 mb-1">Property</p>
              <Link href={`/admin/properties/${booking.propertyId}`} className="font-medium text-blue-600 hover:underline">
                {booking.property.title}
              </Link>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Guests</p>
              <p className="font-medium">{booking.guests} guests</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Check-in</p>
              <p className="font-medium">{new Date(booking.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Check-out</p>
              <p className="font-medium">{new Date(booking.checkOut).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="pt-4 border-t grid grid-cols-3 gap-4">
            <div>
              <span className="text-slate-500 text-sm">Nights</span>
              <p className="text-xl font-bold text-navy flex items-center gap-2"><Clock className="w-4 h-4" /> {nights}</p>
            </div>
            <div>
              <span className="text-slate-500 text-sm">Rate / Night</span>
              <p className="text-xl font-bold text-navy">{formatNpr(Number(booking.totalPrice) / nights)}</p>
            </div>
            <div>
              <span className="text-slate-500 text-sm">Total Price</span>
              <p className="text-xl font-bold text-navy flex items-center gap-2"><DollarSign className="w-4 h-4" /> {formatNpr(booking.totalPrice)}</p>
            </div>
          </div>
        </div>

        {/* Notes / Cancellation */}
        <div className="bg-white border rounded-lg p-6 shadow-sm md:col-span-3 space-y-4">
          <div className="flex items-center gap-2 text-navy mb-2">
            <FileText className="w-5 h-5" />
            <h3 className="font-semibold text-lg">Special Requests & Notes</h3>
          </div>
          <p className="text-slate-700 whitespace-pre-wrap">
            {booking.notes || <span className="text-slate-400 italic">No special requests provided by guest.</span>}
          </p>
          {booking.cancellationReason && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-md">
              <p className="text-red-800 font-medium mb-1">Rejection/Cancellation Reason:</p>
              <p className="text-red-700 text-sm">{booking.cancellationReason}</p>
            </div>
          )}
        </div>

        {/* Status Timeline */}
        <div className="bg-white border rounded-lg p-6 shadow-sm md:col-span-3">
          <h3 className="font-semibold text-lg text-navy mb-6">Booking Lifecycle</h3>
          <div className="flex flex-wrap gap-4">
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
                  className={`flex-1 min-w-[120px] p-4 rounded-lg border text-center transition-all ${
                    isActive ? STATUS_STYLES[step] + " ring-2 ring-offset-1 ring-current" :
                    isPast ? "bg-gray-50 text-gray-500 border-gray-200" :
                    "bg-gray-50/50 text-gray-300 border-gray-100"
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-wider">{BOOKING_STATUS_LABELS[step as keyof typeof BOOKING_STATUS_LABELS]}</p>
                  {isActive && <p className="text-[10px] mt-1 opacity-70">Current</p>}
                  {isPast && <p className="text-[10px] mt-1">✓</p>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
