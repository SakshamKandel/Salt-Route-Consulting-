"use client"

import { useState } from "react"
import Image, { ImageProps } from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { WishlistButton } from "@/app/(public)/properties/[slug]/WishlistButton"

import { PropertyGallery } from "@/components/public/PropertyGallery"
import { formatNpr } from "@/lib/currency"
import { getImageMedia, getBannerImageUrl, isVideoUrl, type PropertyMediaLike } from "@/lib/property-media"
import { Bath, BedDouble, Calendar, CheckCircle2, MapPin, ShieldCheck, Sparkles, Star, Users, Waves, Wind, Quote } from "lucide-react"
import { ReviewImageGallery } from "@/components/public/ReviewImageGallery"

type PropertyDetailMedia = PropertyMediaLike & {
  id: string
  alt?: string | null
}

type ReviewData = {
  id: string
  rating: number
  comment: string
  createdAt: Date | string
  guest: { name: string | null; image: string | null }
  images?: { url: string }[]
}

type PropertyDetail = {
  id: string
  title: string
  slug: string
  description: string
  location: string
  maxGuests: number
  bedrooms: number
  bathrooms: number
  pricePerNight: number
  highlights: string[]
  amenities: string[]
  rules: string[]
  images: PropertyDetailMedia[]
  reviews?: ReviewData[]
  _count?: { reviews: number }
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070&auto=format&fit=crop"

function SafeImage({ src, fallbackSrc = FALLBACK_IMAGE, alt, ...props }: ImageProps & { fallbackSrc?: string }) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc)
  
  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt || "Image"}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc)
        }
      }}
    />
  )
}

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function FeatureGrid({ items, emptyMessage }: { items: string[]; emptyMessage: string }) {
  if (items.length === 0) {
    return <p className="text-sm italic text-charcoal/40">{emptyMessage}</p>
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex min-w-0 items-start gap-3 border border-charcoal/10 bg-white px-4 py-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
          <span className="text-sm leading-6 text-charcoal/70 [overflow-wrap:anywhere]">{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function PropertyDetailClient({
  property,
  wishlistItem,
  isOwnerView = false,
}: {
  property: PropertyDetail
  wishlistItem: boolean
  isOwnerView?: boolean
}) {
  const imageMedia = getImageMedia(property.images)
  const heroImage = getBannerImageUrl(property.images) || FALLBACK_IMAGE

  const videoMedia = property.images.find(item => isVideoUrl(item.url))
  const videoUrl = videoMedia?.url

  const galleryImages = imageMedia.map((img) => ({
    id: img.id,
    url: img.url,
    alt: img.alt,
  }))
  const featureCount = property.highlights.length + property.amenities.length + property.rules.length

  return (
    <div className="bg-background min-h-screen">
      
      {/* ─── CLEAN PROPERTY HERO ─── */}
      <section className="relative h-[85vh] w-full pt-20">
        <div className="absolute inset-0 z-0">
          <SafeImage
            src={heroImage}
            alt={property.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/50" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
          >
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/80 font-sans mb-8 font-light">
              {property.location}
            </p>
            <h1 className="mx-auto max-w-6xl font-display text-4xl sm:text-5xl md:text-7xl lg:text-[7rem] text-white tracking-wide leading-[0.98] mb-10 font-normal [overflow-wrap:anywhere]">
              {property.title}
            </h1>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-12">
                <p className="text-white text-[10px] uppercase tracking-[0.3em] font-sans font-light">Starting from {formatNpr(property.pricePerNight)} / Night</p>
                <span className="hidden md:block w-12 h-[1px] bg-white/40" />
                {isOwnerView ? (
                  <Link
                    href={`/owner/properties/${property.id}`}
                    className="bg-white/10 backdrop-blur-md border border-white text-white px-10 py-4 text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-charcoal transition-all duration-700"
                  >
                    Partner Registry
                  </Link>
                ) : (
                  <Link
                    href={`/booking-request?property=${property.id}`}
                    className="bg-white/10 backdrop-blur-md border border-white text-white px-10 py-4 text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-charcoal transition-all duration-700"
                  >
                    Begin Reservation
                  </Link>
                )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── QUICK SPEC BAR ─── */}
      <div className="bg-white border-b border-charcoal/5 py-8">
          <div className="max-w-screen-xl mx-auto grid grid-cols-1 gap-5 px-6 sm:grid-cols-2 md:px-12 lg:grid-cols-4">
              <div className="flex items-center gap-4">
                  <Calendar className="w-4 h-4 text-charcoal/40" strokeWidth={1.5} />
                  <span className="text-[9px] uppercase tracking-[0.2em] text-charcoal/60 font-semibold">Year Round Stay</span>
              </div>
              <div className="flex items-center gap-4">
                  <BedDouble className="w-4 h-4 text-charcoal/40" strokeWidth={1.5} />
                  <span className="text-[9px] uppercase tracking-[0.2em] text-charcoal/60 font-semibold">{property.bedrooms} Bedrooms</span>
              </div>
              <div className="flex items-center gap-4">
                  <Bath className="w-4 h-4 text-charcoal/40" strokeWidth={1.5} />
                  <span className="text-[9px] uppercase tracking-[0.2em] text-charcoal/60 font-semibold">{property.bathrooms} Bathrooms</span>
              </div>
              <div className="flex min-w-0 items-center gap-4">
                  <MapPin className="w-4 h-4 shrink-0 text-charcoal/40" strokeWidth={1.5} />
                  <span className="min-w-0 text-[9px] uppercase tracking-[0.2em] text-charcoal/60 font-semibold [overflow-wrap:anywhere]">{property.location}</span>
              </div>
          </div>
      </div>

      {/* ─── NARRATIVE ─── */}
      <section className="py-40 bg-[#FAFAFA]">
        <div className="max-w-screen-md mx-auto px-6 md:px-12 text-center">
            <FadeUp>
                <p className="text-[10px] uppercase tracking-[0.4em] font-sans text-charcoal/40 mb-10 font-medium">The Estate Narrative</p>
                <h2 className="font-display text-3xl md:text-5xl text-charcoal leading-[1.2] mb-12 tracking-wide font-normal">
                    {property.title} is a thoughtfully curated sanctuary designed for absolute tranquility.
                </h2>
                <div className="w-16 h-[1px] bg-charcoal/10 mx-auto mb-12" />
                <p className="font-sans text-lg md:text-xl leading-relaxed text-charcoal/60 font-light">
                    &quot;{property.description}&quot;
                </p>
            </FadeUp>
        </div>
      </section>

      {/* ─── VISUALS ─── */}
      <section className="py-32 bg-white border-t border-charcoal/5">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
            <FadeUp className="mb-16 text-center">
                <p className="text-[10px] uppercase tracking-[0.3em] font-sans text-charcoal/40 mb-4 font-medium">The Atmosphere</p>
                <h2 className="font-display text-4xl md:text-5xl text-charcoal tracking-wide mb-4">A Visual Registry</h2>
                {galleryImages.length > 1 && (
                  <p className="mt-6 text-[9px] uppercase tracking-[0.2em] text-charcoal/40">
                    {galleryImages.length} images · click to zoom · use arrows to slide
                  </p>
                )}
            </FadeUp>

            {videoUrl && (
              <FadeUp delay={0.1} className="w-full aspect-video bg-charcoal/5 overflow-hidden mb-16 relative shadow-xl">
                  <video
                      src={videoUrl}
                      className="h-full w-full object-cover md:object-contain bg-black"
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                      controlsList="nodownload"
                  />
              </FadeUp>
            )}

            {galleryImages.length > 0 && (
              <FadeUp delay={0.15}>
                <PropertyGallery images={galleryImages} />
              </FadeUp>
            )}
        </div>
      </section>

      {/* ─── SPECIFICATIONS ─── */}
      <section className="py-28 md:py-36 bg-[#FAFAFA] border-t border-charcoal/5">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <FadeUp className="mb-14">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] font-sans text-charcoal/40 mb-5 font-medium">
                  Property Features
                </p>
                <h2 className="font-display text-4xl md:text-5xl text-charcoal tracking-wide">
                  Additional Features Clients Can See
                </h2>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-medium">
                {featureCount} listed details
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <FadeUp>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                <div className="border border-charcoal/10 bg-white p-5">
                  <BedDouble className="mb-5 h-5 w-5 text-charcoal/40" strokeWidth={1.5} />
                  <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/40 font-semibold">Bedrooms</p>
                  <p className="mt-2 text-2xl font-display text-charcoal">{property.bedrooms}</p>
                </div>
                <div className="border border-charcoal/10 bg-white p-5">
                  <Bath className="mb-5 h-5 w-5 text-charcoal/40" strokeWidth={1.5} />
                  <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/40 font-semibold">Bathrooms</p>
                  <p className="mt-2 text-2xl font-display text-charcoal">{property.bathrooms}</p>
                </div>
                <div className="border border-charcoal/10 bg-white p-5">
                  <Users className="mb-5 h-5 w-5 text-charcoal/40" strokeWidth={1.5} />
                  <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/40 font-semibold">Guests</p>
                  <p className="mt-2 text-2xl font-display text-charcoal">{property.maxGuests}</p>
                </div>
                <div className="border border-charcoal/10 bg-white p-5">
                  <Sparkles className="mb-5 h-5 w-5 text-charcoal/40" strokeWidth={1.5} />
                  <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/40 font-semibold">Features</p>
                  <p className="mt-2 text-2xl font-display text-charcoal">{featureCount}</p>
                </div>
              </div>
            </FadeUp>

            <div className="space-y-12">
              <FadeUp delay={0.05}>
                <div className="mb-6 flex items-center gap-4 border-b border-charcoal/10 pb-5">
                  <Wind className="w-5 h-5 text-charcoal/40" strokeWidth={1.5} />
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-sans text-charcoal/60 font-medium">
                    Additional Features
                  </h3>
                </div>
                <FeatureGrid items={property.highlights} emptyMessage="No additional features listed." />
              </FadeUp>

              <FadeUp delay={0.1}>
                <div className="mb-6 flex items-center gap-4 border-b border-charcoal/10 pb-5">
                  <Waves className="w-5 h-5 text-charcoal/40" strokeWidth={1.5} />
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-sans text-charcoal/60 font-medium">
                    Amenities
                  </h3>
                </div>
                <FeatureGrid items={property.amenities} emptyMessage="No amenities listed." />
              </FadeUp>

              {property.rules.length > 0 && (
                <FadeUp delay={0.15}>
                  <div className="mb-6 flex items-center gap-4 border-b border-charcoal/10 pb-5">
                    <ShieldCheck className="w-5 h-5 text-charcoal/40" strokeWidth={1.5} />
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-sans text-charcoal/60 font-medium">
                      House Rules
                    </h3>
                  </div>
                  <FeatureGrid items={property.rules} emptyMessage="No house rules listed." />
                </FadeUp>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── GUEST REVIEWS ─── */}
      {property.reviews && property.reviews.length > 0 && (
        <section className="py-48 bg-[#FDFBF7] border-t border-charcoal/5 relative overflow-hidden">
          {/* Decorative Element */}
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-[0.02] pointer-events-none">
            <Quote className="w-full h-full text-charcoal translate-x-1/2 -translate-y-1/4" strokeWidth={0.5} />
          </div>

          <div className="max-w-screen-xl mx-auto px-6 md:px-12 relative z-10">
            <FadeUp className="mb-24 space-y-4">
              <p className="text-[10px] uppercase tracking-[0.4em] font-sans text-charcoal/40 font-bold">The Guest Experience</p>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <h2 className="font-display text-4xl md:text-6xl text-charcoal tracking-tight max-w-xl leading-[1.1]">
                  Notes from <span className="text-charcoal/40 italic">Previous</span> Residents
                </h2>
                {property._count && property._count.reviews > 0 && (
                  <div className="flex items-center gap-4 bg-white border border-charcoal/10 px-6 py-4">
                    <div className="flex gap-1 text-gold/80">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const avg = property.reviews!.reduce((sum, r) => sum + r.rating, 0) / property.reviews!.length
                        return <Star key={i} size={14} fill={i < Math.round(avg) ? "currentColor" : "none"} strokeWidth={1} />
                      })}
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-charcoal/60 font-bold border-l border-charcoal/10 pl-4">
                      {property._count.reviews} Reviews
                    </span>
                  </div>
                )}
              </div>
            </FadeUp>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
              {property.reviews.map((review, idx) => (
                <FadeUp key={review.id} delay={idx * 0.1} className={idx === 1 ? "md:mt-12" : ""}>
                  <div className="bg-white border border-charcoal/5 p-12 md:p-16 shadow-sm hover:shadow-xl transition-all duration-700 group h-full flex flex-col justify-between">
                    <div className="space-y-10">
                      <div className="flex justify-between items-start">
                        <Quote className="w-10 h-10 text-charcoal/[0.03]" strokeWidth={1} />
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={12} className={i < review.rating ? "text-gold fill-gold" : "text-charcoal/10"} strokeWidth={1} />
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-charcoal/70 text-xl leading-relaxed font-sans font-light italic">
                        &ldquo;{review.comment}&rdquo;
                      </p>

                      {review.images && review.images.length > 0 && (
                        <ReviewImageGallery images={review.images} />
                      )}
                    </div>

                    <div className="mt-16 pt-10 border-t border-charcoal/5 flex items-center gap-5">
                      <div className="w-12 h-12 rounded-full bg-charcoal text-white flex items-center justify-center text-xs font-display tracking-widest">
                        {review.guest.name?.charAt(0) || "G"}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold">{review.guest.name || "Guest Resident"}</p>
                        <p className="text-[8px] uppercase tracking-[0.2em] text-charcoal/30">
                          {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── FINAL CTA ─── */}
      {!isOwnerView && (
        <section className="py-40 bg-[#FAFAFA] text-center border-t border-charcoal/5">
            <FadeUp>
                <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 mb-8 font-medium">Exclusive Access</p>
                <h2 className="font-display text-4xl md:text-5xl mb-12 tracking-wide text-charcoal">Reserve Your Sanctuary</h2>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    <Link
                      href={`/booking-request?property=${property.id}`}
                      className="bg-charcoal text-white px-12 py-5 text-[10px] uppercase tracking-[0.2em] hover:bg-charcoal/90 transition-all duration-700 w-full sm:w-auto"
                    >
                        Check Availability
                    </Link>
                    <WishlistButton propertyId={property.id} initialWishlisted={wishlistItem} />
                </div>
            </FadeUp>
        </section>
      )}



    </div>
  )
}
