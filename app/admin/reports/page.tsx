import { prisma } from "@/lib/db"
import { StatCard } from "@/components/admin/stat-card"
import { DateRangePicker } from "@/components/admin/date-range-picker"
import { RevenueLineChart } from "@/components/admin/charts/revenue-line"
import { BookingsBarChart } from "@/components/admin/charts/bookings-bar"
import { TopPropertiesChart } from "@/components/admin/charts/top-properties-bar"
import {
  bookingsByDay,
  revenueByMonth,
  topProperties,
  kpiStats,
} from "@/lib/admin/analytics"
import { TrendingUp, Users, DollarSign, Calendar, Download } from "lucide-react"
import { formatNpr } from "@/lib/currency"
import Link from "next/link"
import { subDays, startOfYear, parseISO } from "date-fns"

function parseDate(s: string | undefined, fallback: Date) {
  if (!s) return fallback
  try { return parseISO(s) } catch { return fallback }
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const fromStr = typeof params.from === "string" ? params.from : undefined
  const toStr = typeof params.to === "string" ? params.to : undefined

  const now = new Date()
  const from = parseDate(fromStr, subDays(now, 30))
  const to = parseDate(toStr, now)

  const [kpi, dayData, monthData, topProps, totalGuests, totalProperties, activeProperties] =
    await Promise.all([
      kpiStats(from, to),
      bookingsByDay(from, to),
      revenueByMonth(startOfYear(now), now),
      topProperties(8),
      prisma.user.count({ where: { role: "GUEST" } }),
      prisma.property.count(),
      prisma.property.count({ where: { status: "ACTIVE" } }),
    ])

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Analytics</p>
          <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Reports</h1>
          <p className="text-[12px] text-[#1B3A5C]/45 mt-1">Bookings, revenue, and platform activity.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <DateRangePicker from={fromStr} to={toStr} />
          <Link
            href={`/api/admin/export/bookings?from=${fromStr ?? ""}&to=${toStr ?? ""}`}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[#1B3A5C]/15 text-[12px] font-medium text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 transition-colors"
          >
            <Download className="w-3.5 h-3.5 opacity-60" /> Export CSV
          </Link>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Revenue"
          value={formatNpr(kpi.revenue)}
          icon={DollarSign}
          accent="gold"
          trend={kpi.revenueGrowth !== null ? (kpi.revenueGrowth >= 0 ? "up" : "down") : undefined}
          trendValue={kpi.revenueGrowth !== null ? `${kpi.revenueGrowth.toFixed(1)}%` : undefined}
          description="Confirmed + completed"
        />
        <StatCard
          title="Bookings"
          value={kpi.totalBookings}
          icon={Calendar}
          accent="neutral"
          description={`${kpi.confirmedBookings} confirmed · ${kpi.cancelledBookings} cancelled`}
        />
        <StatCard
          title="Guests"
          value={totalGuests}
          icon={Users}
          accent="blue"
          description="Registered guest accounts"
        />
        <StatCard
          title="Avg Rating"
          value={kpi.avgRating ? `${Number(kpi.avgRating).toFixed(1)} / 5` : "—"}
          icon={TrendingUp}
          accent="amber"
          description={`${activeProperties} / ${totalProperties} properties active`}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl p-6">
          <p className="text-[10px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.2em] mb-4">
            Revenue by Month (YTD)
          </p>
          <RevenueLineChart data={monthData} />
        </div>
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl p-6">
          <p className="text-[10px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.2em] mb-4">
            Bookings per Day
          </p>
          <BookingsBarChart data={dayData} />
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl p-6">
          <p className="text-[10px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.2em] mb-4">
            Top Properties by Bookings
          </p>
          <TopPropertiesChart data={topProps} />
        </div>
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl p-6">
          <p className="text-[10px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.2em] mb-4">Quick Stats</p>
          <div className="divide-y divide-[#1B3A5C]/5">
            {[
              { label: "Confirmed Bookings", value: kpi.confirmedBookings },
              { label: "Cancelled Bookings", value: kpi.cancelledBookings },
              { label: "Active Properties",  value: `${activeProperties} / ${totalProperties}` },
              { label: "Avg Rating",         value: kpi.avgRating ? `${Number(kpi.avgRating).toFixed(1)} / 5` : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <span className="text-[13px] text-[#1B3A5C]/50">{label}</span>
                <span className="text-[13px] font-semibold text-[#1B3A5C] tabular-nums">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
