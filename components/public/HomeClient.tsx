"use client"

import { useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, useScroll, useTransform } from "framer-motion"
import { Calendar, Users, MapPin } from "lucide-react"
import { getPrimaryImageUrl, type PropertyMediaLike } from "@/lib/property-media"
import { LuxuryButton } from "@/components/ui/luxury-button"
import { LuxuryLinkWithArrow } from "@/components/ui/luxury-link-with-arrow"
import { LocationCombobox, type ComboboxProperty } from "@/components/public/LocationCombobox"

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

function ParallaxCard({
  src,
  alt,
  className = "",
  intensity = 0.15,
}: {
  src: string
  alt: string
  className?: string
  intensity?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], [`-${intensity * 100}%`, `${intensity * 100}%`])

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="absolute inset-[-12%] will-change-transform">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover"
        />
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
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 1000], [0, 300])
  const textY = useTransform(scrollY, [0, 1000], [0, 150])

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-charcoal">
      <motion.div className="absolute inset-0" style={{ y }}>
        <Image
          src="/Sunshine Villa Main.png"
          alt="The Pinnacle of Living"
          fill
          sizes="100vw"
          className="object-cover scale-[1.1]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/60" />
      </motion.div>
      
      {/* Central Text Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ y: textY }}
        >
          <p className="text-[10px] md:text-[11px] uppercase tracking-[0.5em] text-white/90 font-sans mb-8 font-light">
            Boutique Stays Across Nepal
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-[8rem] text-white tracking-wide leading-[1.1] mb-10 font-normal shadow-sm">
            Stays with Soul
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

function HeroSearch({ properties }: { properties: ComboboxProperty[] }) {
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
      <label className="flex-1 w-full md:w-auto p-5 md:p-6 border-b md:border-b-0 md:border-r border-charcoal/10 group hover:bg-[#FBF9F4] transition-all duration-500 cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border border-charcoal/10 flex items-center justify-center shrink-0">
            <MapPin className="w-3 h-3 text-charcoal/50" strokeWidth={1} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[8px] uppercase tracking-[0.2em] text-charcoal/40 mb-1 font-bold">Location</p>
            <LocationCombobox
              value={location}
              onChange={setLocation}
              properties={properties}
              placeholder="Anywhere in Nepal"
              inputClassName="w-full font-sans text-sm text-charcoal font-medium tracking-wide bg-transparent border-0 outline-none placeholder:text-charcoal/30 placeholder:font-light"
            />
          </div>
        </div>
      </label>

      {/* Stay Period */}
      <label className="flex-1 w-full md:w-auto p-5 md:p-6 border-b md:border-b-0 md:border-r border-charcoal/10 group hover:bg-[#FBF9F4] transition-all duration-500 cursor-pointer">
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
              <span className="text-charcoal/30 text-xs">to</span>
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
      <label className="flex-1 w-full md:w-auto p-5 md:p-6 group hover:bg-[#FBF9F4] transition-all duration-500 cursor-pointer">
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

function ImmersiveSection() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"])
  const textOpacity = useTransform(scrollYProgress, [0.15, 0.45, 0.75], [0, 1, 0.2])
  const textY = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"])

  return (
    <section ref={ref} className="h-[70vh] md:h-[85vh] w-full relative overflow-hidden bg-charcoal">
      <motion.div className="absolute inset-0 w-full h-full will-change-transform" style={{ y }}>
        <Image
          src="/luxury_himalayan_retreat_exterior_1777124225845.png"
          alt="A retreat at altitude"
          fill
          sizes="100vw"
          className="object-cover scale-[1.18]"
        />
      </motion.div>
      <div className="absolute inset-0 bg-charcoal/45" />

      <motion.div
        style={{ opacity: textOpacity, y: textY }}
        className="absolute inset-0 z-10 flex items-center justify-center px-6 will-change-transform"
      >
        <div className="text-center max-w-4xl">
          <span className="block w-10 h-px bg-gold/50 mx-auto mb-10" aria-hidden />
          <p className="text-[10px] md:text-[11px] uppercase tracking-[0.6em] text-white/55 font-light mb-10">
            A Quiet Promise
          </p>
          <p
            className="font-display text-white tracking-wide leading-[1.1] uppercase"
            style={{ fontSize: "clamp(2rem, 5.5vw, 4.5rem)" }}
          >
            Stays where the place,
            <br />
            and the people, stay with you.
          </p>
        </div>
      </motion.div>
    </section>
  )
}

