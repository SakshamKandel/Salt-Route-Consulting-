import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { formatNpr } from "@/lib/currency"
import { BOOKING_STATUS_LABELS } from "@/lib/booking-lifecycle"

export default async function OwnerBookingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const bookings = await prisma.booking.findMany({
    where: {
      property: { ownerId: session.user.id },
      status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] }
    },
    orderBy: { checkIn: "asc" },
    include: {
      guest: { select: { name: true, email: true } },
      property: { select: { title: true } }
    }
  })

  return (
    <div className="space-y-16">
      <div className="flex items-center gap-4">
        <span className="w-8 h-[1px] bg-gold/50" />
        <h2 className="text-[11px] font-sans text-sand uppercase tracking-[0.4em]">Confirmed Reservations</h2>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.05] overflow-hidden">
        {bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[9px] uppercase tracking-[0.3em] text-sand/40">
                  <th className="py-8 px-10 font-normal">Reference</th>
                  <th className="py-8 px-10 font-normal">Property</th>
                  <th className="py-8 px-10 font-normal">Guest</th>
                  <th className="py-8 px-10 font-normal">Dates</th>
                  <th className="py-8 px-10 font-normal">Net Amount</th>
                  <th className="py-8 px-10 font-normal">Status</th>
                  <th className="py-8 px-10 font-normal text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="text-sm group hover:bg-white/[0.02] transition-colors duration-500">
                    <td className="py-8 px-10 font-mono text-[10px] text-sand/40 group-hover:text-sand/80 transition-colors">
                      {booking.bookingCode}
                    </td>
                    <td className="py-8 px-10 font-display text-lg text-sand tracking-wide">
                      {booking.property.title}
                    </td>
                    <td className="py-8 px-10 font-sans text-xs text-sand/60 tracking-wider">
                      {booking.guest.name || booking.guest.email}
                    </td>
                    <td className="py-8 px-10 font-sans text-xs text-sand/60 tracking-widest uppercase">
                      {new Date(booking.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} &mdash; {new Date(booking.checkOut).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-8 px-10 font-display text-sand/80 tracking-widest">
                      {formatNpr(booking.totalPrice)}
                    </td>
                    <td className="py-8 px-10 font-sans text-[9px] uppercase tracking-[0.3em] text-gold/80">
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </td>
                    <td className="py-8 px-10 text-right">
                      <Link 
                        href={`/owner/bookings/${booking.id}`} 
                        className="text-[9px] uppercase tracking-[0.4em] text-gold hover:text-white transition-colors pb-1 border-b border-transparent hover:border-white"
                      >
                        VIEW DETAILS
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-24 text-center">
            <p className="text-[10px] uppercase tracking-[0.4em] text-sand/30 font-sans">No confirmed reservations found in your portfolio.</p>
          </div>
        )}
      </div>
    </div>
  )
}
