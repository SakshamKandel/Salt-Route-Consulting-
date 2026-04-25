import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { formatNpr } from "@/lib/currency"
import { getPrimaryImageUrl } from "@/lib/property-media"
import {
  ArrowRight,
  BedDouble,
  Calendar,
  Camera,
  Home,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react"

export default async function OwnerDashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [
    propertiesCount,
    totalConfirmed,
    upcomingArrivals,
    totalRevenue,
    recentBookings,
    unreadMessages,
    properties,
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
        checkIn: { gte: new Date() },
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
        status: "CONFIRMED",
        checkIn: { gte: new Date() },
      },
      take: 6,
      orderBy: { checkIn: "asc" },
      include: {
        property: { select: { title: true, id: true, location: true } },
        guest: { select: { name: true, email: true } },
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
      take: 5,
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
  ])

  const firstName = session.user.name?.split(" ")[0] ?? "Partner"
  const heroProperty = properties[0]
  const heroImage = heroProperty ? getPrimaryImageUrl(heroProperty.images) : null
  const visiblePropertyCount = properties.length

  const metrics = [
    {
      icon: Home,
      label: "Properties In Care",
      value: String(propertiesCount),
      href: "/owner/properties",
    },
    {
      icon: Users,
      label: "Confirmed Stays",
      value: String(totalConfirmed),
      href: "/owner/bookings",
    },
    {
      icon: Calendar,
      label: "Upcoming Arrivals",
      value: String(upcomingArrivals),
      href: "/owner/bookings",
    },
    {
      icon: TrendingUp,
      label: "Portfolio Revenue",
      value: formatNpr(totalRevenue._sum.totalPrice),
      href: "/owner/reports",
    },
  ]

  const quickActions = [
    { label: "Open Portfolio", href: "/owner/properties", desc: "Review each property room" },
    { label: "Reservation Ledger", href: "/owner/bookings", desc: "Track guests and stay dates" },
    { label: "Performance", href: "/owner/reports", desc: "Read revenue and booking signals" },
    { label: "Request Listing Edit", href: "/owner/request-edit", desc: "Update photos, pricing, amenities" },
  ]

  return (
    <div className="space-y-14">
      <section
        className="relative overflow-hidden border border-gold/12 bg-[#07111C]"
        style={{ minHeight: "360px" }}
      >
        {heroImage ? (
          <Image
            src={heroImage}
            alt={heroProperty?.title ?? "Owner property"}
            fill
            priority
            sizes="(min-width: 1024px) 900px, 100vw"
            className="object-cover opacity-[0.45]"
          />
        ) : (
          <div className="absolute inset-0 bg-[#07111C]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07111C] via-[#07111C]/82 to-[#07111C]/28" />

        <div className="relative z-10 grid gap-8 px-6 py-10 sm:px-9 md:px-12 lg:grid-cols-[1fr_340px] lg:items-end">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-gold/55" />
              <p className="text-[9px] uppercase tracking-[0.42em] text-gold/70">Property Partner Portal</p>
            </div>
            <h1 className="mt-6 font-display text-4xl leading-[1.08] tracking-wide text-sand/92 md:text-6xl">
              Good day, {firstName}. Your properties are ready.
            </h1>
            <p className="mt-6 max-w-2xl text-sm font-light leading-[1.9] text-sand/48 md:text-base">
              Review portfolio health, upcoming guest movement, listing readiness, and Salt Route support from one property-focused view.
            </p>

            {unreadMessages > 0 && (
              <Link
                href="/owner/messages"
                className="mt-7 inline-flex items-center gap-3 border border-gold/25 bg-gold/8 px-5 py-3 text-[9px] font-medium uppercase tracking-[0.3em] text-gold transition-colors duration-500 hover:bg-gold hover:text-[#07111C]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                {unreadMessages} new message{unreadMessages > 1 ? "s" : ""}
              </Link>
            )}
          </div>

          <div className="border border-gold/14 bg-[#07111C]/72 p-6 backdrop-blur">
            <p className="text-[9px] uppercase tracking-[0.34em] text-sand/35">Featured Property</p>
            <p className="mt-4 font-display text-2xl tracking-wide text-sand/85">
              {heroProperty?.title ?? "Portfolio setup"}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.24em] text-gold/55">
              {heroProperty?.location ?? "Add your first property"}
            </p>
            <div className="mt-7 grid grid-cols-3 gap-3">
              {[
                ["Beds", heroProperty?.bedrooms ?? 0],
                ["Baths", heroProperty?.bathrooms ?? 0],
                ["Guests", heroProperty?.maxGuests ?? 0],
              ].map(([label, value]) => (
                <div key={label} className="border-t border-gold/16 pt-3">
                  <p className="font-display text-2xl text-sand/85">{value}</p>
                  <p className="mt-1 text-[8px] uppercase tracking-[0.25em] text-sand/28">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-px bg-gold/8 lg:grid-cols-4">
        {metrics.map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className="group bg-[#0A1826] px-5 py-7 transition-colors duration-700 hover:bg-[#0F2133] sm:px-8 sm:py-9"
          >
            <m.icon className="mb-6 h-4 w-4 text-gold/35 stroke-[1.3] transition-colors duration-700 group-hover:text-gold" />
            <p className="mb-3 text-[8px] uppercase tracking-[0.34em] text-sand/30 sm:text-[8.5px]">
              {m.label}
            </p>
            <p className="break-words font-display text-2xl tracking-wide text-sand/66 transition-colors duration-700 group-hover:text-gold sm:text-3xl">
              {m.value}
            </p>
          </Link>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-10 xl:grid-cols-[1fr_360px] xl:gap-14">
        <div className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-gold/35" />
              <h2 className="text-[10px] uppercase tracking-[0.4em] text-sand/45">Property Rooms</h2>
            </div>
            {visiblePropertyCount > 0 && (
              <Link
                href="/owner/properties"
                className="group inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-gold/50 transition-colors duration-500 hover:text-gold"
              >
                Open all
                <ArrowRight className="h-3.5 w-3.5 stroke-[1.3] transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
            )}
          </div>

          {properties.length > 0 ? (
            <div className="grid grid-cols-1 gap-px bg-gold/8 md:grid-cols-2">
              {properties.map((property) => {
                const image = getPrimaryImageUrl(property.images) || "/placeholder-property.jpg"
                const readiness = [
                  property.images.length > 0,
                  property.amenities.length > 0,
                  property.highlights.length > 0,
                  property.description.length > 140,
                ].filter(Boolean).length

                return (
                  <Link
                    key={property.id}
                    href={`/owner/properties/${property.id}`}
                    className="group grid min-h-[260px] grid-cols-[130px_1fr] bg-[#0A1826] transition-colors duration-700 hover:bg-[#0F2133] sm:grid-cols-[170px_1fr]"
                  >
                    <div className="relative overflow-hidden bg-[#10243A]">
                      <Image
                        src={image}
                        alt={property.title}
                        fill
                        sizes="170px"
                        className="object-cover transition-transform duration-[1600ms] group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col justify-between p-5 sm:p-6">
                      <div>
                        <p className="text-[8px] uppercase tracking-[0.28em] text-gold/50">{property.location}</p>
                        <h3 className="mt-3 font-display text-2xl tracking-wide text-sand/84">{property.title}</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-3 border-t border-gold/8 pt-5">
                        <div>
                          <p className="font-display text-xl text-gold/75">{property._count.bookings}</p>
                          <p className="mt-1 text-[8px] uppercase tracking-[0.2em] text-sand/25">Stays</p>
                        </div>
                        <div>
                          <p className="font-display text-xl text-gold/75">{property._count.reviews}</p>
                          <p className="mt-1 text-[8px] uppercase tracking-[0.2em] text-sand/25">Reviews</p>
                        </div>
                        <div>
                          <p className="font-display text-xl text-gold/75">{readiness}/4</p>
                          <p className="mt-1 text-[8px] uppercase tracking-[0.2em] text-sand/25">Ready</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="border border-gold/8 py-20 text-center">
              <Sparkles className="mx-auto mb-6 h-8 w-8 text-gold/25 stroke-[1.2]" />
              <p className="text-[10px] uppercase tracking-[0.4em] text-sand/25">No properties listed yet</p>
              <p className="mt-3 text-[12px] font-light text-sand/25">Salt Route will add your property room once onboarding begins.</p>
            </div>
          )}
        </div>

        <aside className="space-y-8">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-gold/35" />
              <h2 className="text-[10px] uppercase tracking-[0.4em] text-sand/45">Quick Moves</h2>
            </div>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-center justify-between border border-gold/8 px-5 py-4 transition-colors duration-500 hover:border-gold/18 hover:bg-white/[0.025]"
                >
                  <span>
                    <span className="block text-[11px] font-medium text-sand/64 transition-colors duration-500 group-hover:text-sand/85">
                      {action.label}
                    </span>
                    <span className="mt-1 block text-[9.5px] font-light text-sand/27">{action.desc}</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-gold/35 stroke-[1.3] transition-all duration-500 group-hover:translate-x-1 group-hover:text-gold" />
                </Link>
              ))}
            </div>
          </div>

          <div className="border border-gold/10 bg-gold/[0.025] p-6">
            <Camera className="mb-5 h-5 w-5 text-gold/55 stroke-[1.3]" />
            <p className="font-display text-xl tracking-wide text-sand/78">Listing care note</p>
            <p className="mt-4 text-[12px] font-light leading-[1.85] text-sand/35">
              Keep photos, amenities, house rules, and seasonal pricing current so every property page stays guest-ready.
            </p>
            <Link
              href="/owner/request-edit"
              className="mt-5 inline-flex items-center gap-3 text-[9px] uppercase tracking-[0.3em] text-gold/55 transition-colors duration-500 hover:text-gold"
            >
              Request update
              <ArrowRight className="h-3.5 w-3.5 stroke-[1.3]" />
            </Link>
          </div>
        </aside>
      </section>

      <section className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="h-px w-8 bg-gold/35" />
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-sand/45">Upcoming Guest Movement</h2>
          </div>
          {recentBookings.length > 0 && (
            <Link
              href="/owner/bookings"
              className="text-[9px] uppercase tracking-[0.3em] text-gold/50 transition-colors duration-500 hover:text-gold"
            >
              View ledger
            </Link>
          )}
        </div>

        {recentBookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-px bg-gold/8 lg:grid-cols-2">
            {recentBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/owner/bookings/${booking.id}`}
                className="group bg-[#0A1826] p-6 transition-colors duration-500 hover:bg-[#0F2133]"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-mono text-[9px] text-sand/28 group-hover:text-sand/50">{booking.bookingCode}</p>
                    <h3 className="mt-3 font-display text-2xl tracking-wide text-sand/80">{booking.property.title}</h3>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-gold/45">{booking.property.location}</p>
                  </div>
                  <div className="shrink-0 border border-gold/10 px-4 py-3 text-left sm:text-right">
                    <p className="text-[8px] uppercase tracking-[0.25em] text-sand/28">Arrival</p>
                    <p className="mt-2 font-display text-xl text-gold/75">
                      {new Date(booking.checkIn).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-gold/8 pt-5 text-[10px] uppercase tracking-[0.22em] text-sand/32">
                  <span className="inline-flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 stroke-[1.3]" />
                    {booking.guest.name || booking.guest.email}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <BedDouble className="h-3.5 w-3.5 stroke-[1.3]" />
                    Confirmed stay
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-gold/8 py-16 text-center">
            <MessageCircle className="mx-auto mb-6 h-8 w-8 text-gold/24 stroke-[1.2]" />
            <p className="text-[10px] uppercase tracking-[0.4em] text-sand/25">No upcoming arrivals</p>
            <p className="mt-3 text-[12px] font-light text-sand/22">Confirmed future stays will appear here as soon as they are booked.</p>
          </div>
        )}
      </section>
    </div>
  )
}
