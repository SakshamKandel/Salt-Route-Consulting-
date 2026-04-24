import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { BookingStatus, Prisma } from "@prisma/client"

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()
  if (!session?.user?.id) return null

  const resolvedParams = await searchParams
  const statusFilter = resolvedParams.status as string | undefined

  const whereClause: Prisma.BookingWhereInput = { guestId: session.user.id }
  if (
    statusFilter &&
    statusFilter !== "ALL" &&
    Object.values(BookingStatus).includes(statusFilter as BookingStatus)
  ) {
    whereClause.status = statusFilter as BookingStatus
  }

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    include: {
      property: {
        include: { images: { take: 1 } }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display text-navy">My Bookings</h1>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((status) => (
          <Button
            key={status}
            variant={(!statusFilter && status === "ALL") || statusFilter === status ? "default" : "outline"}
            asChild
            className={(!statusFilter && status === "ALL") || statusFilter === status ? "bg-navy text-cream hover:bg-navy/90" : ""}
          >
            <Link href={status === "ALL" ? "/account/bookings" : `/account/bookings?status=${status}`}>
              {status}
            </Link>
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No bookings found.
          </div>
        ) : (
          bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0 flex flex-col md:flex-row">
                <div className="relative w-full md:w-48 h-48 md:h-auto">
                  {booking.property.images[0] ? (
                    <Image
                      src={booking.property.images[0].url}
                      alt={booking.property.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-navy">{booking.property.title}</h3>
                      <Badge variant={booking.status === "CONFIRMED" ? "default" : "secondary"}>
                        {booking.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                    </p>
                    <p className="font-medium text-navy">Total: ${booking.totalPrice.toString()}</p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" asChild>
                      <Link href={`/account/bookings/${booking.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
