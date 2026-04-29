"use client"

import { siteConfig } from "@/lib/site.config"
import { useRef, useState, type FormEvent, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion"
import {
  ArrowRight,
  BedDouble,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react"
import { LuxuryButton } from "@/components/ui/luxury-button"
import { LuxuryLinkWithArrow } from "@/components/ui/luxury-link-with-arrow"

export type ForOwnersPortfolioItem = {
  slug: string
  name: string
  location: string
  desc: string
  image: string | null
  bedrooms: number
  bathrooms: number
  maxGuests: number
  featured: boolean
}

const fallbackPortfolio: ForOwnersPortfolioItem[] = [
  {
    slug: "sunshine-villa-ilam",
    name: "Sunshine Villa Ilam",
    location: "Ilam, Eastern Nepal",
    desc: "A premium villa retreat surrounded by Ilam's tea gardens, fresh air, quiet hills, and slow hospitality.",
    image: "/Sunshine Villa Main.png",
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 6,
    featured: true,
  },
]

const ownerPromises = [
  {
    num: "01",
    title: "Property Presentation",
    desc: "Photography, gallery flow, feature writing, and guest-ready pages that help each property feel considered before a guest arrives.",
  },
  {
    num: "02",
    title: "Stay Readiness",
    desc: "Calendars, reservations, guest details, and owner updates arranged around the rhythm of each property.",
  },
  {
    num: "03",
    title: "Clear Results",
    desc: "Revenue, arrivals, completed stays, and reviews presented simply, so owners can see what matters at a glance.",
  },
  {
    num: "04",
    title: "People-First Care",
    desc: `A direct ${siteConfig.name} channel for housekeeping notes, guest needs, and the small day-to-day decisions that shape a stay.`,
  },
]

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function useParallaxY(ref: React.RefObject<HTMLElement | null>, intensity = 0.15): MotionValue<string> {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  return useTransform(scrollYProgress, [0, 1], [`-${intensity * 100}%`, `${intensity * 100}%`])
}

function ParallaxFigure({
  src,
  alt,
  className = "",
  intensity = 0.18,
}: {
  src: string
  alt: string
  className?: string
  intensity?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const y = useParallaxY(ref, intensity)

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="absolute inset-[-12%] will-change-transform">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </motion.div>
    </div>
  )
}

export default function ForOwnersClient({ portfolio }: { portfolio: ForOwnersPortfolioItem[] }) {
  const featuredPortfolio = portfolio.length > 0 ? portfolio : fallbackPortfolio
  const heroImage = featuredPortfolio.find((item) => item.image)?.image ?? "/Sunshine Villa Main.png"
  const [ownerEnquiryStatus, setOwnerEnquiryStatus] = useState<"idle" | "loading" | "sent" | "error">("idle")

  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const heroParallax = useTransform(heroProgress, [0, 1], ["0%", "30%"])
  const heroContentParallax = useTransform(heroProgress, [0, 1], ["0%", "-15%"])
  const heroContentOpacity = useTransform(heroProgress, [0, 0.7], [1, 0])

  async function handleOwnerEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setOwnerEnquiryStatus("loading")
    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          subject: "Owner Partnership Enquiry",
          message: `Property: ${formData.get("propertyName")} at ${formData.get("propertyLocation")}\n\n${formData.get("message")}`,
        }),
      })
      if (!response.ok) throw new Error("Failed")
      form.reset()
      setOwnerEnquiryStatus("sent")
    } catch {
      setOwnerEnquiryStatus("error")
    }
  }

  return (
    <div className="bg-background text-charcoal min-h-screen">

      {/* HERO */}
      <section ref={heroRef} className="relative h-[100svh] w-full flex flex-col items-center justify-center pt-20 bg-charcoal overflow-hidden">
        <motion.div
          style={{ y: heroParallax, scale: 1.15 }}
          className="absolute inset-0 z-0 will-change-transform"
        >
          <Image
            src={heroImage}
            alt="Property Partnership"
            fill
            className="object-cover opacity-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />
        </motion.div>

        <motion.div
          style={{ y: heroContentParallax, opacity: heroContentOpacity }}
          className="relative z-10 text-center px-6 max-w-6xl w-full will-change-transform"
        >
          <FadeUp>
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.6em] text-white/55 font-sans mb-10 font-light">
              Property Partnership
            </p>
            <span className="block w-10 h-px bg-gold/50 mx-auto mb-10" aria-hidden />
            <h1
              className="font-display text-white tracking-wide leading-[0.95] font-normal uppercase"
              style={{ fontSize: "clamp(3.5rem, 12vw, 10rem)" }}
            >
              For Property<br />Owners.
            </h1>
            <p className="mt-12 max-w-md mx-auto text-[14px] md:text-[15px] text-white/45 font-light leading-relaxed">
              A long-term partnership for distinctive properties across the Himalayan range and beyond.
            </p>
            <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-8">
              <LuxuryButton href="#owner-enquiry" dark>List Your Property</LuxuryButton>
              <LuxuryLinkWithArrow href="#portfolio" color="white">View Portfolio</LuxuryLinkWithArrow>
            </div>
          </FadeUp>
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-4 pointer-events-none">
          <span className="text-[8px] uppercase tracking-[0.5em] text-white/25 font-light">Scroll</span>
          <motion.span
            aria-hidden
            animate={{ y: [0, 10, 0], opacity: [0.4, 0.1, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="block w-px h-14 bg-gradient-to-b from-white/30 to-transparent"
          />
        </div>
      </section>

      {/* WELCOME / PROMISE */}
      <section className="py-24 md:py-32 bg-white overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <ParallaxFigure
                src="/luxury_himalayan_retreat_exterior_1777124225845.png"
                alt="A managed Salt Route property at altitude"
                className="aspect-[4/5] border border-charcoal/10"
                intensity={0.14}
              />
            </div>
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-10">
              <FadeUp className="space-y-6">
                <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 font-medium">Why Salt Route</p>
                <h2 className="font-display text-4xl md:text-5xl lg:text-7xl text-charcoal tracking-wide leading-[1.05] uppercase">
                  Hospitality value,<br />not paperwork.
                </h2>
              </FadeUp>
              <FadeUp delay={0.15}>
                <p className="font-sans text-[16px] md:text-[17px] text-charcoal/60 leading-[1.85] font-light max-w-xl">
                  We take time to understand what makes each property unrepeatable, the setting, the light, the kind of guest it deserves, and build a long-term position around it. Not a template, not a pipeline. A relationship measured in seasons.
                </p>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* THE APPROACH: sticky image + numbered practices */}
      <section className="bg-charcoal py-24 md:py-32 overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <FadeUp className="mb-16 md:mb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-end">
            <div className="lg:col-span-7 space-y-5">
              <p className="text-[10px] uppercase tracking-[0.5em] text-white/30 font-medium">The Approach</p>
              <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-white tracking-wide uppercase leading-[1.05]">
                Four practices,<br />steady through the seasons.
              </h2>
            </div>
            <p className="lg:col-span-5 font-sans text-[14px] md:text-[15px] text-white/40 leading-[1.85] font-light max-w-md">
              Repeated for every property we partner with, never as a checklist, always as practice.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-24">
                <ParallaxFigure
                  src="/luxury_nepalese_interior_details_1777124245155.png"
                  alt="A considered interior detail"
                  className="aspect-[4/5]"
                  intensity={0.12}
                />
              </div>
            </div>

            <ol className="lg:col-span-7 space-y-12">
              {ownerPromises.map((item, index) => (
                <FadeUp key={item.num} delay={index * 0.08}>
                  <li className="grid grid-cols-12 gap-5 md:gap-8 pb-12 border-b border-white/10 last:border-b-0 last:pb-0">
                    <span
                      aria-hidden
                      className="col-span-2 lg:col-span-2 font-display text-3xl md:text-4xl text-gold/40 leading-none tracking-wide"
                    >
                      {item.num}
                    </span>
                    <div className="col-span-10 lg:col-span-10 space-y-4">
                      <h3 className="font-display text-2xl md:text-3xl text-white tracking-wide uppercase leading-[1.15]">
                        {item.title}
                      </h3>
                      <p className="text-[14px] md:text-[15px] text-white/45 leading-[1.85] font-light max-w-md">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                </FadeUp>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section id="portfolio" className="py-24 md:py-32 bg-white">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <FadeUp className="mb-16 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-5 max-w-2xl">
              <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 font-medium">Managed Properties</p>
              <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-charcoal tracking-wide uppercase leading-[1.05]">
                Signature managed stays.
              </h2>
            </div>
            <LuxuryLinkWithArrow href="/properties" className="text-[10px]">View Full Collection</LuxuryLinkWithArrow>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-charcoal/10 border border-charcoal/10">
            {featuredPortfolio.map((property, index) => (
              <FadeUp key={property.slug} delay={index * 0.1} className="bg-white group overflow-hidden">
                <Link href={`/properties/${property.slug}`} className="block h-full">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={property.image || "/Sunshine Villa Main.png"}
                      alt={property.name}
                      fill
                      className="object-cover transition-transform duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-700" />
                  </div>
                  <div className="p-10 space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-charcoal/35 flex items-center gap-2">
                        <MapPin className="w-3 h-3" strokeWidth={1.2} /> {property.location}
                      </p>
                      <ArrowRight className="w-5 h-5 text-gold opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-700" strokeWidth={1} />
                    </div>
                    <h3 className="font-display text-3xl text-charcoal tracking-wide uppercase leading-[1.1]">
                      {property.name}
                    </h3>
                    <p className="text-[14px] text-charcoal/55 leading-[1.8] font-light line-clamp-2">
                      {property.desc}
                    </p>
                    <div className="pt-5 flex items-center gap-7 border-t border-charcoal/8">
                      <div className="flex items-center gap-2">
                        <BedDouble className="w-3.5 h-3.5 text-charcoal/30" strokeWidth={1.2} />
                        <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-charcoal/45">{property.bedrooms} Beds</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-charcoal/30" strokeWidth={1.2} />
                        <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-charcoal/45">{property.maxGuests} Guests</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ENQUIRY */}
      <section id="owner-enquiry" className="py-24 md:py-32 bg-charcoal text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Image src="/Sunshine Villa Main.png" alt="" fill className="object-cover blur-2xl" />
        </div>

        <div className="max-w-screen-xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-24">

            <div className="lg:col-span-5 space-y-12">
              <FadeUp className="space-y-7">
                <p className="text-[10px] uppercase tracking-[0.5em] text-white/30 font-medium">Partner With SRC</p>
                <h2 className="font-display text-4xl md:text-5xl lg:text-7xl text-white tracking-wide leading-[1.05] uppercase">
                  Tell us about<br />your property.
                </h2>
                <p className="font-sans text-[15px] md:text-[16px] text-white/45 leading-[1.85] font-light max-w-md">
                  Share what you have, what you&rsquo;ve imagined for it, and what you&rsquo;re unsure about. We read every enquiry and reply within one business day.
                </p>
              </FadeUp>

              <FadeUp delay={0.15} className="pt-10 border-t border-white/10 space-y-6">
                <p className="text-[10px] uppercase tracking-[0.4em] text-gold/65 font-medium">Or Reach Us Directly</p>
                <div className="space-y-3 pt-1">
                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    className="block text-[14px] md:text-[15px] text-white/70 hover:text-gold transition-colors duration-500 font-light tracking-wide"
                  >
                    {siteConfig.contact.email}
                  </a>
                  <a
                    href={siteConfig.contact.phoneHref}
                    className="block text-[14px] md:text-[15px] text-white/70 hover:text-gold transition-colors duration-500 font-light tracking-wide"
                  >
                    {siteConfig.contact.phone}
                  </a>
                  <p className="text-[12px] text-white/30 font-light pt-1 leading-relaxed">
                    {siteConfig.contact.address}
                  </p>
                </div>
              </FadeUp>
            </div>

            <div className="lg:col-span-7">
              <FadeUp className="bg-white/[0.04] backdrop-blur-md border border-white/10 p-10 md:p-14">
                {ownerEnquiryStatus === "sent" ? (
                  <div className="text-center space-y-7 py-10">
                    <Sparkles className="w-12 h-12 text-gold mx-auto" strokeWidth={1} />
                    <h3 className="font-display text-3xl md:text-4xl text-white tracking-wide uppercase">Enquiry Sent.</h3>
                    <p className="text-white/50 font-light leading-[1.8]">The {siteConfig.name} team will be in touch within one business day.</p>
                    <LuxuryButton onClick={() => setOwnerEnquiryStatus("idle")} dark>Send Another</LuxuryButton>
                  </div>
                ) : (
                  <form onSubmit={handleOwnerEnquiry} className="space-y-9">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-9">
                      <div className="space-y-3">
                        <label className="text-[9px] uppercase tracking-[0.35em] font-medium text-white/40">Name</label>
                        <input name="name" required className="w-full bg-transparent border-b border-white/15 pb-4 text-white placeholder:text-white/15 focus:outline-none focus:border-gold transition-colors font-light" placeholder="Full name" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] uppercase tracking-[0.35em] font-medium text-white/40">Email</label>
                        <input name="email" type="email" required className="w-full bg-transparent border-b border-white/15 pb-4 text-white placeholder:text-white/15 focus:outline-none focus:border-gold transition-colors font-light" placeholder="your@email.com" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-9">
                      <div className="space-y-3">
                        <label className="text-[9px] uppercase tracking-[0.35em] font-medium text-white/40">Property Name</label>
                        <input name="propertyName" className="w-full bg-transparent border-b border-white/15 pb-4 text-white placeholder:text-white/15 focus:outline-none focus:border-gold transition-colors font-light" placeholder="Villa, Retreat, Estate" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] uppercase tracking-[0.35em] font-medium text-white/40">Location</label>
                        <input name="propertyLocation" className="w-full bg-transparent border-b border-white/15 pb-4 text-white placeholder:text-white/15 focus:outline-none focus:border-gold transition-colors font-light" placeholder="City, Region" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] uppercase tracking-[0.35em] font-medium text-white/40">Tell us about the property</label>
                      <textarea name="message" required rows={4} className="w-full bg-transparent border-b border-white/15 pb-4 text-white placeholder:text-white/15 focus:outline-none focus:border-gold transition-colors resize-none font-light leading-[1.8]" placeholder="Setting, hosting style, what makes it distinctive..." />
                    </div>
                    {ownerEnquiryStatus === "error" && (
                      <p className="text-[12px] text-red-300/80 font-light">Something didn&rsquo;t send. Please try once more, or write to us directly.</p>
                    )}
                    <LuxuryButton type="submit" disabled={ownerEnquiryStatus === "loading"} className="w-full" dark>
                      {ownerEnquiryStatus === "loading" ? "Sending..." : "Send Partnership Enquiry"}
                    </LuxuryButton>
                  </form>
                )}
              </FadeUp>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}
