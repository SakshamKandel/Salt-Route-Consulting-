import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { formatNpr } from "@/lib/currency"
import { ArrowRight, BarChart3, CalendarCheck, Home, Star, TrendingUp } from "lucide-react"

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
        include: {
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
    { icon: TrendingUp, label: "Lifetime Revenue", value: formatNpr(totalRevenue._sum.totalPrice) },
    { icon: Home, label: "Active Properties", value: propertiesCount },
    { icon: CalendarCheck, label: "Total Stays", value: totalBookings },
    { icon: Star, label: "Completed Stays", value: completedStays },
  ]

  const maxBookings = Math.max(1, ...properties.map((p) => p._count.bookings))

  return (
    <div className="space-y-16">
      <section className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="h-px w-8 bg-gold/40" />
            <p className="text-[9px] uppercase tracking-[0.45em] text-gold/60">Portfolio Performance</p>
          </div>
          <h1 className="font-display text-4xl leading-[1.12] tracking-wide text-sand/88 md:text-5xl">
            Revenue and demand signals for every property.
          </h1>
          <p className="max-w-2xl text-sm font-light leading-[1.85] text-sand/38">
            A concise owner report for portfolio scale: total value, stays completed, active assets, and property-level momentum.
          </p>
        </div>

        <Link
          href="/owner/properties"
          className="group flex items-center justify-between border border-gold/12 bg-gold/[0.025] px-6 py-5 text-[9px] uppercase tracking-[0.3em] text-gold/58 transition-colors duration-500 hover:border-gold/25 hover:text-gold"
        >
          Review property rooms
          <ArrowRight className="h-3.5 w-3.5 stroke-[1.3] transition-transform duration-500 group-hover:translate-x-1" />
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-px bg-gold/8 lg:grid-cols-4">
        {summaryMetrics.map((m) => (
          <div key={m.label} className="group bg-[#0A1826] px-5 py-7 transition-colors duration-700 hover:bg-[#0F2133] sm:px-8 sm:py-9">
            <m.icon className="mb-6 h-4 w-4 text-gold/35 stroke-[1.3] transition-colors duration-700 group-hover:text-gold" />
            <p className="mb-3 text-[8px] uppercase tracking-[0.34em] text-sand/30 sm:text-[8.5px]">
              {m.label}
            </p>
            <p className="break-words font-display text-2xl tracking-wide text-gold/75 transition-colors duration-700 group-hover:text-gold sm:text-3xl">
              {m.value}
            </p>
          </div>
        ))}
      </section>

      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <span className="h-px w-8 bg-gold/30" />
          <h2 className="text-[10px] uppercase tracking-[0.4em] text-sand/40">Property Breakdown</h2>
        </div>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 gap-px bg-gold/8 lg:grid-cols-2">
            {properties.map((p) => {
              const width = Math.max(8, Math.round((p._count.bookings / maxBookings) * 100))
              return (
                <Link
                  key={p.id}
                  href={`/owner/properties/${p.id}`}
                  className="group bg-[#0A1826] p-6 transition-colors duration-500 hover:bg-[#0F2133] sm:p-7"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.28em] text-gold/45">{p.location}</p>
                      <h3 className="mt-3 font-display text-2xl tracking-wide text-sand/82">{p.title}</h3>
                    </div>
                    <span className="self-start border border-gold/12 px-4 py-2 text-[8px] uppercase tracking-[0.28em] text-sand/34">
                      {p.status}
                    </span>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-px bg-gold/8">
                    <div className="bg-[#0A1826] p-4">
                      <p className="text-[8px] uppercase tracking-[0.25em] text-sand/25">Confirmed Stays</p>
                      <p className="mt-2 font-display text-3xl text-gold/75">{p._count.bookings}</p>
                    </div>
                    <div className="bg-[#0A1826] p-4">
                      <p className="text-[8px] uppercase tracking-[0.25em] text-sand/25">Reviews</p>
                      <p className="mt-2 font-display text-3xl text-gold/75">{p._count.reviews}</p>
                    </div>
                  </div>

                  <div className="mt-7">
                    <div className="mb-3 flex items-center justify-between text-[8px] uppercase tracking-[0.25em] text-sand/24">
                      <span>Demand signal</span>
                      <span>{width}%</span>
                    </div>
                    <div className="h-1 bg-sand/8">
                      <div className="h-full bg-gold/70 transition-all duration-700 group-hover:bg-gold" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="border border-gold/8 py-20 text-center">
            <BarChart3 className="mx-auto mb-6 h-8 w-8 text-gold/24 stroke-[1.2]" />
            <p className="text-[10px] uppercase tracking-[0.4em] text-sand/25">No active performance data</p>
            <p className="mt-3 text-[11px] font-light text-sand/20">Active properties and guest stays will populate this report.</p>
          </div>
        )}
      </section>

      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <span className="h-px w-8 bg-gold/30" />
          <h2 className="text-[10px] uppercase tracking-[0.4em] text-sand/40">Monthly Trend Frame</h2>
        </div>
        <div className="border border-gold/8 bg-gold/[0.02] px-6 py-12 text-center sm:px-10">
          <div className="mx-auto mb-8 flex max-w-md items-end justify-center gap-2">
            {[40, 65, 50, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((height, index) => (
              <div
                key={index}
                className="w-full max-w-7 bg-gold/25"
                style={{ height: `${height * 0.72}px` }}
              />
            ))}
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-sand/28">Analytics ready for portfolio scale</p>
          <p className="mx-auto mt-3 max-w-xl text-[12px] font-light leading-[1.8] text-sand/25">
            The report layout is prepared for larger monthly datasets, occupancy trends, channel mix, and per-property comparisons.
          </p>
        </div>
      </section>
    </div>
  )
}
