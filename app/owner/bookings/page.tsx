import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { BookingsTable } from "@/app/admin/bookings/BookingsTable"

export default async function OwnerBookingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const bookings = await prisma.booking.findMany({
    where: {
      property: { ownerId: session.user.id },
      status: "CONFIRMED" // Strict rule: PENDING not visible
    },
    orderBy: { checkIn: "asc" },
    include: {
      guest: { select: { name: true, email: true } },
      property: { select: { title: true } }
    }
  })

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display text-navy">Confirmed Bookings</h2>
        <p className="text-slate-500">View all upcoming and past confirmed bookings for your properties.</p>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm">
        {/* We reuse the admin BookingsTable but it will only receive CONFIRMED bookings */}
        {bookings.length > 0 ? (
          <BookingsTable bookings={bookings} />
        ) : (
          <p className="text-slate-500 text-center py-8">No confirmed bookings found.</p>
        )}
      </div>
    </div>
  )
}
