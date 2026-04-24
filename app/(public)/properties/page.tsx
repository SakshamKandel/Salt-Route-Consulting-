import { prisma } from "@/lib/db"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Bed, Bath, Users } from "lucide-react"

export const metadata = {
  title: "Properties | Salt Route",
  description: "Browse our handpicked luxury properties across Nepal."
}

async function getProperties(location?: string) {
  return prisma.property.findMany({
    where: {
      status: "ACTIVE",
      ...(location ? { location: { contains: location, mode: "insensitive" } } : {}),
    },
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      _count: { select: { reviews: true, bookings: true } },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  })
}

const LOCATIONS = ["All", "Nagarkot", "Pokhara", "Chitwan"]

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const location = params.location as string | undefined
  const properties = await getProperties(location)

  return (
    <div className="min-h-screen bg-cream pt-20">
      {/* Header */}
      <div className="bg-navy py-16 px-4 text-center">
        <p className="text-gold text-xs uppercase tracking-widest font-semibold mb-3">Our Collection</p>
        <h1 className="font-display text-4xl md:text-5xl text-cream">All Properties</h1>
        <p className="text-cream/60 mt-4 max-w-xl mx-auto">
          {properties.length} handpicked {properties.length === 1 ? "property" : "properties"} across Nepal&apos;s finest destinations.
        </p>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-3 flex-wrap">
          {LOCATIONS.map((loc) => {
            const isActive = loc === "All" ? !location : location === loc
            return (
              <Button
                key={loc}
                asChild
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={isActive ? "bg-navy text-cream" : "border-navy/20 text-navy hover:bg-navy hover:text-cream"}
              >
                <Link href={loc === "All" ? "/properties" : `/properties?location=${loc}`}>
                  {loc}
                </Link>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {properties.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-navy/50 text-lg">No properties found for this location.</p>
            <Button asChild className="mt-4 bg-navy text-cream">
              <Link href="/properties">View All</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <Link key={property.id} href={`/properties/${property.slug}`} className="group">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  <div className="relative h-56 overflow-hidden">
                    {property.images[0] ? (
                      <Image
                        src={property.images[0].url}
                        alt={property.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-beige flex items-center justify-center text-navy/30">No image</div>
                    )}
                    {property.featured && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-gold text-navy text-xs font-bold">Featured</Badge>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-display text-xl text-navy mb-1 group-hover:text-gold transition-colors">
                      {property.title}
                    </h3>
                    <p className="flex items-center gap-1 text-navy/50 text-sm mb-3">
                      <MapPin size={13} className="text-gold" />
                      {property.location}
                    </p>
                    <div className="flex items-center gap-4 text-navy/50 text-xs mb-4">
                      <span className="flex items-center gap-1"><Bed size={12} /> {property.bedrooms} bed</span>
                      <span className="flex items-center gap-1"><Bath size={12} /> {property.bathrooms} bath</span>
                      <span className="flex items-center gap-1"><Users size={12} /> {property.maxGuests} guests</span>
                    </div>
                    {property.highlights.slice(0, 3).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {property.highlights.slice(0, 3).map((h) => (
                          <span key={h} className="text-xs bg-beige text-navy/70 px-2 py-0.5 rounded-full">{h}</span>
                        ))}
                      </div>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-beige">
                      <div>
                        <span className="text-2xl font-bold text-navy">${Number(property.pricePerNight)}</span>
                        <span className="text-navy/40 text-sm"> / night</span>
                      </div>
                      <Button size="sm" className="bg-navy text-cream hover:bg-navy/90 group-hover:bg-gold group-hover:text-navy transition-colors">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
