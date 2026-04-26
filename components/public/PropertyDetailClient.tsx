"use client"

import { useState } from "react"
import Image, { ImageProps } from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { WishlistButton } from "@/app/(public)/properties/[slug]/WishlistButton"
import { PropertyGallery } from "@/components/public/PropertyGallery"
import { formatNpr } from "@/lib/currency"
import { getImageMedia, getBannerImageUrl, isVideoUrl, type PropertyMediaLike } from "@/lib/property-media"
import { 
  Bath, 
  BedDouble, 
  Calendar, 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  Users, 
  Waves, 
  Wind, 
  Quote, 
  ArrowRight,
  Maximize2,
  Coffee,
  Wifi,
  Car
} from "lucide-react"
import { ReviewImageGallery } from "@/components/public/ReviewImageGallery"
import { LuxuryButton } from "@/components/ui/luxury-button"
import { LuxuryArrow } from "@/components/ui/luxury-arrow"
import { PropertyDetailMap } from "@/components/public/PropertyDetailMap"

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
  address?: string | null
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

function RevealImage({ src, alt, className }: { src: string, alt: string, className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        initial={{ scale: 1.1 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-full relative"
      >
        <SafeImage src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
      </motion.div>
    </div>
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
        <li key={`${item}-${index}`} className="flex min-w-0 items-start gap-3 border border-charcoal/10 bg-white px-4 py-3 group hover:border-charcoal/30 transition-colors duration-500">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/60 group-hover:text-gold transition-colors" strokeWidth={1.5} />
          <span className="text-[13px] leading-relaxed text-charcoal/70 font-light">{item}</span>
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
    <div className="bg-background min-h-screen text-charcoal">
      
      {/* â”€â”€â”€ IMMERSIVE LANDING HERO â”€â”€â”€ */}
      <section className="relative h-[95svh] w-full pt-20 overflow-hidden bg-charcoal">
        <div className="absolute inset-0 z-0">
          <SafeImage
            src={heroImage}
            alt={property.title}
            fill
            className="object-cover opacity-70"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/80" />
        </div>

        <div className="relative z-10 flex flex-col justify-end h-full px-6 md:px-12 pb-12 max-w-screen-2xl mx-auto">
          <FadeUp className="max-w-5xl space-y-6">
            <div className="flex items-center gap-4 text-white/80">
              <span className="w-10 h-[1px] bg-gold" />
              <p className="text-[10px] uppercase tracking-[0.5em] font-sans font-light">
                {property.location}
              </p>
            </div>
            <h1 className="font-display text-5xl md:text-8xl lg:text-[10rem] text-white tracking-wide leading-[0.9] font-normal [overflow-wrap:anywhere] uppercase">
              {property.title}
            </h1>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-12 pt-8">
                <div className="space-y-1">
                  <p className="text-white/40 text-[9px] uppercase tracking-[0.2em] font-sans font-bold">Starting From</p>
                  <p className="text-white text-3xl font-display">{formatNpr(property.pricePerNight)}<span className="text-sm font-sans font-light text-white/50 ml-2">/ Night</span></p>
                </div>
                
                <div className="flex gap-4">
                  {isOwnerView ? (
                    <LuxuryButton href={`/owner/properties/${property.id}`} dark>View Owner Details</LuxuryButton>
                  ) : (
                    <LuxuryButton href={`/booking-request?property=${property.id}`} dark>Begin Reservation</LuxuryButton>
                  )}
                  <WishlistButton propertyId={property.id} initialWishlisted={wishlistItem} />
                </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* â”€â”€â”€ LUXURY SPEC BAR (COMPACT) â”€â”€â”€ */}
      <div className="bg-white border-b border-charcoal/5 py-8">
          <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 items-center">
              <div className="space-y-2">
                  <p className="text-[8px] uppercase tracking-[0.2em] text-charcoal/40 font-bold">Guests</p>
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-gold/60" strokeWidth={1} />
                    <span className="text-xl font-display uppercase">{property.maxGuests} Guests</span>
                  </div>
              </div>
              <div className="space-y-2">
                  <p className="text-[8px] uppercase tracking-[0.2em] text-charcoal/40 font-bold">Bedrooms</p>
                  <div className="flex items-center gap-3">
                    <BedDouble className="w-4 h-4 text-gold/60" strokeWidth={1} />
                    <span className="text-xl font-display uppercase">{property.bedrooms} Bedrooms</span>
                  </div>
              </div>
              <div className="space-y-2">
                  <p className="text-[8px] uppercase tracking-[0.2em] text-charcoal/40 font-bold">Bathrooms</p>
                  <div className="flex items-center gap-3">
                    <Bath className="w-4 h-4 text-gold/60" strokeWidth={1} />
                    <span className="text-xl font-display uppercase">{property.bathrooms} Bathrooms</span>
                  </div>
              </div>
              <div className="space-y-2">
                  <p className="text-[8px] uppercase tracking-[0.2em] text-charcoal/40 font-bold">Stay Style</p>
                  <div className="flex items-center gap-3">
                    <Maximize2 className="w-4 h-4 text-gold/60" strokeWidth={1} />
                    <span className="text-xl font-display uppercase">Boutique Stay</span>
                  </div>
              </div>
              <div className="hidden lg:block space-y-2">
                  <p className="text-[8px] uppercase tracking-[0.2em] text-charcoal/40 font-bold">Experience</p>
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-gold/60" strokeWidth={1} />
                    <span className="text-xl font-display uppercase">Signature Stay</span>
                  </div>
              </div>
            </div>
          </div>
      </div>

      {/* â”€â”€â”€ THE SPACE (EDITORIAL) â”€â”€â”€ */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1">
               <RevealImage 
                 src={galleryImages[0]?.url || FALLBACK_IMAGE} 
                 alt="The Space" 
                 className="aspect-[16/9] border border-charcoal/10"
               />
            </div>
            <div className="lg:col-span-5 order-1 lg:order-2 space-y-8">
              <FadeUp>
                <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 font-medium">Overview</p>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-charcoal tracking-wide leading-tight uppercase">
                  A Sanctuary of<br/>Quiet Luxury.
                </h2>
                <div className="w-12 h-[1px] bg-gold mt-8" />
              </FadeUp>
              <FadeUp delay={0.2} className="space-y-8">
                <p className="font-sans text-[16px] text-charcoal/60 leading-relaxed font-light first-letter:text-5xl first-letter:font-display first-letter:float-left first-letter:mr-3 first-letter:mt-1">
                  {property.description}
                </p>
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-charcoal/5">
                  <div className="space-y-4">
                    <Coffee className="w-5 h-5 text-gold/50" strokeWidth={1} />
                    <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-charcoal/80">Morning Ritual</p>
                    <p className="text-xs text-charcoal/50 leading-relaxed font-light">Custom breakfast service with Himalayan views.</p>
                  </div>
                  <div className="space-y-4">
                    <Wifi className="w-5 h-5 text-gold/50" strokeWidth={1} />
                    <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-charcoal/80">Digital Comfort</p>
                    <p className="text-xs text-charcoal/50 leading-relaxed font-light">Seamless high-speed connectivity throughout.</p>
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€â”€ THE GALLERY â”€â”€â”€ */}
      <section className="py-16 bg-[#FBF9F4] border-y border-charcoal/5">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
            <FadeUp className="mb-10 text-center space-y-4">
                <p className="text-[10px] uppercase tracking-[0.3em] font-sans text-charcoal/40 font-bold">Gallery</p>
                <h2 className="font-display text-4xl md:text-6xl text-charcoal tracking-wide uppercase">The Atmosphere</h2>
            </FadeUp>

            {videoUrl && (
              <FadeUp delay={0.1} className="w-full aspect-[21/9] bg-charcoal/5 overflow-hidden mb-12 relative border border-charcoal/10 group">
                  <video
                      src={videoUrl}
                      className="h-full w-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000"
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                      controlsList="nodownload"
                  />
                  <div className="absolute inset-0 bg-black/10 pointer-events-none" />
              </FadeUp>
            )}

            {galleryImages.length > 0 && (
              <FadeUp delay={0.15}>
                <PropertyGallery images={galleryImages} />
              </FadeUp>
            )}
        </div>
      </section>

      {/* â”€â”€â”€ SPECIFICATIONS & AMENITIES â”€â”€â”€ */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left: Highlight specs */}
            <div className="lg:col-span-4 space-y-12">
              <FadeUp>
                <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 font-medium">Comforts</p>
                <h2 className="font-display text-4xl lg:text-5xl text-charcoal tracking-wide uppercase">Stay Details.</h2>
              </FadeUp>
              
              <div className="space-y-6">
                {[
                  { icon: BedDouble, label: "Bedrooms", val: property.bedrooms },
                  { icon: Bath, label: "Bathrooms", val: property.bathrooms },
                  { icon: Users, label: "Total Capacity", val: `${property.maxGuests} Guests` },
                  { icon: Car, label: "Parking", val: "Private Garage" },
                ].map((item, i) => (
                  <FadeUp key={i} delay={i * 0.1} className="flex items-center justify-between border-b border-charcoal/10 pb-6">
                    <div className="flex items-center gap-4">
                      <item.icon className="w-4 h-4 text-gold/60" strokeWidth={1} />
                      <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-charcoal/40">{item.label}</p>
                    </div>
                    <p className="font-display text-xl text-charcoal uppercase">{item.val}</p>
                  </FadeUp>
                ))}
              </div>
            </div>

            {/* Right: Feature grids */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-12">
              <FadeUp className="space-y-10">
                <div className="flex items-center gap-4">
                  <Sparkles className="w-5 h-5 text-gold/40" strokeWidth={1} />
                  <h3 className="text-[12px] uppercase tracking-[0.3em] font-bold text-charcoal/60">Property Highlights</h3>
                </div>
                <FeatureGrid items={property.highlights} emptyMessage="No additional features listed." />
              </FadeUp>
              
              <FadeUp delay={0.1} className="space-y-10">
                <div className="flex items-center gap-4">
                  <Waves className="w-5 h-5 text-gold/40" strokeWidth={1} />
                  <h3 className="text-[12px] uppercase tracking-[0.3em] font-bold text-charcoal/60">Lifestyle Amenities</h3>
                </div>
                <FeatureGrid items={property.amenities} emptyMessage="No amenities listed." />
              </FadeUp>

              {property.rules.length > 0 && (
                <FadeUp delay={0.2} className="md:col-span-2 space-y-10 pt-12 border-t border-charcoal/5">
                  <div className="flex items-center gap-4">
                    <ShieldCheck className="w-5 h-5 text-gold/40" strokeWidth={1} />
                    <h3 className="text-[12px] uppercase tracking-[0.3em] font-bold text-charcoal/60">House Notes</h3>
                  </div>
                  <FeatureGrid items={property.rules} emptyMessage="No house rules listed." />
                </FadeUp>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* â”€â”€â”€ GUEST REVIEWS (ELITE LAYOUT) â”€â”€â”€ */}
      <section className="py-16 md:py-24 bg-white border-b border-charcoal/5">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-4">
              <FadeUp className="space-y-4">
                <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 font-medium">Location</p>
                <h2 className="font-display text-4xl md:text-5xl text-charcoal tracking-wide leading-tight uppercase">
                  Find Us.
                </h2>
                <div className="w-12 h-[1px] bg-gold" />
              </FadeUp>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
              <FadeUp delay={0.1} className="space-y-3">
                <p className="text-[9px] uppercase tracking-[0.3em] text-charcoal/40 font-bold">Area</p>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gold/60 shrink-0" strokeWidth={1} />
                  <p className="font-display text-xl text-charcoal uppercase tracking-wide">{property.location}</p>
                </div>
              </FadeUp>
              
              {property.address && (
                <FadeUp delay={0.2} className="space-y-3">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-charcoal/40 font-bold">Address</p>
                  <p className="text-charcoal/60 text-base leading-relaxed font-light">{property.address}</p>
                </FadeUp>
              )}

              <FadeUp delay={0.3} className="md:col-span-2 pt-8 border-t border-charcoal/5">
                <p className="text-[11px] text-charcoal/35 leading-relaxed font-light italic">
                  Exact directions and private access instructions are shared securely after your booking confirmation to ensure resident privacy.
                </p>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {property.reviews && property.reviews.length > 0 && (
        <section className="py-20 md:py-24 bg-[#FBF9F4] border-y border-charcoal/5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <Quote className="w-[80rem] h-full text-charcoal -translate-x-1/4 -translate-y-1/4" strokeWidth={0.2} />
          </div>

          <div className="max-w-screen-2xl mx-auto px-6 md:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end mb-12">
              <FadeUp className="lg:col-span-8 space-y-6">
                <p className="text-[10px] uppercase tracking-[0.5em] text-charcoal/40 font-bold">Testimonials</p>
                <h2 className="font-display text-4xl md:text-7xl lg:text-8xl text-charcoal tracking-tight leading-[0.9] uppercase">
                  Resident Notes &<br/><span className="text-gold/40 italic">Reflections.</span>
                </h2>
              </FadeUp>
              <FadeUp delay={0.2} className="lg:col-span-4 flex lg:justify-end">
                {property._count && (
                  <div className="flex items-center gap-6 bg-white border border-charcoal/10 p-8 shadow-sm">
                    <div className="space-y-2">
                       <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-charcoal/40">Verified Rating</p>
                       <p className="font-display text-4xl text-charcoal">4.9<span className="text-sm font-sans text-charcoal/20 ml-2">/ 5.0</span></p>
                    </div>
                    <div className="h-10 w-[1px] bg-charcoal/10" />
                    <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/60 font-bold">{property._count.reviews} Reviews</p>
                  </div>
                )}
              </FadeUp>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-1px bg-charcoal/10 border border-charcoal/10">
              {property.reviews.map((review, idx) => (
                <FadeUp key={review.id} delay={idx * 0.1} className="bg-white p-12 md:p-20 hover:bg-[#FBF9F4] transition-colors duration-700">
                  <div className="space-y-12 h-full flex flex-col justify-between">
                    <div className="space-y-10">
                      <div className="flex gap-1 text-gold/60">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? "fill-current" : "opacity-20"} strokeWidth={1} />
                        ))}
                      </div>
                      
                      <p className="text-charcoal text-2xl md:text-3xl leading-[1.4] font-display font-normal uppercase tracking-wide">
                        &ldquo;{review.comment}&rdquo;
                      </p>

                      {review.images && review.images.length > 0 && (
                        <ReviewImageGallery images={review.images} />
                      )}
                    </div>

                    <div className="pt-12 flex items-center gap-6">
                      <div className="w-14 h-14 border border-charcoal/10 p-1">
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center overflow-hidden grayscale">
                          {review.guest.image ? (
                            <img src={review.guest.image} alt={review.guest.name || ""} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-display tracking-widest text-charcoal/40 uppercase">
                              {review.guest.name?.charAt(0) || "G"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-charcoal font-bold">{review.guest.name || "Guest Resident"}</p>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/30">
                          Verified Stay Â· {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
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

      {/* â”€â”€â”€ FINAL CALL TO ACTION â”€â”€â”€ */}
      {!isOwnerView && (
        <section className="py-20 md:py-24 bg-white text-center">
            <FadeUp className="max-w-4xl mx-auto px-6 space-y-8">
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-[0.5em] text-charcoal/40 font-bold">Private Reservation</p>
                  <h2 className="font-display text-4xl md:text-6xl lg:text-[7rem] leading-none text-charcoal uppercase">Secure Your Stay.</h2>
                </div>
                <p className="font-sans text-lg text-charcoal/50 leading-relaxed font-light max-w-2xl mx-auto">
                  Experience {property.title} first-hand. Check your preferred dates and begin your Salt Route stay today.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6">
                    <LuxuryButton 
                      href={`/booking-request?property=${property.id}`}
                      className="px-16"
                    >
                        Begin Reservation
                    </LuxuryButton>
                    <WishlistButton propertyId={property.id} initialWishlisted={wishlistItem} />
                </div>
            </FadeUp>
        </section>
      )}

    </div>
  )
}

