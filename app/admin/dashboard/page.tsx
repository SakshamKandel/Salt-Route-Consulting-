import { prisma } from "@/lib/db"
import { LiveCounter } from "@/components/admin/live-counter"
import { Sparkline } from "@/components/admin/charts/sparkline"
import {
  Home, Users, Building2, TrendingUp, TrendingDown,
  ChevronRight, Calendar, Mail, Star, AlertCircle,
  CheckCircle2, Clock,
} from "lucide-react"
import { serializeForClient } from "@/lib/serialize"
import { bookingsByDay } from "@/lib/admin/analytics"
import { subDays, format } from "date-fns"
import Link from "next/link"
import { auth } from "@/auth"

const BOOKING_STATUS: Record<string, { label: string; dot: string; chip: string }> = {
  PENDING:   { label: "Awaiting review", dot: "bg-amber-400",   chip: "bg-amber-50 text-amber-600 border-amber-200/60" },
  CONFIRMED: { label: "Confirmed",       dot: "bg-emerald-400", chip: "bg-emerald-50 text-emerald-600 border-emerald-200/60" },
  CANCELLED: { label: "Cancelled",       dot: "bg-red-400",     chip: "bg-red-50 text-red-500 border-red-200/60" },
  COMPLETED: { label: "Completed",       dot: "bg-sky-400",     chip: "bg-sky-50 text-sky-600 border-sky-200/60" },
}

const INQUIRY_STATUS: Record<string, { label: string; dot: string }> = {
  NEW:       { label: "New",     dot: "bg-rose-400" },
  RESPONDED: { label: "Replied", dot: "bg-sky-400"  },
  CLOSED:    { label: "Closed",  dot: "bg-[#1B3A5C]/20" },
}