export default function HomeClient({
  featured = [],
  allProperties = [],
}: {
  featured?: FeaturedProperty[]
  allProperties?: ComboboxProperty[]
}) {
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

  return (
    <div className="bg-background relative overflow-x-hidden" ref={containerRef}>

      {/* â”€â”€â”€ HERO SECTION â”€â”€â”€ */}
      <section className="relative h-[80vh] w-full flex flex-col justify-between pt-24 mb-12 md:mb-16">
        <HeroImage />

        {/* â”€â”€â”€ SEARCH BAR â”€â”€â”€ */}
        <div className="relative z-30 w-full max-w-screen-xl mx-auto px-6 md:px-12 mb-[-45px] mt-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <HeroSearch properties={allProperties} />
          </motion.div>
        </div>
      </section>

      {/* â”€â”€â”€ THE VISION SECTION (SALT ROUTE) â”€â”€â”€ */}
      <section className="py-24 md:py-32 bg-white overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-24 items-center">
            <FadeUp className="lg:col-span-5 order-2 lg:order-1 space-y-10">
              <div className="space-y-6">
                <p className="text-[10px] uppercase tracking-[0.5em] text-charcoal/40 font-medium">Our Story</p>
                <h2
                  className="font-display text-charcoal tracking-wide uppercase leading-[1.05]"
                  style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}
                >
                  Local roots,
                  <br />
                  gracious routes.
                </h2>
              </div>
              <p className="font-sans text-[16px] md:text-[17px] text-charcoal/60 leading-[1.85] font-light max-w-md">
                Salt Route Consulting is the hospitality and development arm of Salt Route Group. We shape thoughtful stays and property partnerships across Nepal, helping each home carry its own sense of place, warmth, and quiet refinement, from tea country retreats to mountain-view apartments.
              </p>
              <div className="pt-2">
                <LuxuryLinkWithArrow href="/about">More About Us</LuxuryLinkWithArrow>
              </div>
            </FadeUp>

            <div className="lg:col-span-7 order-1 lg:order-2">
              <ParallaxCard
                src="/luxury_himalayan_retreat_exterior_1777124225845.png"
                alt="A Salt Route property at altitude"
                className="aspect-[4/5] md:aspect-[5/6] w-full"
                intensity={0.14}
              />
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€â”€ HORIZONTAL SCROLL / CAROUSEL FOR ESTATES â”€â”€â”€ */}
      <section className="py-24 md:py-32 bg-[#FBF9F4] overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 mb-12 md:mb-16 flex flex-col md:flex-row justify-between items-end gap-10">
          <FadeUp className="space-y-5 max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.5em] text-charcoal/40 font-medium">The Collection</p>
            <h2
              className="font-display text-charcoal tracking-wide uppercase leading-[1.05]"
              style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}
            >
              Boutique stays.
            </h2>
            <p className="font-sans text-[15px] md:text-[16px] text-charcoal/55 leading-[1.85] font-light max-w-xl pt-2">
              From Sunshine Villa in Ilam to intimate city and nature-led retreats, places chosen for comfort, character, and care.
            </p>
          </FadeUp>
          <FadeUp delay={0.2}>
            <LuxuryLinkWithArrow href="/properties">View All Stays</LuxuryLinkWithArrow>
          </FadeUp>
        </div>

        <FadeUp delay={0.3} className="w-full">
          {estates.length === 0 ? (
            <div className="py-28 md:py-32 px-8 text-center border border-charcoal/10 bg-white max-w-screen-xl mx-auto space-y-8">
              <p className="font-display text-2xl md:text-3xl tracking-wide text-charcoal/40">
                Coming Soon
              </p>
              <p className="font-sans text-charcoal/50 font-light max-w-xl mx-auto leading-[1.8]">
                Our collection is being prepared. New stays will appear here as they are ready to welcome guests.
              </p>
              <div className="pt-4">
                <LuxuryButton href="/contact">Speak to Our Team</LuxuryButton>
              </div>
            </div>
          ) : (
            <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-6 md:gap-10 px-6 md:px-12 pb-12 w-full">
              {estates.map((estate) => {
                return (
                  <div key={estate.id} className="snap-center shrink-0 w-[85vw] md:w-[55vw] lg:w-[40vw] flex flex-col group">
                    <Link href={estate.href} className="cursor-pointer block">
                      <div className="relative aspect-[4/5] overflow-hidden mb-6 bg-[#F5F1E8]">
                        {estate.image ? (
                          <Image
                            src={estate.image}
                            alt={estate.name}
                            fill
                            sizes="(max-width: 768px) 85vw, 40vw"
                            className="object-cover transition-transform duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-charcoal/30">No Image</p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-700 pointer-events-none" />
                      </div>
                      <div className="space-y-3 px-1">
                        <p className="text-[9px] uppercase tracking-[0.35em] text-charcoal/50 font-medium">{estate.location}</p>
                        <h3 className="font-display text-2xl md:text-3xl text-charcoal tracking-wide uppercase leading-[1.1] group-hover:text-gold transition-colors duration-700">
                          {estate.name}
                        </h3>
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </FadeUp>
      </section>

      <ImmersiveSection />

      {/* FOR PROPERTY OWNERS (DARK) */}
      <section className="bg-charcoal py-24 md:py-32 text-white overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-24 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1">
              <ParallaxCard
                src="/luxury_nepalese_interior_details_1777124245155.png"
                alt="Heritage interior detail"
                className="aspect-[4/3] md:aspect-[5/4] w-full"
                intensity={0.12}
              />
            </div>
            <div className="lg:col-span-5 order-1 lg:order-2 space-y-10">
              <FadeUp className="space-y-6">
                <p className="text-[10px] uppercase tracking-[0.5em] text-white/35 font-medium">For Property Owners</p>
                <h2
                  className="font-display text-white tracking-wide uppercase leading-[1.05]"
                  style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
                >
                  Care, story,
                  <br />
                  steady growth.
                </h2>
              </FadeUp>
              <FadeUp delay={0.15}>
                <p className="font-sans text-[15px] md:text-[16px] text-white/55 leading-[1.85] font-light max-w-md">
                  We partner with owners to prepare homes for memorable stays, build a story guests can feel before they arrive, and grow long-term value through gracious hosting and considered presentation.
                </p>
              </FadeUp>
              <FadeUp delay={0.3} className="pt-2">
                <LuxuryButton href="/for-owners" dark>Partner With Us</LuxuryButton>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* TAILORED JOURNEYS */}
      <section className="py-24 md:py-32 bg-[#FBF9F4]">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-24">
            <div className="lg:col-span-5">
              <FadeUp className="space-y-6 lg:sticky lg:top-28">
                <p className="text-[10px] uppercase tracking-[0.5em] text-charcoal/40 font-medium">Tailored Journeys</p>
                <h2
                  className="font-display text-charcoal tracking-wide uppercase leading-[1.05]"
                  style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)" }}
                >
                  Awaken
                  <br />
                  the senses.
                </h2>
                <p className="font-sans text-[15px] md:text-[16px] text-charcoal/55 leading-[1.85] font-light max-w-sm pt-2">
                  Travel through Nepal at your own pace. Curated stays, gentle encounters, and the kind of routes that honour both people and place.
                </p>
                <div className="pt-4">
                  <LuxuryLinkWithArrow href="/services">Explore Experiences</LuxuryLinkWithArrow>
                </div>
              </FadeUp>
            </div>

            <ol className="lg:col-span-7 lg:pt-2">
              {[
                { num: "01", title: "Culinary Immersion", desc: "Private dining featuring heritage recipes and local organic produce." },
                { num: "02", title: "Guided Excursions", desc: "Walk nearby trails and cultural routes with trusted local insight." },
                { num: "03", title: "Quiet Wellness", desc: "Unhurried moments for rest, reflection, and gentle renewal." },
              ].map((exp, i) => (
                <FadeUp key={exp.num} delay={i * 0.08}>
                  <li className="grid grid-cols-12 gap-5 md:gap-8 py-10 md:py-12 border-b border-charcoal/10 last:border-b-0 group">
                    <span
                      aria-hidden
                      className="col-span-2 lg:col-span-1 font-display text-2xl md:text-3xl text-gold/55 leading-none tracking-wide"
                    >
                      {exp.num}
                    </span>
                    <div className="col-span-10 lg:col-span-11 space-y-3">
                      <h3 className="font-display text-2xl md:text-3xl text-charcoal tracking-wide uppercase leading-[1.15] group-hover:text-gold transition-colors duration-700">
                        {exp.title}
                      </h3>
                      <p className="text-[14px] md:text-[15px] text-charcoal/55 leading-[1.85] font-light max-w-md">
                        {exp.desc}
                      </p>
                    </div>
                  </li>
                </FadeUp>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* VISUAL JOURNAL */}
      <section className="py-24 md:py-32 bg-white overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <FadeUp className="space-y-5 max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 font-medium">Visual Journal</p>
            <h2
              className="font-display text-charcoal tracking-wide uppercase leading-[1.05]"
              style={{ fontSize: "clamp(2.5rem, 5.5vw, 5rem)" }}
            >
              Moments in time.
            </h2>
          </FadeUp>
        </div>
        <FadeUp delay={0.2} className="w-full">
          <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-6 md:gap-8 px-6 md:px-12 pb-12 w-full">
            {[
              { src: "/luxury_himalayan_retreat_exterior_1777124225845.png", title: "Himalayan Light", location: "Ilam" },
              { src: "/luxury_nepalese_interior_details_1777124245155.png", title: "Heritage Detail", location: "Kathmandu" },
              { src: "/private_himalayan_dining_luxury_1777124309093.png", title: "Quiet Dining", location: "Lalitpur" },
              { src: "/bespoke_travel_planning_flatlay_luxury_1777124261083.png", title: "Considered Plans", location: "Patan" },
              { src: "/mastery_details.png", title: "Mastery in Detail", location: "Boudhanath" },
              { src: "/luxury_boutique_office_team.png", title: "The Salt Route Team", location: "Lalitpur" },
            ].map((img, idx) => (
              <div key={idx} className="snap-center shrink-0 w-[80vw] md:w-[45vw] lg:w-[32vw] flex flex-col group cursor-pointer">
                <div className="relative aspect-[3/4] overflow-hidden mb-5 bg-[#F5F1E8]">
                  <Image
                    src={img.src}
                    alt={img.title}
                    fill
                    sizes="(max-width: 768px) 80vw, 32vw"
                    className="object-cover transition-transform duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex justify-between items-baseline px-1">
                  <h4 className="font-display text-lg md:text-xl text-charcoal tracking-wide group-hover:text-gold transition-colors duration-500">{img.title}</h4>
                  <p className="text-[9px] uppercase tracking-[0.35em] text-charcoal/35 font-medium">{img.location}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeUp>
      </section>

      {/* YOUR INVITATION (FINAL) */}
      <section className="py-32 md:py-44 bg-charcoal text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <Image src="/Sunshine Villa Main.png" alt="" fill className="object-cover blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto relative z-10">
          <FadeUp className="space-y-12">
            <span className="block w-12 h-px bg-gold/45 mx-auto" aria-hidden />
            <p className="text-[10px] uppercase tracking-[0.6em] text-white/40 font-light">Your Invitation</p>
            <h2
              className="font-display text-white tracking-wide uppercase leading-[0.95]"
              style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}
            >
              Find your
              <br />
              place in Nepal.
            </h2>
            <p className="font-sans text-[15px] md:text-[16px] text-white/45 leading-[1.85] font-light max-w-md mx-auto">
              A quiet stay, a curated journey, or a long-term partnership. We&rsquo;ll meet you wherever your story begins.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-8">
              <LuxuryButton href="/properties" dark>View Stays</LuxuryButton>
              <LuxuryLinkWithArrow href="/contact" color="white">Speak With Us</LuxuryLinkWithArrow>
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

