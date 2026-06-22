import { prisma } from "@/lib/db"
import { LiveCounter } from "@/components/admin/live-counter"
import { MiniBars } from "@/components/admin/charts/mini-bars"
import { AiInsights } from "@/components/admin/ai-insights"
import {
  Users, Building2, ArrowRight, ArrowUpRight, Calendar, Mail, Star,
  AlertCircle, ChevronRight, ChevronLeft, DoorOpen, ShieldCheck, ConciergeBell,
  TrendingUp, TrendingDown, Bed,
} from "lucide-react"
import { bookingsByDay } from "@/lib/admin/analytics"
import { ACTIVE_BOOKING_STATUSES } from "@/lib/booking-lifecycle"
import { getBannerImageUrl, getPrimaryImageUrl } from "@/lib/property-media"
import { formatNpr } from "@/lib/currency"
import { subDays, format, formatDistanceToNowStrict, startOfMonth, addDays } from "date-fns"
import Link from "next/link"
import { auth } from "@/auth"

// Always reflect the latest database state (no static caching of the dashboard).
export const dynamic = "force-dynamic"

const FALLBACK = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop"

// Priority chip for the "needs attention" queue, by how long a request has waited.
function priorityFor(createdAt: Date) {
  const hours = (Date.now() - createdAt.getTime()) / 3_600_000
  if (hours >= 24) return { label: "Urgent", cls: "bg-rose-100 text-rose-600" }
  if (hours >= 6) return { label: "High", cls: "bg-amber-100 text-amber-700" }
  return { label: "Normal", cls: "bg-emerald-100 text-emerald-700" }
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ property?: string }>
}) {
  const session = await auth()
  const sp = await searchParams
  const now = new Date()
  const monthStart = startOfMonth(now)
  const in30 = addDays(now, 30)
  const fourteenAgo = subDays(now, 14)

  // ── Property switcher: pick which property the left hero card shows ──
  const allProperties = await prisma.property.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: { id: true, title: true },
  })
  const requestedId = typeof sp.property === "string" ? sp.property : null
  const selectedIndex = Math.max(0, allProperties.findIndex((p) => p.id === requestedId))
  const selectedId = allProperties[selectedIndex]?.id ?? null
  const prevId = allProperties.length > 1 ? allProperties[(selectedIndex - 1 + allProperties.length) % allProperties.length].id : null
  const nextId = allProperties.length > 1 ? allProperties[(selectedIndex + 1) % allProperties.length].id : null

  const featured = selectedId
    ? await prisma.property.findUnique({
        where: { id: selectedId },
        include: {
          images: { orderBy: [{ isBanner: "desc" }, { isPrimary: "desc" }, { order: "asc" }] },
          owner: { select: { name: true, phone: true } },
          roomTypes: { where: { active: true }, select: { totalUnits: true } },
          _count: { select: { bookings: true, reviews: true } },
        },
      })
    : null

  const fpUnits = featured
    ? (featured.roomTypes.length > 0
        ? featured.roomTypes.reduce((s, r) => s + r.totalUnits, 0)
        : Math.max(1, featured.totalUnits))
    : 0

  const [
    propertyCount, activeProperties, guestCount, ownerCount,
    pendingBookings, newInquiries, avgRating,
    revenueMonth, pendingValueMonth, upcomingValue, cancelledMonth,
    fpBookedAgg, fpUpcoming, fpPending, fpConfirmed, fpCheckedIn, fpCompleted,
    requests, attention, arrivals, sparkData,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "GUEST" } }),
    prisma.user.count({ where: { role: "OWNER" } }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.review.aggregate({ _avg: { rating: true }, where: { status: "PUBLISHED" } }),

    // Payments this month
    prisma.booking.aggregate({ _sum: { totalPrice: true }, where: { status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] }, createdAt: { gte: monthStart } } }),
    prisma.booking.aggregate({ _sum: { totalPrice: true }, where: { status: "PENDING", createdAt: { gte: monthStart } } }),
    prisma.booking.aggregate({ _sum: { totalPrice: true }, where: { status: { in: ["CONFIRMED", "CHECKED_IN"] }, checkIn: { gte: now } } }),
    prisma.booking.aggregate({ _sum: { totalPrice: true }, where: { status: "CANCELLED", createdAt: { gte: monthStart } } }),

    // Featured property occupancy + pipeline
    featured
      ? prisma.booking.aggregate({ _sum: { units: true }, where: { propertyId: featured.id, status: { in: ACTIVE_BOOKING_STATUSES }, checkIn: { lte: now }, checkOut: { gte: now } } })
      : Promise.resolve({ _sum: { units: 0 } }),
    featured ? prisma.booking.count({ where: { propertyId: featured.id, status: { in: ACTIVE_BOOKING_STATUSES }, checkIn: { gte: now, lte: in30 } } }) : Promise.resolve(0),
    featured ? prisma.booking.count({ where: { propertyId: featured.id, status: "PENDING" } }) : Promise.resolve(0),
    featured ? prisma.booking.count({ where: { propertyId: featured.id, status: "CONFIRMED" } }) : Promise.resolve(0),
    featured ? prisma.booking.count({ where: { propertyId: featured.id, status: "CHECKED_IN" } }) : Promise.resolve(0),
    featured ? prisma.booking.count({ where: { propertyId: featured.id, status: "COMPLETED" } }) : Promise.resolve(0),

    // New requests (latest inquiries)
    prisma.inquiry.findMany({ take: 3, orderBy: { createdAt: "desc" }, select: { id: true, name: true, subject: true, message: true, createdAt: true } }),

    // Needs attention (oldest pending bookings)
    prisma.booking.findMany({
      where: { status: "PENDING" },
      take: 4,
      orderBy: { createdAt: "asc" },
      include: {
        property: { select: { title: true } },
        roomType: { select: { name: true } },
        guest: { select: { name: true, email: true, image: true } },
      },
    }),

    // Upcoming arrivals
    prisma.booking.findMany({
      where: { status: { in: ["CONFIRMED", "PENDING"] }, checkIn: { gte: now } },
      take: 4,
      orderBy: { checkIn: "asc" },
      include: {
        property: { select: { title: true, images: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }] } } },
        roomType: { select: { name: true } },
      },
    }),

    bookingsByDay(fourteenAgo, now),
  ])

  const booked = fpBookedAgg._sum.units ?? 0
  const available = Math.max(0, fpUnits - booked)
  const occupancy = fpUnits > 0 ? Math.round((booked / fpUnits) * 100) : 0
  const rating = avgRating._avg.rating ? Number(avgRating._avg.rating).toFixed(1) : "—"

  const heroImage = featured ? (getBannerImageUrl(featured.images) || FALLBACK) : FALLBACK

  const thisWeek = sparkData.slice(7).reduce((s, d) => s + d.count, 0)
  const lastWeek = sparkData.slice(0, 7).reduce((s, d) => s + d.count, 0)
  const wkDelta = thisWeek - lastWeek
  const wkPct = lastWeek > 0 ? Math.round((wkDelta / lastWeek) * 100) : null

  const firstName = session?.user?.name?.split(" ")[0] || "Admin"
  const hour = now.getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  const payments = [
    { label: "Revenue", value: revenueMonth._sum.totalPrice, alert: false },
    { label: "Upcoming", value: upcomingValue._sum.totalPrice, alert: false },
    { label: "Pending", value: pendingValueMonth._sum.totalPrice, alert: false },
    { label: "Cancelled", value: cancelledMonth._sum.totalPrice, alert: true },
  ]

  const navy = "text-[#1B3A5C]"
  const card = "bg-[#FFFDF8] border border-[#1B3A5C]/8 rounded-2xl"

  return (
    <div className="pb-12 space-y-6">

      {/* ── GREETING + ACTION ALERTS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">
            {format(now, "EEEE, d MMMM yyyy")}
          </p>
          <h1 className={`font-display text-2xl md:text-3xl ${navy} tracking-wide`}>{greeting}, {firstName}</h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {pendingBookings > 0 && (
            <Link href="/admin/bookings?status=PENDING" className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200/60 rounded-lg text-amber-700 hover:bg-amber-100/60 transition-colors">
              <AlertCircle className="h-4 w-4" />
              <span className="text-[12px] font-medium"><LiveCounter initial={pendingBookings} eventType="booking.created" /> to review</span>
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            </Link>
          )}
          {newInquiries > 0 && (
            <Link href="/admin/inquiries?status=NEW" className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 border border-rose-200/60 rounded-lg text-rose-700 hover:bg-rose-100/60 transition-colors">
              <Mail className="h-4 w-4" />
              <span className="text-[12px] font-medium"><LiveCounter initial={newInquiries} eventType="inquiry.created" /> new</span>
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            </Link>
          )}
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)] gap-6">

        {/* ─────────── LEFT: FEATURED PROPERTY ─────────── */}
        <div className={`${card} overflow-hidden self-start`}>
          {featured ? (
            <>
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImage} alt={featured.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#1B3A5C] text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1.5 rounded-full">
                  {featured.propertyType || "Property"}
                </span>

                {/* Property switcher — cycle through all active properties */}
                {allProperties.length > 1 && (
                  <>
                    {prevId && (
                      <Link
                        href={`/admin/dashboard?property=${prevId}`}
                        aria-label="Previous property"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#1B3A5C] flex items-center justify-center shadow-md transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Link>
                    )}
                    {nextId && (
                      <Link
                        href={`/admin/dashboard?property=${nextId}`}
                        aria-label="Next property"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#1B3A5C] flex items-center justify-center shadow-md transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                    <span className="absolute bottom-3 right-3 bg-black/55 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full tabular-nums">
                      {selectedIndex + 1} / {allProperties.length}
                    </span>
                  </>
                )}
              </div>

              <div className="p-5 space-y-5">
                <Link href={`/admin/properties/${featured.id}`} className="flex items-center justify-between group">
                  <div className="min-w-0">
                    <h2 className={`font-display text-lg ${navy} truncate`}>{featured.title}</h2>
                    <p className="text-[11px] text-[#1B3A5C]/40 truncate">{featured.location}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#1B3A5C]/30 group-hover:text-[#C9A96E] transition-colors shrink-0" />
                </Link>

                {/* Quick property dots */}
                {allProperties.length > 1 && (
                  <div className="flex flex-wrap gap-1.5">
                    {allProperties.map((p, i) => (
                      <Link
                        key={p.id}
                        href={`/admin/dashboard?property=${p.id}`}
                        title={p.title}
                        className={`h-1.5 rounded-full transition-all ${i === selectedIndex ? "w-6 bg-[#C9A96E]" : "w-1.5 bg-[#1B3A5C]/15 hover:bg-[#1B3A5C]/30"}`}
                      />
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { v: fpUnits, l: "Units" },
                    { v: booked, l: "Booked" },
                    { v: available, l: "Open" },
                    { v: fpUpcoming, l: "Arrivals" },
                  ].map((s) => (
                    <div key={s.l}>
                      <p className={`text-xl font-semibold ${navy} tabular-nums leading-tight`}>{s.v}</p>
                      <p className="text-[9px] text-[#1B3A5C]/40 uppercase tracking-[0.15em] mt-0.5">{s.l}</p>
                    </div>
                  ))}
                </div>

                {/* Occupancy */}
                <div className="space-y-1.5">
                  <div className="h-2 w-full rounded-full bg-[#1B3A5C]/8 overflow-hidden">
                    <div className="h-full rounded-full bg-[#C9A96E]" style={{ width: `${occupancy}%` }} />
                  </div>
                  <p className="text-[10px] text-[#1B3A5C]/45 font-medium">Occupied {occupancy}%</p>
                </div>

                {/* Booking pipeline */}
                <div className="space-y-3 pt-1">
                  <p className="text-[10px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.2em]">Bookings · 14 days</p>
                  <MiniBars data={sparkData} color="#1B3A5C" height={84} />
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {[
                      { v: fpPending, l: "New" },
                      { v: fpConfirmed, l: "Confirmed" },
                      { v: fpCheckedIn, l: "Staying" },
                      { v: fpCompleted, l: "Done" },
                    ].map((s) => (
                      <div key={s.l}>
                        <p className={`text-base font-semibold ${navy} tabular-nums`}>{s.v}</p>
                        <p className="text-[8px] text-[#1B3A5C]/40 uppercase tracking-[0.12em]">{s.l}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contacts */}
                <div className="pt-4 border-t border-[#1B3A5C]/8 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.2em]">Contacts</p>
                    <Link href={`/admin/properties/${featured.id}/calendar`} className="text-[10px] text-[#C9A96E] hover:underline">Calendar</Link>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#C9A96E] mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className={`${navy} font-medium truncate`}>{featured.owner?.name || "Owner"}</p>
                        <p className="text-[#1B3A5C]/40 truncate">{featured.owner?.phone || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <ConciergeBell className="h-3.5 w-3.5 text-[#C9A96E] mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className={`${navy} font-medium`}>Concierge</p>
                        <p className="text-[#1B3A5C]/40 truncate">{featured._count.bookings} bookings</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-10 text-center">
              <Building2 className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-3" />
              <p className="text-[13px] text-[#1B3A5C]/40">No active property yet.</p>
              <Link href="/admin/properties/new" className="text-[11px] text-[#C9A96E] hover:underline mt-2 inline-block">Add a property</Link>
            </div>
          )}
        </div>

        {/* ─────────── RIGHT COLUMN ─────────── */}
        <div className="space-y-6 min-w-0">

          {/* Payments */}
          <div className={`${card} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-[15px] font-semibold ${navy}`}>Payments</h2>
              <span className="text-[10px] text-[#1B3A5C]/35 bg-[#1B3A5C]/5 px-2.5 py-1 rounded-full">This month</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {payments.map((p) => (
                <div key={p.label}>
                  <p className={`text-lg sm:text-xl font-semibold tabular-nums ${p.alert ? "text-rose-500" : navy}`}>
                    {formatNpr(p.value ?? 0)}
                  </p>
                  <p className="text-[10px] text-[#1B3A5C]/40 mt-1 flex items-center gap-1">
                    {p.alert && <AlertCircle className="h-3 w-3 text-rose-400" />}
                    {p.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <AiInsights />

          {/* Platform stat strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Building2, label: "Properties", value: `${activeProperties}/${propertyCount}`, href: "/admin/properties" },
              { icon: Users, label: "Guests", value: guestCount, href: "/admin/users" },
              { icon: DoorOpen, label: "Owners", value: ownerCount, href: "/admin/owners" },
              { icon: Star, label: "Avg rating", value: rating, href: "/admin/reviews" },
            ].map(({ icon: Icon, label, value, href }) => (
              <Link key={label} href={href} className={`${card} p-4 hover:border-[#1B3A5C]/15 transition-colors group`}>
                <Icon className="h-4 w-4 text-[#1B3A5C]/25 mb-3 group-hover:text-[#C9A96E] transition-colors" />
                <p className={`text-xl font-semibold ${navy} tabular-nums leading-tight`}>{value}</p>
                <p className="text-[10px] text-[#1B3A5C]/40 mt-1 uppercase tracking-[0.15em]">{label}</p>
              </Link>
            ))}
          </div>

          {/* New Requests */}
          <div className={`${card} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-[15px] font-semibold ${navy}`}>New Requests</h2>
              <Link href="/admin/inquiries" className="text-[11px] text-[#1B3A5C]/40 hover:text-[#1B3A5C] flex items-center gap-1">View all <ChevronRight className="h-3.5 w-3.5" /></Link>
            </div>
            {requests.length === 0 ? (
              <p className="text-[13px] text-[#1B3A5C]/35 py-6 text-center">No requests right now.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {requests.map((r) => (
                  <Link key={r.id} href={`/admin/inquiries/${r.id}`} className="group">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#1B3A5C]/8 flex items-center justify-center shrink-0 text-xs font-semibold text-[#1B3A5C]/40">
                        {r.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-[12px] font-medium ${navy} truncate group-hover:text-[#C9A96E] transition-colors`}>{r.name}</p>
                        <p className="text-[10px] text-[#1B3A5C]/40 truncate">{r.subject}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#1B3A5C]/50 leading-relaxed line-clamp-2">{r.message}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Needs attention (pending bookings) */}
          <div className={`${card} overflow-hidden`}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1B3A5C]/8">
              <h2 className={`text-[15px] font-semibold ${navy}`}>Needs Attention</h2>
              <Link href="/admin/bookings?status=PENDING" className="text-[11px] text-[#1B3A5C]/40 hover:text-[#1B3A5C] flex items-center gap-1">All pending <ChevronRight className="h-3.5 w-3.5" /></Link>
            </div>
            {attention.length === 0 ? (
              <p className="text-[13px] text-[#1B3A5C]/35 py-10 text-center">Nothing pending — you&apos;re all caught up.</p>
            ) : (
              <div className="divide-y divide-[#1B3A5C]/5">
                {attention.map((b) => {
                  const pr = priorityFor(b.createdAt)
                  return (
                    <Link key={b.id} href={`/admin/bookings/${b.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#FBF9F4] transition-colors">
                      <span className="font-mono text-[11px] text-[#1B3A5C]/40 w-20 shrink-0 truncate">{b.bookingCode}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-medium ${navy} truncate`}>{b.property.title}</p>
                        <p className="text-[11px] text-[#1B3A5C]/40 truncate">{b.roomType?.name || "Whole property"}</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 w-32 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-[#1B3A5C]/8 flex items-center justify-center shrink-0 overflow-hidden text-[10px] font-semibold text-[#1B3A5C]/40">
                          {b.guest.image ? <img src={b.guest.image} alt="" className="w-full h-full object-cover" /> : (b.guest.name || b.guest.email)[0].toUpperCase()}
                        </div>
                        <span className="text-[11px] text-[#1B3A5C]/50 truncate">{b.guest.name || b.guest.email}</span>
                      </div>
                      <span className="hidden md:block text-[10px] text-[#1B3A5C]/35 w-16 text-right shrink-0">{formatDistanceToNowStrict(b.createdAt)} ago</span>
                      <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full shrink-0 ${pr.cls}`}>{pr.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Upcoming arrivals */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-[15px] font-semibold ${navy}`}>Upcoming Arrivals</h2>
              <span className="text-[10px] text-[#1B3A5C]/35 bg-[#1B3A5C]/5 px-2.5 py-1 rounded-full">Next stays</span>
            </div>
            {arrivals.length === 0 ? (
              <div className={`${card} py-10 text-center`}>
                <Calendar className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-3" />
                <p className="text-[13px] text-[#1B3A5C]/35">No upcoming arrivals.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {arrivals.map((b) => {
                  const img = getPrimaryImageUrl(b.property.images) || FALLBACK
                  const nights = Math.max(1, Math.round((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / 86400000))
                  return (
                    <Link key={b.id} href={`/admin/bookings/${b.id}`} className={`${card} overflow-hidden group`}>
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={b.property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-[#1B3A5C] text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <ArrowUpRight className="h-2.5 w-2.5" />
                        </span>
                      </div>
                      <div className="p-3 space-y-1.5">
                        <p className={`text-[12px] font-semibold ${navy} truncate`}>{b.property.title}</p>
                        <p className="text-[10px] text-[#1B3A5C]/45 truncate flex items-center gap-1">
                          <Bed className="h-3 w-3" /> {b.roomType?.name || "Whole property"}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-[#1B3A5C]/40">{format(new Date(b.checkIn), "d MMM")} · {nights}n</span>
                          <span className={`text-[12px] font-semibold ${navy}`}>{formatNpr(b.totalPrice)}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Week trend footnote */}
          {wkPct !== null && (
            <div className="flex items-center gap-2 text-[11px] text-[#1B3A5C]/45">
              {wkDelta >= 0 ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> : <TrendingDown className="h-3.5 w-3.5 text-rose-500" />}
              <span><strong className={navy}>{thisWeek}</strong> bookings this week · {wkDelta >= 0 ? "+" : ""}{wkPct}% vs last week</span>
              <Link href="/admin/reports" className="ml-auto text-[#C9A96E] hover:underline">Full report</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