export default async function AdminDashboard() {
  const session = await auth()
  const now = new Date()
  const sevenDaysAgo = subDays(now, 7)
  const fourteenDaysAgo = subDays(now, 14)

  const [
    propertyCount,
    userCount,
    ownerCount,
    pendingBookings,
    confirmedBookings,
    newInquiries,
    recentBookings,
    recentInquiries,
    sparkData,
    lastWeekData,
    avgRating,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.user.count({ where: { role: "GUEST" } }),
    prisma.user.count({ where: { role: "OWNER" } }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.booking.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        property: { select: { title: true } },
        guest: { select: { name: true, email: true, image: true } },
      },
    }),
    prisma.inquiry.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, subject: true, status: true, createdAt: true },
    }),
    bookingsByDay(sevenDaysAgo, now),
    bookingsByDay(fourteenDaysAgo, sevenDaysAgo),
    prisma.review.aggregate({ _avg: { rating: true }, where: { status: "PUBLISHED" } }),
  ])

  const thisWeek = sparkData.reduce((s, d) => s + d.count, 0)
  const lastWeek = lastWeekData.reduce((s, d) => s + d.count, 0)
  const delta = thisWeek - lastWeek
  const pct = lastWeek > 0 ? Math.round((delta / lastWeek) * 100) : null
  const rating = avgRating._avg.rating ? Number(avgRating._avg.rating).toFixed(1) : "—"

  type SBooking = {
    id: string; status: string; checkIn: string
    property: { title: string }
    guest: { name: string | null; email: string; image: string | null }
  }
  type SInquiry = { id: string; name: string; subject: string; status: string; createdAt: string }

  const bookings = serializeForClient(recentBookings) as unknown as SBooking[]
  const inquiries = serializeForClient(recentInquiries) as unknown as SInquiry[]

  const hour = now.getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  const firstName = session?.user?.name?.split(" ")[0] || "Admin"

  return (
    <div className="pb-12 space-y-8">

      {/* ── GREETING ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">
            {format(now, "EEEE, d MMMM yyyy")}
          </p>
          <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">
            {greeting}, {firstName}
          </h1>
        </div>
        <p className="text-[11px] text-[#1B3A5C]/35 hidden sm:block">
          Platform overview
        </p>
      </div>

      {/* ── ACTION ALERTS ── */}
      {(pendingBookings > 0 || newInquiries > 0) && (
        <div className="flex flex-wrap gap-3">
          {pendingBookings > 0 && (
            <Link
              href="/admin/bookings?status=PENDING"
              className="flex items-center gap-2.5 px-4 py-2.5 bg-amber-50 border border-amber-200/60 rounded-lg text-amber-700 hover:bg-amber-100/60 transition-colors"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="text-[12px] font-medium">
                <LiveCounter initial={pendingBookings} eventType="booking.created" /> pending booking{pendingBookings !== 1 ? "s" : ""} need review
              </span>
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            </Link>
          )}
          {newInquiries > 0 && (
            <Link
              href="/admin/inquiries?status=NEW"
              className="flex items-center gap-2.5 px-4 py-2.5 bg-rose-50 border border-rose-200/60 rounded-lg text-rose-700 hover:bg-rose-100/60 transition-colors"
            >
              <Mail className="h-4 w-4 shrink-0" />
              <span className="text-[12px] font-medium">
                <LiveCounter initial={newInquiries} eventType="inquiry.created" /> new inquiry{newInquiries !== 1 ? "s" : ""} waiting
              </span>
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            </Link>
          )}
        </div>
      )}

      {/* ── STAT STRIP ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: Home,      label: "Properties",       value: propertyCount,  href: "/admin/properties" },
          { icon: Users,     label: "Guests",           value: userCount,      href: "/admin/users"      },
          { icon: Building2, label: "Owners",           value: ownerCount,     href: "/admin/owners"     },
          { icon: Star,      label: "Avg rating",       value: rating,         href: "/admin/reviews"    },
        ].map(({ icon: Icon, label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-[#FFFDF8] border border-[#1B3A5C]/8 rounded-xl p-4 sm:p-5 hover:border-[#1B3A5C]/15 transition-colors group"
          >
            <Icon className="h-4 w-4 text-[#1B3A5C]/25 mb-3 group-hover:text-[#C9A96E] transition-colors" />
            <p className="text-xl sm:text-2xl font-semibold text-[#1B3A5C] tabular-nums leading-tight">{value}</p>
            <p className="text-[10px] text-[#1B3A5C]/40 mt-1 uppercase tracking-[0.2em] font-medium">{label}</p>
          </Link>
        ))}
      </div>

      {/* ── BOOKINGS TREND ── */}
      <div className="bg-[#FFFDF8] border border-[#1B3A5C]/8 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-3">
          <div className="flex items-baseline gap-4 flex-wrap">
            <div>
              <p className="text-[10px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.25em] mb-1.5">Bookings this week</p>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-semibold text-[#1B3A5C] tabular-nums">{thisWeek}</p>
                {pct !== null && (
                  <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    delta >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                  }`}>
                    {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {delta >= 0 ? "+" : ""}{pct}% vs last week
                  </span>
                )}
              </div>
            </div>
          </div>
          <Link href="/admin/reports" className="text-[10px] text-[#1B3A5C]/30 hover:text-[#1B3A5C] flex items-center gap-0.5 transition-colors">
            Full report <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="px-5 sm:px-6 pb-5 pt-1">
          <Sparkline data={sparkData} height={90} color="#C9A96E" />
        </div>
      </div>

      {/* ── ACTIVITY FEEDS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent bookings */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-[#1B3A5C]">Recent bookings</h2>
            <Link href="/admin/bookings" className="text-[11px] text-[#1B3A5C]/40 hover:text-[#1B3A5C] flex items-center gap-1 transition-colors">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="bg-[#FFFDF8] border border-[#1B3A5C]/8 rounded-xl divide-y divide-[#1B3A5C]/5 overflow-hidden">
            {bookings.length === 0 ? (
              <div className="py-12 text-center">
                <Calendar className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-3" />
                <p className="text-[13px] text-[#1B3A5C]/35 font-medium">No bookings yet</p>
              </div>
            ) : bookings.map((b) => {
              const st = BOOKING_STATUS[b.status] ?? BOOKING_STATUS.PENDING
              return (
                <Link
                  key={b.id}
                  href={`/admin/bookings/${b.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#FBF9F4] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1B3A5C]/8 flex items-center justify-center shrink-0 overflow-hidden">
                    {b.guest.image
                      ? <img src={b.guest.image} alt="" className="w-full h-full object-cover" />
                      : <span className="text-xs font-semibold text-[#1B3A5C]/40">{(b.guest.name || b.guest.email)[0].toUpperCase()}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#1B3A5C] truncate">{b.property.title}</p>
                    <p className="text-[11px] text-[#1B3A5C]/40 mt-0.5">
                      {b.guest.name || b.guest.email}
                      <span className="mx-1.5 text-[#1B3A5C]/15">·</span>
                      {format(new Date(b.checkIn), "d MMM yyyy")}
                    </p>
                  </div>
                  <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border shrink-0 ${st.chip}`}>
                    {st.label}
                  </span>
                  <div className={`sm:hidden w-2 h-2 rounded-full shrink-0 ${st.dot}`} />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent inquiries */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-[#1B3A5C]">Recent inquiries</h2>
            <Link href="/admin/inquiries" className="text-[11px] text-[#1B3A5C]/40 hover:text-[#1B3A5C] flex items-center gap-1 transition-colors">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="bg-[#FFFDF8] border border-[#1B3A5C]/8 rounded-xl divide-y divide-[#1B3A5C]/5 overflow-hidden">
            {inquiries.length === 0 ? (
              <div className="py-12 text-center">
                <Mail className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-3" />
                <p className="text-[13px] text-[#1B3A5C]/35 font-medium">No inquiries yet</p>
              </div>
            ) : inquiries.map((inq) => {
              const st = INQUIRY_STATUS[inq.status] ?? INQUIRY_STATUS.NEW
              return (
                <Link
                  key={inq.id}
                  href={`/admin/inquiries/${inq.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#FBF9F4] transition-colors group"
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${st.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#1B3A5C] truncate">{inq.name}</p>
                    <p className="text-[11px] text-[#1B3A5C]/40 mt-0.5 truncate">{inq.subject}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-[#1B3A5C]/25 hidden sm:inline">
                      {format(new Date(inq.createdAt), "d MMM")}
                    </span>
                    {inq.status === "NEW" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-200/60">
                        New
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

      </div>

      {/* ── PLATFORM OVERVIEW ── */}
      <div>
        <h2 className="text-[15px] font-semibold text-[#1B3A5C] mb-4">Platform overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              icon: CheckCircle2,
              label: "Active reservations",
              value: confirmedBookings,
              desc: "Currently confirmed",
              href: "/admin/bookings?status=CONFIRMED",
              iconCls: "text-emerald-500",
              bgCls: "bg-emerald-50",
            },
            {
              icon: Clock,
              label: "Pending review",
              value: pendingBookings,
              desc: "Bookings awaiting action",
              href: "/admin/bookings?status=PENDING",
              iconCls: "text-amber-500",
              bgCls: "bg-amber-50",
            },
            {
              icon: Star,
              label: "Platform rating",
              value: rating,
              desc: "Average review score",
              href: "/admin/reviews",
              iconCls: "text-[#C9A96E]",
              bgCls: "bg-[#C9A96E]/10",
            },
          ].map(({ icon: Icon, label, value, desc, href, iconCls, bgCls }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-4 bg-[#FFFDF8] border border-[#1B3A5C]/8 rounded-xl p-4 sm:p-5 hover:border-[#1B3A5C]/15 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl ${bgCls} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${iconCls}`} />
              </div>
              <div>
                <p className="text-xl font-semibold text-[#1B3A5C] tabular-nums">{value}</p>
                <p className="text-[12px] font-medium text-[#1B3A5C]/70">{label}</p>
                <p className="text-[10px] text-[#1B3A5C]/35 mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
