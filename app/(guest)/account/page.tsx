import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Heart, Star } from "lucide-react"

export default async function AccountDashboard() {
  const session = await auth()
  if (!session?.user?.id) return null

  // Fetch stats concurrently
  const [bookingsCount, wishlistCount, reviewsCount, upcomingBooking] = await Promise.all([
    prisma.booking.count({ where: { guestId: session.user.id } }),
    prisma.wishlist.count({ where: { userId: session.user.id } }),
    prisma.review.count({ where: { guestId: session.user.id } }),
    prisma.booking.findFirst({
      where: { guestId: session.user.id, checkIn: { gte: new Date() }, status: "CONFIRMED" },
      orderBy: { checkIn: "asc" },
      include: { property: true }
    })
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display text-navy">Hi, {session.user.name || 'Guest'}!</h1>
        <p className="text-gray-500 mt-2">Welcome back to your account dashboard.</p>
      </div>

      {upcomingBooking && (
        <Card className="bg-navy text-cream border-0">
          <CardHeader>
            <CardTitle className="text-gold font-display text-xl">Your Next Adventure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xl font-bold">{upcomingBooking.property.title}</p>
                <p className="text-cream/80">
                  {new Date(upcomingBooking.checkIn).toLocaleDateString()} - {new Date(upcomingBooking.checkOut).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-gold/20 text-gold px-4 py-2 rounded-full font-medium text-sm">
                Confirmed
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-navy">{bookingsCount}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-4 bg-red-50 text-red-600 rounded-full">
              <Heart size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Wishlist Items</p>
              <p className="text-2xl font-bold text-navy">{wishlistCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-4 bg-yellow-50 text-yellow-600 rounded-full">
              <Star size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Reviews Written</p>
              <p className="text-2xl font-bold text-navy">{reviewsCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
