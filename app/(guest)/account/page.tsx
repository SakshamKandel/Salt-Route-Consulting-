import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Heart, Star, ArrowRight, MapPin, ChevronRight, MessageSquare } from "lucide-react"
import { getPrimaryImageUrl } from "@/lib/property-media"
import { format } from "date-fns"

const STATUS_CHIP: Record<string, string> = {
  CONFIRMED:  "bg-emerald-50 text-emerald-600 border-emerald-200/60",
  PENDING:    "bg-amber-50 text-amber-600 border-amber-200/60",
  CANCELLED:  "bg-red-50 text-red-500 border-red-200/60",
  COMPLETED:  "bg-[#1B3A5C]/5 text-[#1B3A5C]/50 border-[#1B3A5C]/10",
}
const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "Confirmed",
  PENDING: "Pending",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
}

export default async function AccountDashboard() {
  const session = await auth()
  if (!session?.user?.id) return null

  const now = new Date()

  const [bookingsCount, wishlistCount, reviewsCount, upcomingBooking, recentBookings, wishlistItems] = await Promise.all([
    prisma.booking.count({ where: { guestId: session.user.id } }),
    prisma.wishlist.count({ where: { userId: session.user.id } }),
    prisma.review.count({ where: { guestId: session.user.id } }),
    prisma.booking.findFirst({
      where: { guestId: session.user.id, checkIn: { gte: now }, status: "CONFIRMED" },
      orderBy: { checkIn: "asc" },
      include: { property: { include: { images: { take: 1, orderBy: { order: "asc" } } } } },
    }),
    prisma.booking.findMany({
      where: { guestId: session.user.id },
      orderBy: { checkIn: "desc" },
      take: 4,
      include: { property: { include: { images: { take: 1, orderBy: { order: "asc" } } } } },
    }),
    prisma.wishlist.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { property: { include: { images: { take: 1, orderBy: { order: "asc" } } } } },
    }),
  ])

  const hour = now.getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const firstName = session.user.name?.split(" ")[0] ?? "Guest"

  return (
    <div className="space-y-10">

      {/* ── GREETING ── */}
      <div>
        <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">
          {format(now, "EEEE, d MMMM yyyy")}
        </p>
        <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">
          {greeting}, {firstName}
        </h1>
      </div>

      {/* ── STAT STRIP ── */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Reservations", value: bookingsCount, icon: Calendar, href: "/account/bookings" },
          { label: "Collection",   value: wishlistCount, icon: Heart,    href: "/account/wishlist" },
          { label: "Reviews",      value: reviewsCount,  icon: Star,     href: "/account/reviews"  },
        ].map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-[#FFFDF8] border border-[#1B3A5C]/8 rounded-xl p-4 sm:p-5 hover:border-[#1B3A5C]/15 transition-colors group"
          >
            <Icon className="h-4 w-4 text-[#1B3A5C]/25 mb-2.5 group-hover:text-[#C9A96E] transition-colors" />
            <p className="text-2xl font-semibold text-[#1B3A5C] tabular-nums leading-tight">{value}</p>
            <p className="text-[10px] text-[#1B3A5C]/40 mt-1 uppercase tracking-[0.2em] font-medium">{label}</p>
          </Link>
        ))}
      </div>

      {/* ── UPCOMING STAY ── */}
      {upcomingBooking ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-[#1B3A5C]">Your next stay</h2>
            <Link href="/account/bookings" className="text-[11px] text-[#1B3A5C]/40 hover:text-[#1B3A5C] flex items-center gap-1 transition-colors">
              All bookings <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <Link
            href={`/account/bookings/${upcomingBooking.id}`}
            className="flex flex-col sm:flex-row bg-[#FFFDF8] border border-[#1B3A5C]/8 rounded-xl overflow-hidden hover:border-[#1B3A5C]/15 transition-colors group"
          >
            {/* Property image */}
            <div className="relative w-full sm:w-48 h-40 sm:h-auto bg-[#1B3A5C]/5 shrink-0">
              {getPrimaryImageUrl(upcomingBooking.property.images) ? (
                <Image
                  src={getPrimaryImageUrl(upcomingBooking.property.images)!}
                  alt={upcomingBooking.property.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-[#1B3A5C]/15" />
                </div>
              )}
              {/* Confirmed badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#FFFDF8] border border-emerald-200/60 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-semibold text-emerald-600 uppercase tracking-[0.15em]">Confirmed</span>
              </div>
            </div>

            {/* Stay info */}
            <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between gap-4">
              <div>
                <p className="text-[10px] text-[#C9A96E] uppercase tracking-[0.2em] font-medium mb-1.5 flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5" />
                  {upcomingBooking.property.location}
                </p>
                <h3 className="font-display text-xl md:text-2xl text-[#1B3A5C] tracking-wide">{upcomingBooking.property.title}</h3>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-[9px] text-[#1B3A5C]/35 uppercase tracking-[0.3em] mb-1">Check in</p>
                  <p className="text-[15px] font-semibold text-[#1B3A5C]">
                    {format(new Date(upcomingBooking.checkIn), "EEE, d MMM yyyy")}
                  </p>
                </div>
                <div className="w-6 h-px bg-[#1B3A5C]/15 hidden sm:block" />
                <div>
                  <p className="text-[9px] text-[#1B3A5C]/35 uppercase tracking-[0.3em] mb-1">Check out</p>
                  <p className="text-[15px] font-semibold text-[#1B3A5C]">
                    {format(new Date(upcomingBooking.checkOut), "EEE, d MMM yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1B3A5C]/50">
                  View stay details <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      ) : (
        <div className="bg-[#FFFDF8] border border-[#1B3A5C]/8 rounded-xl p-8 sm:p-12 text-center">
          <Calendar className="h-8 w-8 text-[#1B3A5C]/15 mx-auto mb-4" />
          <h3 className="font-display text-xl text-[#1B3A5C] mb-2">No upcoming stays</h3>
          <p className="text-[13px] text-[#1B3A5C]/40 mb-6 max-w-sm mx-auto">
            Nepal is waiting. Explore our handpicked retreats and plan your next quiet escape.
          </p>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B3A5C] text-[#FFFDF8] rounded-lg text-[12px] font-medium hover:bg-[#2A4F7A] transition-colors"
          >
            Explore stays <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* ── TWO-COLUMN: RECENT STAYS + SAVED ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent stays */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-[#1B3A5C]">Recent stays</h2>
            <Link href="/account/bookings" className="text-[11px] text-[#1B3A5C]/40 hover:text-[#1B3A5C] flex items-center gap-1 transition-colors">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="bg-[#FFFDF8] border border-[#1B3A5C]/8 rounded-xl divide-y divide-[#1B3A5C]/5 overflow-hidden">
            {recentBookings.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-[13px] text-[#1B3A5C]/30">No bookings yet</p>
              </div>
            ) : recentBookings.map((booking) => {
              const img = getPrimaryImageUrl(booking.property.images)
              const chip = STATUS_CHIP[booking.status] ?? STATUS_CHIP.PENDING
              return (
                <Link
                  key={booking.id}
                  href={`/account/bookings/${booking.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#FBF9F4] transition-colors group"
                >
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#1B3A5C]/5 shrink-0">
                    {img ? (
                      <Image src={img} alt={booking.property.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#1B3A5C] truncate">{booking.property.title}</p>
                    <p className="text-[11px] text-[#1B3A5C]/40 mt-0.5">
                      {format(new Date(booking.checkIn), "d MMM")} – {format(new Date(booking.checkOut), "d MMM yyyy")}
                    </p>
                  </div>
                  <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border shrink-0 ${chip}`}>
                    {STATUS_LABEL[booking.status] ?? booking.status}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Saved stays */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-[#1B3A5C]">Saved stays</h2>
            <Link href="/account/wishlist" className="text-[11px] text-[#1B3A5C]/40 hover:text-[#1B3A5C] flex items-center gap-1 transition-colors">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="bg-[#FFFDF8] border border-[#1B3A5C]/8 rounded-xl py-10 text-center">
              <Heart className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-3" />
              <p className="text-[13px] text-[#1B3A5C]/30">Your collection is empty</p>
              <Link href="/properties" className="mt-3 inline-flex text-[11px] text-[#C9A96E] hover:underline">
                Browse properties
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {wishlistItems.slice(0, 4).map((item) => {
                const img = getPrimaryImageUrl(item.property.images)
                return (
                  <Link
                    key={item.id}
                    href={`/properties/${item.property.slug}`}
                    className="bg-[#FFFDF8] border border-[#1B3A5C]/8 rounded-xl overflow-hidden hover:border-[#1B3A5C]/15 transition-colors group"
                  >
                    <div className="relative h-24 bg-[#1B3A5C]/5">
                      {img ? (
                        <Image src={img} alt={item.property.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Heart className="h-5 w-5 text-[#1B3A5C]/15" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-[12px] font-medium text-[#1B3A5C] truncate">{item.property.title}</p>
                      <p className="text-[10px] text-[#1B3A5C]/35 mt-0.5 flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5 shrink-0" />{item.property.location}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* ── CONCIERGE CTA ── */}
      <div className="bg-[#1B3A5C] rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div>
          <h3 className="font-display text-xl text-[#FFFDF8] tracking-wide">Personal concierge</h3>
          <p className="text-[12px] text-[#FFFDF8]/45 mt-1.5 max-w-sm">
            Our specialists can curate every detail of your journey — from itinerary to arrival.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/account/messages"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFFDF8] text-[#1B3A5C] rounded-lg text-[12px] font-semibold hover:bg-[#F5F1E8] transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Contact us
          </Link>
          <Link
            href="/account/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#FFFDF8]/15 text-[#FFFDF8]/70 rounded-lg text-[12px] font-medium hover:border-[#FFFDF8]/30 hover:text-[#FFFDF8] transition-colors"
          >
            My profile
          </Link>
        </div>
      </div>

    </div>
  )
}
