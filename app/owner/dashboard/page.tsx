import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function OwnerDashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [propertiesCount, confirmedBookingsCount, upcomingBookings, recentBookings] = await Promise.all([
    prisma.property.count({ where: { ownerId: session.user.id, status: "ACTIVE" } }),
    prisma.booking.count({ 
      where: { 
        property: { ownerId: session.user.id },
        status: "CONFIRMED"
      } 
    }),
    prisma.booking.count({
      where: {
        property: { ownerId: session.user.id },
        status: "CONFIRMED",
        checkIn: { gte: new Date() }
      }
    }),
    prisma.booking.findMany({
      where: {
        property: { ownerId: session.user.id },
        status: "CONFIRMED"
      },
      take: 5,
      orderBy: { checkIn: "asc" },
      include: { property: true, guest: true }
    })
  ])

  return (
    <div className="space-y-16">
      
      {/* ─── METRICS ROW ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-charcoal/5">
        <div className="bg-white p-10 flex flex-col items-center justify-center text-center group hover:bg-[#FAFAFA] transition-colors duration-700">
          <div className="mb-6 w-8 h-[1px] bg-charcoal/20 group-hover:bg-gold transition-colors duration-700" />
          <p className="text-[9px] uppercase tracking-[0.4em] text-charcoal/40 mb-3 font-bold">My Properties</p>
          <p className="text-4xl font-display text-charcoal group-hover:text-gold transition-colors duration-700">{propertiesCount}</p>
        </div>
        <div className="bg-white p-10 flex flex-col items-center justify-center text-center group hover:bg-[#FAFAFA] transition-colors duration-700">
          <div className="mb-6 w-8 h-[1px] bg-charcoal/20 group-hover:bg-gold transition-colors duration-700" />
          <p className="text-[9px] uppercase tracking-[0.4em] text-charcoal/40 mb-3 font-bold">Total Confirmed</p>
          <p className="text-4xl font-display text-charcoal group-hover:text-gold transition-colors duration-700">{confirmedBookingsCount}</p>
        </div>
        <div className="bg-white p-10 flex flex-col items-center justify-center text-center group hover:bg-[#FAFAFA] transition-colors duration-700">
          <div className="mb-6 w-8 h-[1px] bg-charcoal/20 group-hover:bg-gold transition-colors duration-700" />
          <p className="text-[9px] uppercase tracking-[0.4em] text-charcoal/40 mb-3 font-bold">Upcoming Arrivals</p>
          <p className="text-4xl font-display text-charcoal group-hover:text-gold transition-colors duration-700">{upcomingBookings}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
        
        {/* ─── UPCOMING RESERVATIONS ─── */}
        <div className="xl:col-span-2 space-y-8">
          <div className="flex items-center gap-4">
            <span className="w-8 h-[1px] bg-charcoal/20" />
            <h3 className="text-[11px] font-sans text-charcoal uppercase tracking-[0.4em] font-bold">Upcoming Reservations</h3>
          </div>
          
          {recentBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-charcoal/10 text-[9px] uppercase tracking-[0.3em] text-charcoal/50 font-bold">
                    <th className="py-6 font-normal">Reference</th>
                    <th className="py-6 font-normal">Property</th>
                    <th className="py-6 font-normal">Guest</th>
                    <th className="py-6 font-normal">Arrival</th>
                    <th className="py-6 font-normal text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-charcoal/5 text-sm group hover:bg-[#FAFAFA] transition-colors duration-500">
                      <td className="py-6 font-mono text-[10px] text-charcoal/50 group-hover:text-charcoal/80 transition-colors">{booking.bookingCode}</td>
                      <td className="py-6 font-display text-lg text-charcoal tracking-wide">{booking.property.title}</td>
                      <td className="py-6 font-sans text-xs text-charcoal/60 tracking-wider">{booking.guest.name || booking.guest.email}</td>
                      <td className="py-6 font-sans text-xs text-charcoal/60 tracking-widest">{new Date(booking.checkIn).toLocaleDateString()}</td>
                      <td className="py-6 text-right">
                        <Link href={`/owner/bookings/${booking.id}`} className="text-[9px] uppercase tracking-[0.3em] text-gold hover:text-charcoal transition-colors pb-1 border-b border-transparent hover:border-charcoal">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 flex flex-col items-center justify-center text-center bg-white border border-charcoal/10">
              <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/30 font-bold">No upcoming reservations</p>
            </div>
          )}
        </div>

        {/* ─── ANNOUNCEMENTS ─── */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <span className="w-8 h-[1px] bg-charcoal/20" />
            <h3 className="text-[11px] font-sans text-charcoal uppercase tracking-[0.4em] font-bold">Announcements</h3>
          </div>
          
          <div className="bg-white border border-charcoal/5 p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/10 transition-colors duration-700" />
            
            <div className="relative z-10 space-y-6">
              <div>
                <h4 className="font-display text-charcoal text-lg tracking-wide mb-3 group-hover:text-gold transition-colors duration-500">Welcome to your new Portal</h4>
                <p className="text-xs text-charcoal/50 leading-relaxed font-sans font-light tracking-wide">
                  Experience full control over your properties, seamless reservation management, and direct communication with the Salt Route Concierge, all in one elevated space.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
