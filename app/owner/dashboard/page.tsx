import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { formatNpr } from "@/lib/currency"
import { getPrimaryImageUrl } from "@/lib/property-media"
import {
  ArrowRight, BedDouble, Calendar, Edit3,
  Home, MessageCircle, TrendingUp, Users,
  ChevronRight, MapPin, AlertCircle,
} from "lucide-react"
import { format } from "date-fns"

const STATUS_CHIP: Record<string, { label: string; cls: string }> = {
  PENDING:    { label: "Awaiting review", cls: "bg-amber-50 text-amber-600 border-amber-200/60" },
  CONFIRMED:  { label: "Confirmed",       cls: "bg-emerald-50 text-emerald-600 border-emerald-200/60" },
  CHECKED_IN: { label: "Checked in",      cls: "bg-sky-50 text-sky-600 border-sky-200/60" },
  COMPLETED:  { label: "Completed",       cls: "bg-[#1B3A5C]/5 text-[#1B3A5C]/50 border-[#1B3A5C]/10" },
  CANCELLED:  { label: "Cancelled",       cls: "bg-red-50 text-red-500 border-red-200/60" },
}

export default async function OwnerDashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const now = new Date()

  const [
    propertiesCount,
    totalConfirmed,
    upcomingArrivals,
    totalRevenue,
    recentBookings,
    unreadMessages,
    properties,
    pendingBookings,
  ] = await Promise.all([
    prisma.property.count({ where: { ownerId: session.user.id, status: { not: "ARCHIVED" } } }),
    prisma.booking.count({
      where: {
        property: { ownerId: session.user.id },
        status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] },
      },
    }),
    prisma.booking.count({
      where: {
        property: { ownerId: session.user.id },
        status: "CONFIRMED",
        checkIn: { gte: now },
      },
    }),
    prisma.booking.aggregate({
      where: {
        property: { ownerId: session.user.id },
        status: { in: ["CONFIRMED", "COMPLETED", "CHECKED_IN"] },
      },
      _sum: { totalPrice: true },
    }),
    prisma.booking.findMany({
      where: {
        property: { ownerId: session.user.id },
        status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] },
        checkIn: { gte: now },
      },
      take: 5,
      orderBy: { checkIn: "asc" },
      include: {
        property: { select: { title: true, id: true, location: true } },
        guest: { select: { name: true, email: true, image: true } },
      },
    }),
    prisma.inquiry.count({
      where: {
        ownerId: session.user.id,
        status: { not: "CLOSED" },
        lastMessageBy: "ADMIN",
        ownerLastReadAt: null,
      },
    }),
    prisma.property.findMany({
      where: { ownerId: session.user.id, status: { not: "ARCHIVED" } },
      take: 4,
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
      include: {
        images: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }], take: 1 },
        _count: {
          select: {
            bookings: { where: { status: { in: ["CONFIRMED", "COMPLETED", "CHECKED_IN"] } } },
            reviews: true,
          },
        },
      },
    }),
    prisma.booking.count({
      where: {
        property: { ownerId: session.user.id },
        status: "PENDING",
      },
    }),
  ])

  const firstName = session.user.name?.split(" ")[0] ?? "Partner"
  const hour = now.getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  const stats = [
    { icon: Home,        label: "Properties",    value: propertiesCount,                          href: "/owner/properties" },
    { icon: Calendar,    label: "Upcoming",       value: upcomingArrivals,                         href: "/owner/bookings" },
    { icon: Users,       label: "Total stays",    value: totalConfirmed,                           href: "/owner/bookings" },
    { icon: TrendingUp,  label: "Total earnings", value: formatNpr(totalRevenue._sum.totalPrice),  href: "/owner/reports" },
  ]

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
        <Link
          href="/owner/request-edit"
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#1B3A5C]/15 rounded-lg text-[11px] font-medium text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 transition-colors"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Request property update
        </Link>
      </div>

      {/* ── ACTION ALERTS ── */}
      {(pendingBookings > 0 || unreadMessages > 0) && (
        <div className="flex flex-wrap gap-3">
          {pendingBookings > 0 && (
            <Link
              href="/owner/bookings?status=PENDING"
              className="flex items-center gap-2.5 px-4 py-2.5 bg-amber-50 border border-amber-200/60 rounded-lg text-amber-700 hover:bg-amber-100/60 transition-colors"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="text-[12px] font-medium">
                {pendingBookings} booking{pendingBookings > 1 ? "s" : ""} awaiting your review
              </span>
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            </Link>
          )}
          {unreadMessages > 0 && (
            <Link
              href="/owner/messages"
              className="flex items-center gap-2.5 px-4 py-2.5 bg-sky-50 border border-sky-200/60 rounded-lg text-sky-700 hover:bg-sky-100/60 transition-colors"
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              <span className="text-[12px] font-medium">
                {unreadMessages} unread message{unreadMessages > 1 ? "s" : ""}
              </span>
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            </Link>
          )}
        </div>
      )}

      {/* ── STAT STRIP ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(({ icon: Icon, label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-[#FFFDF8] border border-[#1B3A5C]/8 rounded-xl p-4 sm:p-5 hover:border-[#1B3A5C]/15 transition-colors group"
          >
            <Icon className="h-4 w-4 text-[#1B3A5C]/25 mb-3 group-hover:text-[#C9A96E] transition-colors" />
            <p className="text-xl sm:text-2xl font-semibold text-[#1B3A5C] leading-tight tabular-nums">{value}</p>
            <p className="text-[10px] text-[#1B3A5C]/40 mt-1 uppercase tracking-[0.2em] font-medium">{label}</p>
          </Link>
        ))}
      </div>

      {/* ── UPCOMING RESERVATIONS ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-[#1B3A5C]">Upcoming reservations</h2>
          <Link href="/owner/bookings" className="text-[11px] text-[#1B3A5C]/40 hover:text-[#1B3A5C] flex items-center gap-1 transition-colors">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="bg-[#FFFDF8] border border-[#1B3A5C]/8 rounded-xl overflow-hidden divide-y divide-[#1B3A5C]/5">
          {recentBookings.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-3" />
              <p className="text-[13px] text-[#1B3A5C]/35 font-medium">No upcoming reservations</p>
              <p className="text-[11px] text-[#1B3A5C]/25 mt-1">Confirmed bookings will appear here</p>
            </div>
          ) : recentBookings.map((b) => {
            const chip = STATUS_CHIP[b.status] ?? STATUS_CHIP.PENDING
            const nights = Math.ceil((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / 86400000)
            return (
              <Link
                key={b.id}
                href={`/owner/bookings/${b.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-[#FBF9F4] transition-colors group"
              >
                {/* Guest avatar */}
                <div className="w-9 h-9 rounded-full bg-[#1B3A5C]/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {b.guest.image
                    ? <img src={b.guest.image} alt="" className="w-full h-full object-cover" />
                    : <span className="text-xs font-semibold text-[#1B3A5C]/50">{(b.guest.name || b.guest.email)[0].toUpperCase()}</span>
                  }
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#1B3A5C] truncate">
                    {b.guest.name || b.guest.email}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[11px] text-[#1B3A5C]/40">{b.property.title}</span>
                    <span className="text-[#1B3A5C]/15">·</span>
                    <span className="text-[11px] text-[#1B3A5C]/40">
                      {format(new Date(b.checkIn), "d MMM")} – {format(new Date(b.checkOut), "d MMM yyyy")}
                    </span>
                    <span className="text-[#1B3A5C]/15">·</span>
                    <span className="text-[11px] text-[#1B3A5C]/40">{nights} night{nights !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                {/* Status chip */}
                <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-semibold border uppercase tracking-[0.15em] shrink-0 ${chip.cls}`}>
                  {chip.label}
                </span>
                <ChevronRight className="h-4 w-4 text-[#1B3A5C]/20 group-hover:text-[#1B3A5C]/40 shrink-0" />
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── PROPERTIES ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-[#1B3A5C]">Your properties</h2>
          <Link href="/owner/properties" className="text-[11px] text-[#1B3A5C]/40 hover:text-[#1B3A5C] flex items-center gap-1 transition-colors">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="bg-[#FFFDF8] border border-[#1B3A5C]/8 rounded-xl py-14 text-center">
            <Home className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-3" />
            <p className="text-[13px] text-[#1B3A5C]/35 font-medium">No properties yet</p>
            <p className="text-[11px] text-[#1B3A5C]/25 mt-1">Salt Route will add your property once preparations begin</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {properties.map((property) => {
              const image = getPrimaryImageUrl(property.images)
              return (
                <Link
                  key={property.id}
                  href={`/owner/properties/${property.id}`}
                  className="bg-[#FFFDF8] border border-[#1B3A5C]/8 rounded-xl overflow-hidden hover:border-[#1B3A5C]/15 transition-colors group"
                >
                  {/* Property image */}
                  <div className="relative h-36 bg-[#1B3A5C]/5">
                    {image ? (
                      <Image
                        src={image}
                        alt={property.title}
                        fill
                        sizes="280px"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Home className="h-8 w-8 text-[#1B3A5C]/15" />
                      </div>
                    )}
                  </div>
                  {/* Property info */}
                  <div className="p-4">
                    <p className="text-[10px] text-[#C9A96E] uppercase tracking-[0.2em] font-medium mb-1.5 flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5" />{property.location}
                    </p>
                    <h3 className="text-[13px] font-semibold text-[#1B3A5C] leading-snug mb-3 line-clamp-1">{property.title}</h3>
                    <div className="flex items-center justify-between text-[11px] text-[#1B3A5C]/40">
                      <span>{property._count.bookings} stay{property._count.bookings !== 1 ? "s" : ""}</span>
                      <span>{property._count.reviews} review{property._count.reviews !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div>
        <h2 className="text-[15px] font-semibold text-[#1B3A5C] mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Calendar,        label: "View all stays",      desc: "See guests and booking dates",           href: "/owner/bookings" },
            { icon: TrendingUp,      label: "Earnings report",     desc: "Revenue and stay analytics",             href: "/owner/reports" },
            { icon: MessageCircle,   label: "Messages",            desc: "Support from Salt Route team",           href: "/owner/messages" },
            { icon: Edit3,           label: "Request an update",   desc: "Update photos, pricing, or amenities",   href: "/owner/request-edit" },
          ].map(({ icon: Icon, label, desc, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-start gap-3 bg-[#FFFDF8] border border-[#1B3A5C]/8 rounded-xl p-4 hover:border-[#1B3A5C]/15 hover:bg-[#FBF9F4] transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#1B3A5C]/5 flex items-center justify-center shrink-0 group-hover:bg-[#1B3A5C]/10 transition-colors">
                <Icon className="h-4 w-4 text-[#1B3A5C]/40" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[#1B3A5C] leading-snug">{label}</p>
                <p className="text-[11px] text-[#1B3A5C]/35 mt-0.5 leading-snug">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
