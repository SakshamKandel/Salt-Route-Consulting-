import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Bed, Bath, Users, Star, Wifi, Check, ArrowRight } from "lucide-react"
import { WishlistButton } from "./WishlistButton"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const property = await prisma.property.findUnique({ where: { slug } })
  if (!property) return {}
  return {
    title: `${property.title} | Salt Route`,
    description: property.description.slice(0, 160),
  }
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params
  const session = await auth()

  const property = await prisma.property.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      images: { orderBy: { order: "asc" } },
      reviews: {
        where: { isApproved: true },
        include: { guest: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 6,
      },
      _count: { select: { reviews: true } },
    },
  })

  if (!property) notFound()

  const wishlistItem = session?.user?.id
    ? await prisma.wishlist.findUnique({
        where: { userId_propertyId: { userId: session.user.id, propertyId: property.id } },
      })
    : null

  const avgRating =
    property.reviews.length > 0
      ? property.reviews.reduce((sum, r) => sum + r.rating, 0) / property.reviews.length
      : null

  const heroImage = property.images.find((i) => i.isPrimary) ?? property.images[0]

  return (
    <div className="min-h-screen bg-cream pt-16">
      {/* Hero */}
      <div className="relative h-[60vh] bg-navy">
        {heroImage ? (
          <Image
            src={heroImage.url}
            alt={property.title}
            fill
            className="object-cover opacity-80"
            priority
          />
        ) : (
          <div className="w-full h-full bg-navy" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
        <div className="absolute bottom-8 left-0 right-0 px-4 sm:px-8 max-w-7xl mx-auto">
          <Badge className="bg-gold/20 text-gold border-gold/30 mb-3 text-xs uppercase tracking-widest">
            {property.location}
          </Badge>
          <h1 className="font-display text-4xl md:text-6xl text-cream mb-2">{property.title}</h1>
          {avgRating && (
            <div className="flex items-center gap-2 text-cream/70">
              <Star size={16} className="fill-gold text-gold" />
              <span>{avgRating.toFixed(1)}</span>
              <span className="text-cream/40">({property._count.reviews} reviews)</span>
            </div>
          )}
        </div>
      </div>

      {/* Gallery strip */}
      {property.images.length > 1 && (
        <div className="flex gap-2 px-4 sm:px-8 max-w-7xl mx-auto -mt-4 relative z-10 overflow-x-auto pb-2">
          {property.images.slice(1, 5).map((img) => (
            <div key={img.id} className="relative h-20 w-32 shrink-0 rounded-lg overflow-hidden border-2 border-white shadow">
              <Image src={img.url} alt={img.alt ?? property.title} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-10">
          {/* Quick stats */}
          <div className="flex flex-wrap gap-6 p-6 bg-white rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-navy">
              <Bed size={20} className="text-gold" />
              <div>
                <p className="text-xs text-navy/50 uppercase tracking-wider">Bedrooms</p>
                <p className="font-bold">{property.bedrooms}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-navy">
              <Bath size={20} className="text-gold" />
              <div>
                <p className="text-xs text-navy/50 uppercase tracking-wider">Bathrooms</p>
                <p className="font-bold">{property.bathrooms}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-navy">
              <Users size={20} className="text-gold" />
              <div>
                <p className="text-xs text-navy/50 uppercase tracking-wider">Max Guests</p>
                <p className="font-bold">{property.maxGuests}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-navy">
              <MapPin size={20} className="text-gold" />
              <div>
                <p className="text-xs text-navy/50 uppercase tracking-wider">Location</p>
                <p className="font-bold">{property.location}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="font-display text-2xl text-navy mb-4">About this Property</h2>
            <p className="text-navy/70 leading-relaxed whitespace-pre-line">{property.description}</p>
          </div>

          {/* Highlights */}
          {property.highlights.length > 0 && (
            <div>
              <h2 className="font-display text-2xl text-navy mb-4">Highlights</h2>
              <div className="grid grid-cols-2 gap-3">
                {property.highlights.map((h) => (
                  <div key={h} className="flex items-center gap-2 text-navy/70">
                    <Check size={16} className="text-gold shrink-0" />
                    {h}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amenities */}
          {property.amenities.length > 0 && (
            <div>
              <h2 className="font-display text-2xl text-navy mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm text-navy/70 text-sm">
                    <Wifi size={14} className="text-gold" />
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* House rules */}
          {property.rules.length > 0 && (
            <div>
              <h2 className="font-display text-2xl text-navy mb-4">House Rules</h2>
              <ul className="space-y-2">
                {property.rules.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-navy/60 text-sm">
                    <span className="text-gold mt-1">·</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reviews */}
          {property.reviews.length > 0 && (
            <div>
              <h2 className="font-display text-2xl text-navy mb-6">
                Guest Reviews
                {avgRating && (
                  <span className="ml-3 text-base font-sans font-normal text-navy/50">
                    <Star size={14} className="inline fill-gold text-gold mr-1" />
                    {avgRating.toFixed(1)} / 5
                  </span>
                )}
              </h2>
              <div className="space-y-5">
                {property.reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-beige flex items-center justify-center font-bold text-navy text-sm">
                        {review.guest.name?.[0] ?? "G"}
                      </div>
                      <div>
                        <p className="font-medium text-navy text-sm">{review.guest.name ?? "Guest"}</p>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={i < review.rating ? "fill-gold text-gold" : "text-gray-200 fill-gray-200"}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="ml-auto text-xs text-navy/40">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-navy/70 text-sm leading-relaxed">{review.comment}</p>
                    {review.reply && (
                      <div className="mt-3 pl-4 border-l-2 border-gold/30">
                        <p className="text-xs font-semibold text-navy/50 mb-1">Response from host</p>
                        <p className="text-navy/60 text-sm">{review.reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Booking card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-2xl shadow-lg border border-beige p-6 space-y-5">
            <div>
              <span className="text-3xl font-bold text-navy">${Number(property.pricePerNight)}</span>
              <span className="text-navy/50"> / night</span>
            </div>
            <p className="text-navy/60 text-sm">Request a reservation with our concierge team — confirmation within 24 hours.</p>
            <Button asChild size="lg" className="w-full bg-gold hover:bg-gold-dark text-navy font-semibold">
              <Link href={session?.user ? `/booking-request?property=${property.id}` : `/login?callbackUrl=/properties/${property.slug}`}>
                Request to Book <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
            <WishlistButton propertyId={property.id} initialWishlisted={!!wishlistItem} />
            <div className="pt-3 border-t border-beige space-y-2 text-sm text-navy/60">
              <p className="flex items-center gap-2"><Check size={14} className="text-gold" /> Free cancellation within 48h</p>
              <p className="flex items-center gap-2"><Check size={14} className="text-gold" /> No charge until confirmed</p>
              <p className="flex items-center gap-2"><Check size={14} className="text-gold" /> Dedicated concierge support</p>
            </div>
            <Button asChild variant="outline" className="w-full border-navy/20 text-navy">
              <Link href="/contact">Ask a Question</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
