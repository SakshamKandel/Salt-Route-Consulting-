import { prisma } from "@/lib/db"
import { StatCard } from "@/components/admin/stat-card"
import { BarChart2, TrendingUp, Users, DollarSign, Calendar } from "lucide-react"
import { formatNpr } from "@/lib/currency"

async function getReportData() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const [
    totalBookings,
    thisMonthBookings,
    lastMonthBookings,
    confirmedBookings,
    cancelledBookings,
    totalGuests,
    totalProperties,
    activeProperties,
    totalReviews,
    avgRatingRaw,
    recentBookings,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.booking.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.booking.count({ where: { status: "CANCELLED" } }),
    prisma.user.count({ where: { role: "GUEST" } }),
    prisma.property.count(),
    prisma.property.count({ where: { status: "ACTIVE" } }),
    prisma.review.count({ where: { status: "PUBLISHED" } }),
    prisma.review.aggregate({ _avg: { rating: true } }),
    prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { property: { select: { title: true } }, guest: { select: { name: true } } },
    }),
  ])

  const totalRevenue = await prisma.booking.aggregate({
    _sum: { totalPrice: true },
    where: { status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] } },
  })

  const thisMonthRevenue = await prisma.booking.aggregate({
    _sum: { totalPrice: true },
    where: { status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] }, createdAt: { gte: startOfMonth } },
  })

  return {
    totalBookings,
    thisMonthBookings,
    lastMonthBookings,
    confirmedBookings,
    cancelledBookings,
    totalGuests,
    totalProperties,
    activeProperties,
    totalReviews,
    avgRating: avgRatingRaw._avg.rating,
    totalRevenue: Number(totalRevenue._sum.totalPrice ?? 0),
    thisMonthRevenue: Number(thisMonthRevenue._sum.totalPrice ?? 0),
    recentBookings,
  }
}

export default async function AdminReportsPage() {
  const data = await getReportData()

  const bookingGrowth =
    data.lastMonthBookings > 0
      ? (((data.thisMonthBookings - data.lastMonthBookings) / data.lastMonthBookings) * 100).toFixed(1)
      : null

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display text-navy">Reports & Analytics</h2>
        <p className="text-slate-500">Overview of bookings, revenue, and platform activity.</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatNpr(data.totalRevenue)}
          icon={DollarSign}
          description="Confirmed + completed"
        />
        <StatCard
          title="This Month Revenue"
          value={formatNpr(data.thisMonthRevenue)}
          icon={TrendingUp}
          description="Current calendar month"
        />
        <StatCard
          title="Total Bookings"
          value={data.totalBookings}
          icon={Calendar}
          description={`${data.thisMonthBookings} this month`}
        />
        <StatCard
          title="Total Guests"
          value={data.totalGuests}
          icon={Users}
          description="Registered guest accounts"
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Confirmed Bookings" value={data.confirmedBookings} />
        <MetricCard label="Cancelled Bookings" value={data.cancelledBookings} />
        <MetricCard label="Active Properties" value={`${data.activeProperties} / ${data.totalProperties}`} />
        <MetricCard
          label="Average Rating"
          value={data.avgRating ? `${Number(data.avgRating).toFixed(1)} / 5` : "—"}
        />
      </div>

      {/* Booking growth note */}
      {bookingGrowth !== null && (
        <div className="bg-white border rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center shrink-0">
            <BarChart2 size={20} className="text-navy" />
          </div>
          <div>
            <p className="font-medium text-navy">
              Bookings {Number(bookingGrowth) >= 0 ? "up" : "down"} {Math.abs(Number(bookingGrowth))}% vs last month
            </p>
            <p className="text-sm text-slate-500">
              {data.thisMonthBookings} this month vs {data.lastMonthBookings} last month
            </p>
          </div>
        </div>
      )}

      {/* Recent bookings table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-navy">Recent Bookings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Guest</th>
                <th className="px-6 py-3 text-left">Property</th>
                <th className="px-6 py-3 text-left">Check-In</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">{b.guest.name ?? "—"}</td>
                  <td className="px-6 py-3">{b.property.title}</td>
                  <td className="px-6 py-3">{new Date(b.checkIn).toLocaleDateString()}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      b.status === "CONFIRMED" ? "bg-green-100 text-green-700"
                      : b.status === "CANCELLED" ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                    }`}>{b.status}</span>
                  </td>
                  <td className="px-6 py-3">{formatNpr(b.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">{label}</p>
      <p className="text-2xl font-bold text-navy">{value}</p>
    </div>
  )
}
