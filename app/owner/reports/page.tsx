import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { formatNpr } from "@/lib/currency"
import { BarChart3, CalendarCheck, ChevronRight, Home, MapPin, Star, TrendingUp } from "lucide-react"

const PROPERTY_STATUS_CHIP: Record<string, string> = {
  ACTIVE:   "bg-emerald-50 text-emerald-600 border-emerald-200/60",
  DRAFT:    "bg-amber-50 text-amber-600 border-amber-200/60",
  INACTIVE: "bg-[#1B3A5C]/5 text-[#1B3A5C]/50 border-[#1B3A5C]/10",
}

export default async function OwnerReportsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [totalRevenue, propertiesCount, totalBookings, completedStays, properties] =
    await Promise.all([
      prisma.booking.aggregate({
        where: {
          property: { ownerId: session.user.id },
          status: { in: ["CONFIRMED", "COMPLETED", "CHECKED_IN"] },
        },
        _sum: { totalPrice: true },
      }),
      prisma.property.count({ where: { ownerId: session.user.id, status: { not: "ARCHIVED" } } }),
      prisma.booking.count({
        where: {
          property: { ownerId: session.user.id },
          status: { in: ["CONFIRMED", "COMPLETED", "CHECKED_IN"] },
        },
      }),
      prisma.booking.count({
        where: {
          property: { ownerId: session.user.id },
          status: "COMPLETED",
        },
      }),
      prisma.property.findMany({
        where: { ownerId: session.user.id, status: "ACTIVE" },
        select: {
          id: true,
          title: true,
          location: true,
          status: true,
          _count: {
            select: {
              bookings: { where: { status: { in: ["CONFIRMED", "COMPLETED", "CHECKED_IN"] } } },
              reviews: true,
            },
          },
        },
        orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
      }),
    ])

  const summaryMetrics = [
    { icon: TrendingUp,    label: "Lifetime revenue",  value: formatNpr(totalRevenue._sum.totalPrice) },
    { icon: Home,          label: "Active properties", value: propertiesCount },
    { icon: CalendarCheck, label: "Total stays",       value: totalBookings },
    { icon: Star,          label: "Completed stays",   value: completedStays },
  ]

  const maxBookings = Math.max(1, ...properties.map((p) => p._count.bookings))

  return (
    <div className="pb-12 space-y-8">

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.3em] mb-1">
            Owner Insights
          </p>
          <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">
            Earnings &amp; performance
          </h1>
          <p className="text-[12px] text-[#1B3A5C]/45 mt-1.5 max-w-xl">
            Total value, completed stays, active properties, and how each place is growing.
          </p>
        </div>
        <Link
          href="/owner/properties"
          className="shrink-0 self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 border border-[#1B3A5C]/15 rounded-lg text-[11px] font-medium text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 transition-colors"
        >
          Review properties
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* ── SUMMARY METRICS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {summaryMetrics.map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-4 sm:p-5">
            <Icon className="h-4 w-4 text-[#1B3A5C]/25 mb-3" />
            <p className="text-xl sm:text-2xl font-semibold text-[#1B3A5C] leading-tight tabular-nums break-words">{value}</p>
            <p className="text-[10px] text-[#1B3A5C]/40 mt-1 uppercase tracking-[0.2em] font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* ── PROPERTY PERFORMANCE ── */}
      <div>
        <h2 className="text-[15px] font-semibold text-[#1B3A5C] mb-4">Property performance</h2>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {properties.map((p) => {
              const width = Math.max(8, Math.round((p._count.bookings / maxBookings) * 100))
              const chip = PROPERTY_STATUS_CHIP[p.status] ?? PROPERTY_STATUS_CHIP.INACTIVE
              return (
                <Link
                  key={p.id}
                  href={`/owner/properties/${p.id}`}
                  className="group bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl p-5 hover:border-[#1B3A5C]/15 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 text-[10px] text-[#C9A96E] uppercase tracking-[0.2em] font-medium mb-1">
                        <MapPin className="h-2.5 w-2.5" />
                        {p.location}
                      </p>
                      <h3 className="text-[14px] font-semibold text-[#1B3A5C] leading-snug truncate">{p.title}</h3>
                    </div>
                    <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-semibold border uppercase tracking-[0.15em] ${chip}`}>
                      {p.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-[#FBF9F4] border border-[#1B3A5C]/5 p-3">
                      <p className="text-[9px] uppercase tracking-[0.15em] text-[#1B3A5C]/35 font-medium">Confirmed stays</p>
                      <p className="mt-1 text-lg font-semibold text-[#1B3A5C] tabular-nums">{p._count.bookings}</p>
                    </div>
                    <div className="rounded-lg bg-[#FBF9F4] border border-[#1B3A5C]/5 p-3">
                      <p className="text-[9px] uppercase tracking-[0.15em] text-[#1B3A5C]/35 font-medium">Reviews</p>
                      <p className="mt-1 text-lg font-semibold text-[#1B3A5C] tabular-nums">{p._count.reviews}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-[9px] uppercase tracking-[0.15em] text-[#1B3A5C]/35 font-medium">
                      <span>Guest interest</span>
                      <span className="tabular-nums">{width}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#1B3A5C]/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#C9A96E] transition-all duration-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl py-16 text-center">
            <BarChart3 className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-3" />
            <p className="text-[13px] text-[#1B3A5C]/35 font-medium">No stay results yet</p>
            <p className="text-[11px] text-[#1B3A5C]/25 mt-1">Active properties and guest stays will appear here</p>
          </div>
        )}
      </div>

      {/* ── MONTHLY VIEW ── */}
      <div>
        <h2 className="text-[15px] font-semibold text-[#1B3A5C] mb-4">Monthly view</h2>
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl py-14 text-center px-6">
          <BarChart3 className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-3" />
          <p className="text-[13px] text-[#1B3A5C]/35 font-medium">Monthly view ready as stays grow</p>
          <p className="mx-auto mt-1 max-w-md text-[11px] text-[#1B3A5C]/25">
            As more stays are completed, this space will show monthly patterns, guest interest, and property comparisons.
          </p>
        </div>
      </div>
    </div>
  )
}
