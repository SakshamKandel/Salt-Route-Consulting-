"use client"

import { useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Calendar, Users, MapPin, ShieldCheck, Globe, Star } from "lucide-react"
import { getPrimaryImageUrl, type PropertyMediaLike } from "@/lib/property-media"
import { LuxuryButton } from "@/components/ui/luxury-button"
import { LuxuryArrow } from "@/components/ui/luxury-arrow"
import { LuxuryLink } from "@/components/ui/luxury-link"

function RevealImage({ src, alt, className }: { src: string, alt: string, className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        initial={{ scale: 1.1 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-full relative"
      >
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
      </motion.div>
    </div>
  )
}

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

type FeaturedProperty = {
  id: string
  title: string
  slug: string
  location: string
  images: PropertyMediaLike[]
  pricePerNight?: number
}

function HeroImage() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-charcoal">
      <div className="absolute inset-0">
        <Image
          src="/Sunshine Villa Main.png"
          alt="The Pinnacle of Living"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/60" />
      </div>
      
      {/* Central Text Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[10px] md:text-[11px] uppercase tracking-[0.5em] text-white/90 font-sans mb-8 font-light">
            Curated Estates
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-[8rem] text-white tracking-wide leading-[1.1] mb-10 font-normal shadow-sm">
            The Pinnacle of Living
          </h1>
          <div className="flex items-center justify-center gap-6 text-white/70">
              <span className="w-8 h-[1px] bg-white/40" />
              <p className="text-[9px] uppercase tracking-[0.3em] font-sans">Salt Route Consulting</p>
              <span className="w-8 h-[1px] bg-white/40" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function HeroSearch({ locations }: { locations: string[] }) {
  const router = useRouter()
  const today = new Date()
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)

  const [location, setLocation] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(2)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (location) params.set("location", location)
    if (checkIn) params.set("checkIn", checkIn)
    if (checkOut) params.set("checkOut", checkOut)
    if (guests > 0) params.set("guests", String(guests))
    const qs = params.toString()
    router.push(qs ? `/properties?${qs}` : "/properties")
  }

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white/95 backdrop-blur-md shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-stretch border border-charcoal/10"
    >
      {/* Location */}
      <label className="flex-1 w-full md:w-auto p-5 md:p-6 border-b md:border-b-0 md:border-r border-charcoal/10 group hover:bg-[#FAFAFA] transition-all duration-500 cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border border-charcoal/10 flex items-center justify-center shrink-0">
            <MapPin className="w-3 h-3 text-charcoal/50" strokeWidth={1} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[8px] uppercase tracking-[0.2em] text-charcoal/40 mb-1 font-bold">Location</p>
            <input
              list="hero-locations"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Anywhere in Nepal"
              className="w-full font-sans text-sm text-charcoal font-medium tracking-wide bg-transparent border-0 outline-none placeholder:text-charcoal/30 placeholder:font-light"
            />
            <datalist id="hero-locations">
              {locations.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </div>
        </div>
      </label>

      {/* Stay Period */}
      <label className="flex-1 w-full md:w-auto p-5 md:p-6 border-b md:border-b-0 md:border-r border-charcoal/10 group hover:bg-[#FAFAFA] transition-all duration-500 cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border border-charcoal/10 flex items-center justify-center shrink-0">
            <Calendar className="w-3 h-3 text-charcoal/50" strokeWidth={1} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[8px] uppercase tracking-[0.2em] text-charcoal/40 mb-1 font-bold">Stay Period</p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={checkIn}
                min={fmt(today)}
                onChange={(e) => {
                  setCheckIn(e.target.value)
                  if (checkOut && e.target.value && checkOut <= e.target.value) {
                    setCheckOut("")
                  }
                }}
                className="font-sans text-xs text-charcoal font-medium bg-transparent border-0 outline-none w-[7.5rem]"
              />
              <span className="text-charcoal/30 text-xs">—</span>
              <input
                type="date"
                value={checkOut}
                min={checkIn || fmt(tomorrow)}
                onChange={(e) => setCheckOut(e.target.value)}
                className="font-sans text-xs text-charcoal font-medium bg-transparent border-0 outline-none w-[7.5rem]"
              />
            </div>
          </div>
        </div>
      </label>

      {/* Guests */}
      <label className="flex-1 w-full md:w-auto p-5 md:p-6 group hover:bg-[#FAFAFA] transition-all duration-500 cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border border-charcoal/10 flex items-center justify-center shrink-0">
            <Users className="w-3 h-3 text-charcoal/50" strokeWidth={1} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[8px] uppercase tracking-[0.2em] text-charcoal/40 mb-1 font-bold">Guests</p>
            <input
              type="number"
              min={1}
              max={20}
              value={guests}
              onChange={(e) => setGuests(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
              className="w-20 font-sans text-sm text-charcoal font-medium tracking-wide bg-transparent border-0 outline-none"
            />
          </div>
        </div>
      </label>

      {/* Search Button */}
      <button
        type="submit"
        className="w-full md:w-auto self-stretch bg-charcoal text-white px-12 lg:px-16 py-6 md:py-0 text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-sans hover:bg-gold transition-all duration-700 flex items-center justify-center min-h-[90px]"
      >
        Discover
      </button>
    </form>
  )
}

export default function HomeClient({ featured = [] }: { featured?: FeaturedProperty[] }) {
  const containerRef = useRef(null)

  const estates = useMemo(
    () =>
      featured.slice(0, 6).map((p) => ({
        id: p.id,
        name: p.title,
        location: p.location,
        image: getPrimaryImageUrl(p.images),
        href: `/properties/${p.slug}`,
        type: "Curated Residence",
      })),
    [featured]
  )

  const knownLocations = useMemo(() => {
    const seen = new Set<string>()
    const out: string[] = []
    for (const p of featured) {
      const city = p.location.split(",")[0]?.trim()
      if (city && !seen.has(city)) {
        seen.add(city)
        out.push(city)
      }
    }
    return out
  }, [featured])

  return (
    <div className="bg-background relative overflow-x-hidden" ref={containerRef}>

      {/* ─── HERO SECTION ─── */}
      <section className="relative h-[80vh] w-full flex flex-col justify-between pt-24 mb-12 md:mb-16">
        <HeroImage />

        {/* ─── SEARCH BAR ─── */}
        <div className="relative z-30 w-full max-w-screen-xl mx-auto px-6 md:px-12 mb-[-45px] mt-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <HeroSearch locations={knownLocations} />
          </motion.div>
        </div>
      </section>

      {/* ─── THE VISION SECTION (SALT ROUTE) ─── */}
      <section className="py-12 md:py-20 bg-background">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <FadeUp className="lg:col-span-5">
                <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/50 mb-6 font-bold">Our Heritage</p>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-charcoal leading-[1.1] tracking-tight mb-8">
                    The Salt Route <br/> Legacy
                </h2>
                <div className="w-16 h-[1px] bg-gold mb-8" />
                <p className="font-sans text-lg md:text-xl text-charcoal/80 leading-relaxed font-light mb-6">
                    Inspired by the ancient trade routes that connected the mountains to the plains, Salt Route Consulting curates an exclusive collection of residences that honor tradition while defining modern luxury.
                </p>
                <p className="font-sans text-base text-charcoal/60 leading-relaxed mb-10 font-light">
                    We don&apos;t just manage properties; we steward sanctuaries. Each estate in our portfolio is selected for its soul, its architecture, and its ability to offer an uncompromising connection to the spirit of Nepal.
                </p>
                <div className="flex items-center gap-6 mt-4">
                    <LuxuryLink href="/about" color="charcoal">Our Philosophy</LuxuryLink>
                    <LuxuryArrow color="gold" />
                </div>
            </FadeUp>

            <FadeUp delay={0.2} className="lg:col-span-7 relative h-[450px] md:h-[500px] w-full">
                <RevealImage
                    src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2000&auto=format&fit=crop"
                    alt="Salt Route Philosophy"
                    className="w-full h-full shadow-2xl"
                />
                <div className="absolute -bottom-8 -left-8 bg-white border border-charcoal/10 p-8 hidden md:block z-10 shadow-xl">
                    <p className="font-display text-4xl mb-2 text-charcoal">Est. 2024</p>
                    <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-charcoal/50">Nepal&apos;s Finest Boutique Estates</p>
                </div>
            </FadeUp>
        </div>
      </section>

      {/* ─── HORIZONTAL SCROLL / CAROUSEL FOR ESTATES ─── */}
      <section className="py-16 md:py-20 bg-[#FAFAFA] overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 mb-10 flex flex-col md:flex-row justify-between items-end gap-8">
          <FadeUp className="text-left max-w-2xl">
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-charcoal/50 mb-4 font-bold">The Collection</h2>
            <h3 className="font-display text-4xl md:text-5xl text-charcoal tracking-wide leading-none">Curated Estates</h3>
            <p className="mt-6 font-sans text-lg text-charcoal/60 font-light">From colonial manors to alpine retreats, discover our handpicked selection of residences.</p>
          </FadeUp>
          <FadeUp delay={0.2}>
            <div className="flex items-center gap-6 mt-4">
              <LuxuryLink href="/properties" color="charcoal">View All Residences</LuxuryLink>
              <LuxuryArrow color="gold" />
            </div>
          </FadeUp>
        </div>

        <FadeUp delay={0.3} className="w-full">
          {estates.length === 0 ? (
              <div className="py-32 px-8 text-center border border-charcoal/5 bg-white max-w-screen-xl mx-auto">
                <p className="font-display text-2xl md:text-3xl tracking-wide text-charcoal/40 mb-6">
                  Coming Soon
                </p>
                <p className="font-sans text-charcoal/50 font-light max-w-xl mx-auto mb-10">
                  Our curated collection is being prepared. New residences will appear here as they are added to the registry.
                </p>
                <Link
                  href="/contact"
                  className="inline-block bg-charcoal text-white px-12 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gold transition-all duration-700"
                >
                  Speak to Concierge
                </Link>
              </div>
          ) : (
            <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-8 px-6 md:px-12 pb-12 w-full">
              {estates.map((estate, idx) => {
                const formattedIdx = (idx + 1).toString().padStart(2, '0');
                return (
                  <div key={estate.id} className="snap-center shrink-0 w-[85vw] md:w-[60vw] lg:w-[40vw] flex flex-col group">
                    <Link href={estate.href} className="cursor-pointer block">
                      <div className="relative aspect-[4/3] overflow-hidden mb-6 bg-[#EFEFEF] shadow-lg">
                        {estate.image ? (
                          <RevealImage src={estate.image} alt={estate.name} className="w-full h-full group-hover:scale-105 transition-transform duration-1000" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/30">No Image</p>
                          </div>
                        )}
                        <div className="absolute top-6 right-6 bg-white px-4 py-2 shadow-sm">
                          <p className="text-[8px] uppercase tracking-[0.2em] text-charcoal font-bold">{estate.type}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-4 mb-2">
                              <span className="text-[10px] font-sans text-charcoal/40 font-bold">N° {formattedIdx}</span>
                              <span className="w-6 h-[1px] bg-charcoal/20" />
                              <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/60 font-bold">{estate.location}</p>
                          </div>
                          <h4 className="font-display text-2xl md:text-3xl text-charcoal tracking-wide mb-3 group-hover:text-gold transition-colors duration-700">{estate.name}</h4>
                          <div className="flex items-center gap-2">
                              <Star className="w-3 h-3 text-gold" strokeWidth={1.5} />
                              <span className="text-[9px] uppercase tracking-[0.1em] text-charcoal/50 font-sans font-bold">Heritage Sanctuary</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </FadeUp>
      </section>

      {/* ─── FOR PROPERTY OWNERS (PARTNER PORTAL) ─── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <FadeUp className="order-2 lg:order-1 relative h-[400px] md:h-[500px] w-full">
                <RevealImage
                    src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2000&auto=format&fit=crop"
                    alt="Owner Services - Nepali Heritage Architecture"
                    className="w-full h-full"
                />
            </FadeUp>

            <FadeUp className="order-1 lg:order-2 lg:pl-12">
                <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/50 mb-6 font-bold">Partner Portal</p>
                <h2 className="font-display text-4xl md:text-5xl text-charcoal tracking-tight leading-[1.1] mb-8">
                    Stewardship <br/> & Strategy
                </h2>
                <div className="w-16 h-[1px] bg-gold mb-8" />
                <p className="font-sans text-lg text-charcoal/70 leading-relaxed font-light mb-10">
                    We partner with discerning property owners to transform their residences into world-class hospitality destinations.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-4 h-4 text-gold" strokeWidth={1.5} />
                            <h4 className="text-[9px] uppercase tracking-[0.2em] font-bold text-charcoal">Asset Protection</h4>
                        </div>
                        <p className="text-sm text-charcoal/50 leading-relaxed font-light">Rigorous maintenance and white-glove security for your legacy.</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4 text-gold" strokeWidth={1.5} />
                            <h4 className="text-[9px] uppercase tracking-[0.2em] font-bold text-charcoal">Global Reach</h4>
                        </div>
                        <p className="text-sm text-charcoal/50 leading-relaxed font-light">Exclusive access to ultra-high-net-worth travelers worldwide.</p>
                    </div>
                </div>
                <div className="mt-8">
                  <LuxuryButton href="/for-owners" dark={false}>Become a Partner</LuxuryButton>
                </div>
            </FadeUp>
        </div>
      </section>

      <section className="h-[40vh] md:h-[50vh] w-full relative">
        <motion.div
          initial={{ clipPath: "inset(0% 5% 0% 5%)" }}
          whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop"
            alt="Immersive Nature"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />
        </motion.div>
      </section>

      {/* ─── SERVICES & EXPERIENCES ─── */}
      <section className="py-16 md:py-20 bg-[#FAFAFA]">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row justify-between gap-12 lg:gap-16">

          <div className="lg:w-5/12">
            <FadeUp>
              <div className="flex items-center gap-6 mb-6">
                <span className="w-10 h-[1px] bg-gold" />
                <h2 className="text-[10px] uppercase tracking-[0.4em] text-charcoal/50 font-bold">Awaken The Senses</h2>
              </div>
              <h3 className="font-display text-4xl md:text-5xl text-charcoal mb-8 tracking-wide leading-tight">Tailored<br/>Journeys</h3>
              <p className="font-sans text-xl text-charcoal/60 leading-relaxed font-light mb-10">
                Elevate your senses through authentic encounters. Every moment is meticulously crafted to connect you with the soul of Nepal.
              </p>
              <div className="flex items-center gap-6 mt-6">
                <LuxuryLink href="/services" color="charcoal">Explore Experiences</LuxuryLink>
                <LuxuryArrow color="gold" />
              </div>
            </FadeUp>
          </div>

          <div className="lg:w-7/12 flex flex-col pt-6 lg:pt-0 justify-center">
            {[
              { title: "Culinary Immersion", desc: "Private dining featuring heritage recipes and local organic produce." },
              { title: "Guided Excursions", desc: "Trek the hidden trails led by expert local naturalists." },
              { title: "Wellness & Spa", desc: "Ancient healing traditions integrated into holistic wellness." }
            ].map((exp, i) => (
              <FadeUp key={exp.title} delay={0.1 * i}>
                <div className="border-b border-charcoal/10 py-8 group cursor-pointer hover:pl-6 transition-all duration-500 hover:bg-white px-4 rounded-xl -mx-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-display text-2xl md:text-3xl text-charcoal group-hover:text-gold transition-colors duration-500">{exp.title}</h4>
                    <span className="text-[10px] font-sans tracking-[0.2em] text-charcoal/30 font-bold">0{i + 1}</span>
                  </div>
                  <p className="font-sans text-base text-charcoal/50 leading-relaxed font-light max-w-md">{exp.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>

        </div>
      </section>

      {/* ─── THE SALT ROUTE STANDARD (AMENITIES) ─── */}
      <section className="py-16 md:py-20 bg-white border-t border-charcoal/5">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 text-center">
          <FadeUp>
            <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/50 mb-4 font-bold">Signature Amenities</p>
            <h3 className="font-display text-4xl md:text-5xl text-charcoal mb-12 tracking-wide">The Salt Route Standard</h3>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 text-left">
            {[
              { icon: <ShieldCheck className="w-5 h-5 text-gold" strokeWidth={1.5} />, title: "Private Concierge", desc: "24/7 dedicated assistance tailored to your every whim." },
              { icon: <Users className="w-5 h-5 text-gold" strokeWidth={1.5} />, title: "Curated Staff", desc: "Private chefs and housekeepers trained in luxury hospitality." },
              { icon: <Star className="w-5 h-5 text-gold" strokeWidth={1.5} />, title: "Heritage Design", desc: "Authentic local architecture fused with modern comforts." },
              { icon: <Globe className="w-5 h-5 text-gold" strokeWidth={1.5} />, title: "Seamless Transfers", desc: "Chauffeur-driven arrivals ensuring peace of mind from the start." }
            ].map((feature, i) => (
              <FadeUp key={feature.title} delay={0.1 * i} className="group">
                <div className="mb-6 w-12 h-12 flex items-center justify-center border border-charcoal/10 rounded-full group-hover:border-gold transition-colors duration-500">
                  {feature.icon}
                </div>
                <h4 className="font-display text-xl text-charcoal mb-3 tracking-wide">{feature.title}</h4>
                <p className="font-sans text-sm text-charcoal/60 leading-relaxed font-light">{feature.desc}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GUEST REFLECTIONS (TESTIMONIALS) ─── */}
      <section className="py-16 md:py-20 bg-[#FAFAFA] border-t border-charcoal/5">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <FadeUp className="text-center mb-12">
            <h3 className="font-display text-3xl md:text-4xl text-charcoal tracking-wide mb-6">Guest Reflections</h3>
            <div className="w-12 h-[1px] bg-gold mx-auto" />
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { quote: "A sanctuary of peace in the heart of the Himalayas. The attention to detail and bespoke service was entirely unmatched.", author: "E. Rothschild", location: "London" },
              { quote: "Every architectural detail told a story. It wasn't just a stay; it was an immersion into the very soul of Nepalese heritage.", author: "M. Chen", location: "Singapore" },
              { quote: "From the private chef to the curated excursions, Salt Route redefined our understanding of luxury travel in South Asia.", author: "J. & A. Dupont", location: "Paris" }
            ].map((testimonial, i) => (
              <FadeUp key={i} delay={0.2 * i} className="flex flex-col text-center items-center">
                <p className="font-display text-lg md:text-xl text-charcoal/80 italic leading-relaxed mb-8">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className="mt-auto">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal mb-1">{testimonial.author}</p>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/40">{testimonial.location}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VISUAL JOURNAL (IMAGE CAROUSEL) ─── */}
      <section className="py-16 md:py-20 bg-white border-t border-charcoal/5 overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 mb-10 flex flex-col md:flex-row justify-between items-end gap-8">
          <FadeUp className="text-left max-w-2xl">
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-charcoal/50 mb-4 font-bold">Visual Journal</h2>
            <h3 className="font-display text-4xl md:text-5xl text-charcoal tracking-wide leading-none">Moments in Time</h3>
          </FadeUp>
        </div>
        <FadeUp delay={0.2} className="w-full">
          <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-8 px-6 md:px-12 pb-12 w-full">
            {[
              { src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2000&auto=format&fit=crop", title: "Himalayan Morning", location: "Annapurna" },
              { src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop", title: "Heritage Details", location: "Kathmandu" },
              { src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop", title: "Sanctuary Pools", location: "Pokhara" },
              { src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop", title: "Curated Interiors", location: "Patan" },
              { src: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop", title: "Morning Light", location: "Lalitpur" }
            ].map((img, idx) => (
              <div key={idx} className="snap-center shrink-0 w-[80vw] md:w-[45vw] lg:w-[30vw] flex flex-col group cursor-pointer">
                <div className="relative aspect-[3/4] overflow-hidden mb-6 bg-[#EFEFEF] shadow-lg">
                  <RevealImage src={img.src} alt={img.title} className="w-full h-full group-hover:scale-105 transition-transform duration-1000" />
                </div>
                <div className="flex justify-between items-center px-2">
                  <h4 className="font-display text-xl text-charcoal tracking-wide group-hover:text-gold transition-colors duration-500">{img.title}</h4>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/50 font-bold">{img.location}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeUp>
      </section>

      {/* ─── FINAL CALL TO ACTION ─── */}
      <section className="py-16 md:py-24 bg-white text-center px-6 border-t border-charcoal/5">
        <div className="max-w-3xl mx-auto relative z-20">
          <FadeUp>
            <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 mb-6 font-bold">Your Invitation</p>
            <h2 className="font-display text-4xl md:text-5xl text-charcoal mb-10 tracking-wide leading-[1.1]">
              Define Your Sanctuary.
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
                <LuxuryButton href="/properties" dark={false}>
                    View Stays
                </LuxuryButton>
                <LuxuryButton href="/contact" dark={false}>
                    Contact Concierge
                </LuxuryButton>
            </div>
          </FadeUp>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  )
}
