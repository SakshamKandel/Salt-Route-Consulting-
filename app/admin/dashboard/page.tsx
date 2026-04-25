import { prisma } from "@/lib/db"
import { StatCard } from "@/components/admin/stat-card"
import { DashboardBookingsTable, DashboardInquiriesTable } from "@/components/admin/dashboard-tables"
import { Home, Users, MessageSquare, CheckCircle, Clock } from "lucide-react"
import { serializeForClient } from "@/lib/serialize"

export default async function AdminDashboard() {
  const [
    propertyCount,
    userCount,
    ownerCount,
    pendingBookings,
    confirmedBookings,
    inquiryCount,
    recentBookings,
    recentInquiries
  ] = await Promise.all([
    prisma.property.count(),
    prisma.user.count({ where: { role: "GUEST" } }),
    prisma.user.count({ where: { role: "OWNER" } }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { property: true, guest: true }
    }),
    prisma.inquiry.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    })
  ])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display text-charcoal tracking-wide">Dashboard Overview</h2>
        <p className="text-charcoal/50 text-sm mt-2 font-medium">Welcome to the Salt Route Admin Portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Properties" value={propertyCount} icon={Home} />
        <StatCard title="Guests" value={userCount} icon={Users} />
        <StatCard title="Owners" value={ownerCount} icon={Users} />
        <StatCard title="Pending Bookings" value={pendingBookings} icon={Clock} />
        <StatCard title="Confirmed Bookings" value={confirmedBookings} icon={CheckCircle} />
        <StatCard title="Open Inquiries" value={inquiryCount} icon={MessageSquare} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-xl font-display text-charcoal tracking-wide">Recent Booking Requests</h3>
          <DashboardBookingsTable bookings={serializeForClient(recentBookings)} />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-display text-charcoal tracking-wide">Recent Inquiries</h3>
          <DashboardInquiriesTable inquiries={serializeForClient(recentInquiries)} />
        </div>
      </div>
    </div>
  )
}
