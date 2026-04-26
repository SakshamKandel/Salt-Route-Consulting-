import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Heart, Star, ArrowRight, MapPin, Clock } from "lucide-react"
import { getPrimaryImageUrl } from "@/lib/property-media"

export default async function AccountDashboard() {
  const session = await auth()
  if (!session?.user?.id) return null

  const [bookingsCount, wishlistCount, reviewsCount, upcomingBooking, recentBookings, wishlistItems] = await Promise.all([
    prisma.booking.count({ where: { guestId: session.user.id } }),
    prisma.wishlist.count({ where: { userId: session.user.id } }),
    prisma.review.count({ where: { guestId: session.user.id } }),
    prisma.booking.findFirst({
      where: { guestId: session.user.id, checkIn: { gte: new Date() }, status: "CONFIRMED" },
      orderBy: { checkIn: "asc" },
      include: { property: { include: { images: { take: 1, orderBy: { order: "asc" } } } } }
    }),
    prisma.booking.findMany({
      where: { guestId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { property: { include: { images: { take: 1, orderBy: { order: "asc" } } } } }
    }),
    prisma.wishlist.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { property: { include: { images: { take: 1, orderBy: { order: "asc" } } } } }
    }),
  ])

  const stats = [
    { label: "Reservations", value: bookingsCount, icon: Calendar, href: "/account/bookings" },
    { label: "Collection", value: wishlistCount, icon: Heart, href: "/account/wishlist" },
    { label: "Reviews", value: reviewsCount, icon: Star, href: "/account/reviews" },
  ]

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  return (
    <div className="space-y-16">
      
      {/* ─── GREETING ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 font-medium">Your Salt Route Journey</p>
          <h1 className="font-display text-4xl md:text-5xl text-charcoal tracking-tight">
            {greeting()}, <span className="text-charcoal/60">{session.user.name?.split(' ')[0]}</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 text-[9px] uppercase tracking-[0.2em] text-charcoal/30 font-medium">
          <Clock className="w-3 h-3" />
          <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* ─── UPCOMING STAY HERO ─── */}
      {upcomingBooking ? (
        <div className="relative group">
          <div className="absolute -inset-[1px] bg-charcoal/5 rounded-none" />
          <div className="relative overflow-hidden bg-white border border-charcoal/10 flex flex-col lg:flex-row min-h-[450px]">
            {/* Image Section */}
            <div className="relative w-full lg:w-3/5 min-h-[300px] lg:min-h-full overflow-hidden">
              {getPrimaryImageUrl(upcomingBooking.property.images) ? (
                <Image
                  src={getPrimaryImageUrl(upcomingBooking.property.images)!}
                  alt={upcomingBooking.property.title}
                  fill
                  className="object-cover transition-transform duration-[3s] group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-charcoal/5" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent lg:bg-gradient-to-r" />
              
              <div className="absolute bottom-8 left-8 lg:top-12 lg:left-12 lg:bottom-auto">
                <div className="flex items-center gap-3 bg-white/95 backdrop-blur-sm px-5 py-3 shadow-sm border border-charcoal/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-charcoal font-bold">Confirmed Journey</span>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-10 md:p-16 flex flex-col justify-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-charcoal/40 font-bold">
                    <MapPin className="w-3 h-3" />
                    <span>{upcomingBooking.property.location}</span>
                  </div>
                  <h2 className="font-display text-3xl md:text-5xl text-charcoal tracking-wide leading-tight">
                    {upcomingBooking.property.title}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-10 py-10 border-y border-charcoal/10">
                  <div className="space-y-2">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-charcoal/30 font-bold">Check In</p>
                    <p className="font-display text-2xl text-charcoal">
                      {new Date(upcomingBooking.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-charcoal/30 font-bold">Check Out</p>
                    <p className="font-display text-2xl text-charcoal">
                      {new Date(upcomingBooking.checkOut).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/account/bookings/${upcomingBooking.id}`}
                  className="inline-flex items-center gap-4 bg-charcoal text-white px-10 py-5 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-charcoal/90 transition-all group/btn"
                >
                  <span>View Stay Details</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" strokeWidth={2} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative group">
          <div className="relative overflow-hidden bg-charcoal/2 py-20 px-10 text-center border border-charcoal/10">
             <div className="max-w-md mx-auto space-y-8">
                <div className="w-16 h-16 rounded-full border border-charcoal/10 flex items-center justify-center mx-auto mb-10">
                   <Calendar className="w-6 h-6 text-charcoal/20" strokeWidth={1} />
                </div>
                <h2 className="font-display text-3xl text-charcoal tracking-wide">No upcoming stays yet</h2>
                <p className="text-charcoal/40 text-sm font-sans leading-relaxed">
                  Nepal is waiting. Explore our handpicked stays and begin your next quiet escape.
                </p>
                <Link
                  href="/properties"
                  className="inline-flex items-center gap-4 border border-charcoal text-charcoal px-10 py-5 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-charcoal hover:text-white transition-all"
                >
                  <span>Explore Stays</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
             </div>
          </div>
        </div>
      )}

      {/* ─── QUICK METRICS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group bg-white border border-charcoal/10 p-10 hover:border-charcoal/30 transition-all duration-500 shadow-sm hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-12">
                <div className="w-12 h-12 rounded-full bg-charcoal/[0.02] flex items-center justify-center border border-charcoal/5 group-hover:bg-charcoal group-hover:border-charcoal transition-all duration-500">
                  <Icon className="w-5 h-5 text-charcoal/30 group-hover:text-white transition-colors" strokeWidth={1.5} />
                </div>
                <ArrowRight className="w-4 h-4 text-charcoal/10 group-hover:text-charcoal group-hover:translate-x-1 transition-all" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <p className="font-display text-5xl text-charcoal group-hover:tracking-wider transition-all duration-500">
                  {stat.value}
                </p>
                <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 font-bold">
                  {stat.label}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* ─── TWO COLUMN SECTIONS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* RECENT ACTIVITY */}
        <section className="space-y-10">
          <div className="flex items-center justify-between pb-4 border-b border-charcoal/10">
            <h2 className="text-[11px] uppercase tracking-[0.4em] text-charcoal font-bold">Recent Stays</h2>
            <Link href="/account/bookings" className="text-[9px] uppercase tracking-[0.2em] text-charcoal/40 hover:text-charcoal transition-colors">View History</Link>
          </div>
          
          <div className="space-y-6">
            {recentBookings.length > 0 ? recentBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/account/bookings/${booking.id}`}
                className="group flex gap-6 items-center"
              >
                <div className="relative w-20 h-20 overflow-hidden bg-charcoal/5 flex-shrink-0">
                  {getPrimaryImageUrl(booking.property.images) ? (
                    <Image src={getPrimaryImageUrl(booking.property.images)!} alt={booking.property.title} fill className="object-cover transition-transform group-hover:scale-110 duration-700" />
                  ) : (
                    <div className="w-full h-full bg-charcoal/5" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-display text-lg text-charcoal group-hover:text-charcoal/60 transition-colors">{booking.property.title}</h3>
                  <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-charcoal/40">
                    <span>{new Date(booking.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    <span className="w-1 h-1 rounded-full bg-charcoal/10" />
                    <span>{booking.status}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-charcoal/10 group-hover:text-charcoal transition-colors" />
              </Link>
            )) : (
              <p className="text-sm text-charcoal/40 italic">No recent activity to show.</p>
            )}
          </div>
        </section>

        {/* WISHLIST PREVIEW */}
        <section className="space-y-10">
          <div className="flex items-center justify-between pb-4 border-b border-charcoal/10">
            <h2 className="text-[11px] uppercase tracking-[0.4em] text-charcoal font-bold">Saved Stays</h2>
            <Link href="/account/wishlist" className="text-[9px] uppercase tracking-[0.2em] text-charcoal/40 hover:text-charcoal transition-colors">View All</Link>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {wishlistItems.length > 0 ? wishlistItems.slice(0, 2).map((item) => (
              <Link key={item.id} href={`/properties/${item.property.slug}`} className="group space-y-4">
                <div className="relative aspect-[4/3] overflow-hidden bg-charcoal/5">
                  {getPrimaryImageUrl(item.property.images) ? (
                    <Image src={getPrimaryImageUrl(item.property.images)!} alt={item.property.title} fill className="object-cover transition-transform duration-[2s] group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-charcoal/5" />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-sm text-charcoal group-hover:text-charcoal/60 transition-colors truncate">{item.property.title}</h3>
                  <p className="text-[8px] uppercase tracking-[0.2em] text-charcoal/30">{item.property.location}</p>
                </div>
              </Link>
            )) : (
              <p className="col-span-2 text-sm text-charcoal/40 italic">Your collection is empty.</p>
            )}
          </div>
        </section>

      </div>

      {/* ─── SUPPORT ─── */}
      <div className="pt-20 border-t border-charcoal/10">
        <div className="bg-charcoal text-white p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[size:40px_40px]" />
          </div>

          <div className="relative space-y-4 text-center md:text-left">
            <h3 className="font-display text-3xl tracking-wide">Personal Concierge</h3>
            <p className="text-white/50 text-xs uppercase tracking-[0.2em] max-w-sm leading-relaxed">
              Our specialists are here to curate every detail of your journey.
            </p>
          </div>
          
          <div className="relative flex gap-4">
            <Link 
              href="/account/messages"
              className="bg-white text-charcoal px-8 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-white/90 transition-all"
            >
              Contact Specialist
            </Link>
            <Link 
              href="/account/profile"
              className="border border-white/20 text-white px-8 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-white/10 transition-all"
            >
              Personal Profile
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
