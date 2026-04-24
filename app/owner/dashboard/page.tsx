import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { StatCard } from "@/components/admin/stat-card"
import { Home, Calendar, CheckCircle } from "lucide-react"
import { DashboardBookingsTable } from "@/components/admin/dashboard-tables"
import { redirect } from "next/navigation"

export default async function OwnerDashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [propertiesCount, confirmedBookingsCount, upcomingBookings, recentBookings] = await Promise.all([
    prisma.property.count({ where: { ownerId: session.user.id } }),
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
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display text-navy">Welcome, {session.user.name}</h2>
        <p className="text-slate-500">Here is an overview of your properties.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="My Properties" value={propertiesCount} icon={Home} />
        <StatCard title="Total Confirmed" value={confirmedBookingsCount} icon={CheckCircle} />
        <StatCard title="Upcoming Check-ins" value={upcomingBookings} icon={Calendar} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold text-navy">Upcoming Bookings</h3>
          {recentBookings.length > 0 ? (
             <DashboardBookingsTable bookings={recentBookings} />
          ) : (
            <div className="p-8 text-center border rounded-lg bg-white">
              <p className="text-slate-500">No upcoming bookings.</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-navy">Announcements</h3>
          <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4">
            <div className="border-b pb-4 last:border-0 last:pb-0">
              <h4 className="font-semibold text-navy text-sm">Welcome to the new portal</h4>
              <p className="text-xs text-slate-500 mt-1">Manage your properties, view bookings, and communicate with us directly through this portal.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
