import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, Phone, User, Home, FileText } from "lucide-react"
import { BookingActions } from "./BookingActions"

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/bookings"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-display text-navy">{booking.bookingCode}</h2>
              <Badge variant={booking.status === "CONFIRMED" ? "default" : booking.status === "PENDING" ? "secondary" : "outline"}>
                {booking.status}
              </Badge>
            </div>
            <p className="text-slate-500">Requested on {booking.createdAt.toLocaleDateString()}</p>
          </div>
        </div>
        <BookingActions booking={booking} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Guest Info */}
        <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-navy mb-2">
            <User className="w-5 h-5" />
            <h3 className="font-semibold text-lg">Guest Information</h3>
          </div>
          <div className="space-y-3 text-sm">
            <p className="font-medium">{booking.guest.name || "Unknown Name"}</p>
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
          
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-slate-500">Property</p>
              <Link href={`/admin/properties/${booking.propertyId}`} className="font-medium text-blue-600 hover:underline">
                {booking.property.title}
              </Link>
            </div>
            <div>
              <p className="text-slate-500">Guests</p>
              <p className="font-medium">{booking.guests} guests</p>
            </div>
            <div>
              <p className="text-slate-500">Check-in</p>
              <p className="font-medium">{new Date(booking.checkIn).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-slate-500">Check-out</p>
              <p className="font-medium">{new Date(booking.checkOut).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="pt-4 border-t flex justify-between items-center">
            <span className="text-slate-500 font-medium">Total Price</span>
            <span className="text-2xl font-bold text-navy">${booking.totalPrice.toString()}</span>
          </div>
        </div>

        {/* Notes */}
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
      </div>
    </div>
  )
}
