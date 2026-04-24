import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CancelBookingButton } from "./CancelBookingButton"

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild><Link href="/account/bookings">← Back</Link></Button>
        <h1 className="text-3xl font-display text-navy">Booking Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex justify-between items-center">
                <span>{booking.property.title}</span>
                <Badge>{booking.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Check-in</p>
                  <p className="font-medium">{new Date(booking.checkIn).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Check-out</p>
                  <p className="font-medium">{new Date(booking.checkOut).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Guests</p>
                  <p className="font-medium">{booking.guests} Guests</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Booking Code</p>
                  <p className="font-medium font-mono text-xs">{booking.id}</p>
                </div>
              </div>

              {booking.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-1">Special Requests</p>
                  <p className="text-sm">{booking.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-4 h-4 rounded-full bg-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Requested</p>
                    <p className="text-sm text-gray-500">{booking.createdAt.toLocaleDateString()}</p>
                  </div>
                </div>
                {/* Visual timeline logic depends on status */}
                {booking.status !== "PENDING" && booking.status !== "CANCELLED" && (
                  <div className="flex gap-4 items-start">
                    <div className="w-4 h-4 rounded-full bg-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Confirmed</p>
                      <p className="text-sm text-gray-500">Approved by host</p>
                    </div>
                  </div>
                )}
                {booking.status === "COMPLETED" && (
                  <div className="flex gap-4 items-start">
                    <div className="w-4 h-4 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Completed</p>
                      <p className="text-sm text-gray-500">Hope you enjoyed your stay!</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Price Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>${booking.totalPrice.toString()}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span>${booking.totalPrice.toString()}</span>
              </div>
            </CardContent>
          </Card>
          
          {booking.status === "PENDING" && (
            <CancelBookingButton bookingId={booking.id} />
          )}
        </div>
      </div>
    </div>
  )
}
