import { prisma } from "@/lib/db"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Bed, Users, ArrowRight, Shield, Headphones, Leaf } from "lucide-react"

async function getFeaturedProperties() {
  return prisma.property.findMany({
    where: { status: "ACTIVE", featured: true },
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
    take: 3,
  })
}

export default async function HomePage() {
  const featured = await getFeaturedProperties()

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-navy-900">
          <Image
            src="https://placehold.co/1920x1080/1B3A5C/C9A96E?text=Himalayan+Luxury"
            alt="Salt Route hero"
            fill
            className="object-cover opacity-40"
            priority
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <Badge className="bg-gold/20 text-gold border-gold/30 mb-6 text-xs uppercase tracking-widest">
            Handpicked Properties · Nepal
          </Badge>
          <h1 className="font-display text-hero text-cream mb-6">
            Where Luxury Meets<br />
            <span className="text-gold">Ancient Landscapes</span>
          </h1>
          <p className="text-cream/70 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Exclusive retreats in the Himalayas, lakeside sanctuaries in Pokhara, and safari lodges at the edge of Chitwan. Bespoke stays, curated for the discerning traveler.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gold hover:bg-gold-dark text-navy font-semibold px-8">
              <Link href="/properties">Explore Properties</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-cream text-cream hover:bg-cream/10 px-8">
              <Link href="/contact">Speak to a Consultant</Link>
            </Button>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-cream/40">
          <ArrowRight size={20} className="rotate-90" />
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold text-xs uppercase tracking-widest font-semibold mb-3">Our Properties</p>
            <h2 className="font-display text-4xl md:text-5xl text-navy">Featured Stays</h2>
            <p className="text-navy/60 mt-4 max-w-xl mx-auto">Each property is personally vetted for exceptional standards of comfort, authenticity, and connection to its natural surroundings.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((property) => (
              <Link key={property.id} href={`/properties/${property.slug}`} className="group">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                  <div className="relative h-60 overflow-hidden">
                    {property.images[0] ? (
                      <Image
                        src={property.images[0].url}
                        alt={property.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-beige" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-cream font-display text-xl">{property.title}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1 text-navy/60 text-sm mb-3">
                      <MapPin size={14} className="text-gold" />
                      {property.location}
                    </div>
                    <div className="flex items-center gap-4 text-navy/60 text-xs mb-4">
                      <span className="flex items-center gap-1"><Bed size={12} /> {property.bedrooms} bed</span>
                      <span className="flex items-center gap-1"><Users size={12} /> {property.maxGuests} guests</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-navy">${Number(property.pricePerNight)}</span>
                        <span className="text-navy/50 text-sm"> / night</span>
                      </div>
                      <Button size="sm" className="bg-navy text-cream hover:bg-navy/90">
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="border-navy text-navy hover:bg-navy hover:text-cream">
              <Link href="/properties">View All Properties <ArrowRight size={16} className="ml-2" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Salt Route */}
      <section className="py-24 bg-navy text-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold text-xs uppercase tracking-widest font-semibold mb-3">Why Salt Route</p>
            <h2 className="font-display text-4xl md:text-5xl">The Salt Route Difference</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: Shield,
                title: "Curated & Vetted",
                desc: "Every property passes our 50-point inspection — from thread count to sunset views. No surprises on arrival."
              },
              {
                icon: Headphones,
                title: "Concierge Support",
                desc: "Your dedicated consultant handles transfers, safaris, trekking permits, and everything in between."
              },
              {
                icon: Leaf,
                title: "Responsible Travel",
                desc: "We partner with properties committed to sustainable practices and genuine community benefit."
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-8 rounded-2xl border border-white/10 hover:border-gold/30 transition-colors">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold/10 mb-5">
                  <Icon size={24} className="text-gold" />
                </div>
                <h3 className="font-display text-xl mb-3">{title}</h3>
                <p className="text-cream/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="py-24 bg-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold text-xs uppercase tracking-widest font-semibold mb-3">Destinations</p>
            <h2 className="font-display text-4xl md:text-5xl text-navy">Explore by Region</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Nagarkot", sub: "Mountain retreats", href: "/properties?location=Nagarkot", color: "#1B3A5C" },
              { label: "Pokhara", sub: "Lakeside escapes", href: "/properties?location=Pokhara", color: "#14293F" },
              { label: "Chitwan", sub: "Jungle safaris", href: "/properties?location=Chitwan", color: "#0A1620" },
            ].map(({ label, sub, href, color }) => (
              <Link key={label} href={href} className="group relative h-64 rounded-2xl overflow-hidden shadow-md">
                <div className="absolute inset-0" style={{ backgroundColor: color }}>
                  <Image
                    src={`https://placehold.co/600x400/${color.replace("#","")}/C9A96E?text=${label}`}
                    alt={label}
                    fill
                    className="object-cover opacity-50 group-hover:opacity-60 transition-opacity"
                  />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-cream">
                  <h3 className="font-display text-3xl mb-1">{label}</h3>
                  <p className="text-cream/60 text-sm uppercase tracking-widest">{sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 bg-gold">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-navy mb-6">
            Ready to Experience Nepal in Style?
          </h2>
          <p className="text-navy/70 text-lg mb-10">
            Our consultants are available to craft the perfect itinerary around your preferred stay. No template packages — every trip is bespoke.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-navy text-cream hover:bg-navy/90 px-10">
              <Link href="/contact">Plan My Trip</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-navy text-navy hover:bg-navy/10 px-10">
              <Link href="/properties">Browse Properties</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
