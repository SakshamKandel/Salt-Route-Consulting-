"use client"

import { useState, type FormEvent, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BadgeCheck,
  BedDouble,
  Building2,
  CalendarCheck,
  Camera,
  HeartHandshake,
  Home,
  LineChart,
  MapPin,
  MessageCircle,
  ShieldCheck,
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

type IconType = typeof Home

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
    icon: Camera,
    title: "Property Presentation",
    desc: "Photography, gallery flow, feature writing, and guest-ready pages that help each property feel considered.",
  },
  {
    icon: CalendarCheck,
    title: "Stay Readiness",
    desc: "Clear calendars, reservation notes, guest details, and owner updates arranged around each property.",
  },
  {
    icon: LineChart,
    title: "Clear Results",
    desc: "Revenue, arrivals, completed stays, and reviews presented simply, so owners can see what matters.",
  },
  {
    icon: HeartHandshake,
    title: "People-First Care",
    desc: "A direct Salt Route channel for updates, housekeeping notes, guest needs, and day-to-day support.",
  },
]

const operatingModel = [
  {
    step: "01",
    title: "Property Positioning",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2000&auto=format&fit=crop",
    desc: "Clear guest promise, location context, and long-term positioning for premium hospitality."
  },
  {
    step: "02",
    title: "Hosting Readiness",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop",
    desc: "Team preparation, service routines, and guest touchpoints made simple, graceful, and reliable."
  },
  {
    step: "03",
    title: "Brand Story",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop",
    desc: "Identity creation, narrative building, and marketing roadmap for heritage properties."
  },
  {
    step: "04",
    title: "Trust & Care",
    image: "https://images.unsplash.com/photo-1550966841-3ee71448744b?q=80&w=1974&auto=format&fit=crop",
    desc: "Clear expectations, fair practices, and responsible care within Nepal's hospitality landscape."
  }
]

const standards = [
  "Ethical operations",
  "Local employment",
  "Sustainable practices",
  "Guest-first hospitality",
  "Gracious hosting",
  "Community value",
]

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
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function IconBlock({
  icon: Icon,
  title,
  desc,
  dark = false,
}: {
  icon: IconType
  title: string
  desc: string
  dark?: boolean
}) {
  return (
    <div
      className={`group flex min-h-[300px] flex-col justify-between p-10 transition-all duration-700 border-r border-b border-white/10 ${
        dark ? "bg-charcoal hover:bg-charcoal/80" : "bg-white hover:bg-[#FBF9F4]"
      }`}
    >
      <Icon
        className={`h-5 w-5 stroke-[1] transition-colors duration-500 ${
          dark ? "text-gold/50 group-hover:text-gold" : "text-charcoal/30 group-hover:text-gold"
        }`}
      />
      <div className="space-y-6">
        <h3 className={`font-display text-2xl tracking-wide uppercase ${dark ? "text-white" : "text-charcoal"}`}>
          {title}
        </h3>
        <p className={`text-[14px] font-light leading-relaxed ${dark ? "text-white/40" : "text-charcoal/50"}`}>
          {desc}
        </p>
      </div>
    </div>
  )
}

export default function ForOwnersClient({ portfolio }: { portfolio: ForOwnersPortfolioItem[] }) {
  const featuredPortfolio = portfolio.length > 0 ? portfolio : fallbackPortfolio
  const heroImage = featuredPortfolio.find((item) => item.image)?.image ?? "/Sunshine Villa Main.png"
  const [ownerEnquiryStatus, setOwnerEnquiryStatus] = useState<"idle" | "loading" | "sent" | "error">("idle")

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
      
      {/* HERO SECTION */}
      <section className="relative h-[85svh] w-full flex items-center justify-center pt-20 bg-charcoal overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="Property Partnership"
            fill
            className="object-cover opacity-60 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/80" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl">
          <FadeUp>
            <p className="text-[10px] md:text-[11px] uppercase tracking-[0.6em] text-white/90 font-sans mb-8 font-light">
              Property Partnership
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-[8rem] text-white tracking-wide leading-[1.05] mb-12 font-normal uppercase">
              For Property Owners.
            </h1>
            <div className="flex items-center justify-center gap-6 text-white/40">
                <span className="w-12 h-[1px] bg-white/20" />
                <p className="text-[9px] uppercase tracking-[0.4em] font-sans">Shape Guest-Ready Stays</p>
                <span className="w-12 h-[1px] bg-white/20" />
            </div>
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
               <LuxuryButton href="#owner-enquiry" dark>List Your Property</LuxuryButton>
               <LuxuryLinkWithArrow href="#portfolio" color="white">View Portfolio</LuxuryLinkWithArrow>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* VALUE PROP SECTION - COMPACT */}
      <section className="py-20 md:py-28 bg-white overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
               <RevealImage 
                 src="/Sunshine Villa Main.png" 
                 alt="Luxury Property" 
                 className="aspect-[4/5] border border-charcoal/10"
               />
            </div>
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-12">
              <FadeUp>
                <div className="space-y-6">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 font-medium">Partnership Model</p>
                  <h2 className="font-display text-4xl md:text-5xl lg:text-7xl text-charcoal tracking-wide leading-[1.1] uppercase">
                    We build hospitality value,<br/>not paperwork.
                  </h2>
                </div>
              </FadeUp>
              <FadeUp delay={0.2} className="space-y-8">
                <p className="font-sans text-[16px] text-charcoal/60 leading-relaxed font-light">
                  Salt Route Consulting helps owners build long-term value through distinctive presentation, thoughtful care, and responsible growth. From heritage homes to modern apartments, every property deserves a story guests can feel.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-charcoal/10">
                   <div className="space-y-4">
                     <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold">Phase I: Positioning</p>
                     <p className="text-[13px] text-charcoal/50 leading-relaxed font-light">Defining market promise, guest profile, and location context.</p>
                   </div>
                   <div className="space-y-4">
                     <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold">Phase II: Guest Readiness</p>
                     <p className="text-[13px] text-charcoal/50 leading-relaxed font-light">Clear pricing, upcoming arrivals, and steady day-to-day care.</p>
                   </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES GRID - BOXY & DARK */}
      <section id="services" className="bg-charcoal py-20 md:py-28">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <FadeUp className="mb-20 space-y-6">
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-medium">What We Care For</p>
            <h2 className="font-display text-4xl md:text-6xl text-white tracking-wide uppercase">Managed with care.</h2>
          </FadeUp>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-l border-white/10">
            {ownerPromises.map((item, index) => (
              <FadeUp key={item.title} delay={index * 0.1}>
                <IconBlock icon={item.icon} title={item.title} desc={item.desc} dark />
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* OPERATING MODEL - CLEAN LIST */}
      <section className="py-20 md:py-28 bg-[#FBF9F4] border-b border-charcoal/5">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
            <div className="lg:col-span-5 space-y-10">
              <FadeUp>
                <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 font-medium">The Workflow</p>
                <h2 className="font-display text-4xl md:text-5xl lg:text-7xl text-charcoal tracking-wide leading-[1.1] uppercase">
                  From Property to<br/>Polished Stay.
                </h2>
              </FadeUp>
              <FadeUp delay={0.2}>
                <p className="font-sans text-[15px] text-charcoal/50 leading-relaxed font-light italic">
                  &ldquo;Owners see what matters: how the property is presented, which guests are arriving, and how each stay is growing.&rdquo;
                </p>
              </FadeUp>
            </div>
            
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 bg-charcoal/5 border border-charcoal/10">
              {operatingModel.map((item, index) => (
                <FadeUp key={item.step} delay={index * 0.1} className="bg-white p-10 flex flex-col gap-8 group hover:bg-[#FBF9F4] transition-all duration-700 border-charcoal/5 border-r border-b">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover grayscale-[0.6] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-charcoal/10 group-hover:bg-transparent transition-colors duration-700" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">{item.step}</p>
                    </div>
                    <h3 className="font-display text-2xl text-charcoal uppercase tracking-wide group-hover:text-gold transition-colors duration-500">
                      {item.title}
                    </h3>
                    <p className="text-[14px] text-charcoal/50 leading-relaxed font-light">
                      {item.desc}
                    </p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PORTFOLIO SECTION - BOXY CARDS */}
      <section id="portfolio" className="py-20 md:py-28 bg-white">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <FadeUp className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 font-medium">Managed Properties</p>
              <h2 className="font-display text-4xl md:text-6xl text-charcoal tracking-wide uppercase">Signature Managed Stays.</h2>
            </div>
            <LuxuryLinkWithArrow href="/properties" className="text-[10px]">View Full Collection</LuxuryLinkWithArrow>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-charcoal/10 border border-charcoal/10">
            {featuredPortfolio.map((property, index) => (
              <FadeUp key={property.slug} delay={index * 0.1} className="bg-white group overflow-hidden">
                <Link href={`/properties/${property.slug}`} className="block h-full">
                  <div className="relative aspect-[4/3] overflow-hidden grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000">
                    <Image
                      src={property.image || "/Sunshine Villa Main.png"}
                      alt={property.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                  </div>
                  <div className="p-10 space-y-6">
                    <div className="flex items-center justify-between">
                       <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-charcoal/30 flex items-center gap-2">
                         <MapPin className="w-3 h-3" /> {property.location}
                       </p>
                       <ArrowRight className="w-5 h-5 text-gold opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-700" strokeWidth={1} />
                    </div>
                    <h3 className="font-display text-3xl text-charcoal tracking-wide uppercase">{property.name}</h3>
                    <p className="text-[13px] text-charcoal/50 leading-relaxed font-light line-clamp-2">{property.desc}</p>
                    <div className="pt-4 flex items-center gap-6 border-t border-charcoal/5">
                      <div className="flex items-center gap-2">
                        <BedDouble className="w-3.5 h-3.5 text-charcoal/20" />
                        <span className="text-[10px] uppercase tracking-[0.1em] font-bold text-charcoal/40">{property.bedrooms} Beds</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-charcoal/20" />
                        <span className="text-[10px] uppercase tracking-[0.1em] font-bold text-charcoal/40">{property.maxGuests} Guests</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ENQUIRY SECTION - HIGH IMPACT FORM */}
      <section id="owner-enquiry" className="py-24 md:py-32 bg-charcoal text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <Image src="/Sunshine Villa Main.png" alt="" fill className="object-cover blur-2xl" />
        </div>
        
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            
            <div className="lg:col-span-5 space-y-12">
              <FadeUp>
                <p className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-medium">Partner With SRC</p>
                <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-white tracking-wide leading-tight uppercase">
                  Ready to List<br/>Your Property?
                </h2>
              </FadeUp>
              <FadeUp delay={0.2} className="space-y-12">
                <p className="font-sans text-[16px] text-white/40 leading-relaxed font-light">
                  Share your property details with Salt Route Consulting. Our team will review its story, guest readiness, and best path to welcome.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-6 pt-10 border-t border-white/10">
                    <ShieldCheck className="w-6 h-6 text-gold/60" strokeWidth={1} />
                    <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-white/60 uppercase">Property Care Assured</p>
                  </div>
                  <div className="flex items-center gap-6 pt-10 border-t border-white/10">
                    <BadgeCheck className="w-6 h-6 text-gold/60" strokeWidth={1} />
                    <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-white/60 uppercase">Verified Hospitality Standard</p>
                  </div>
                </div>
              </FadeUp>
            </div>

            <div className="lg:col-span-7">
               <FadeUp className="bg-white/5 backdrop-blur-md border border-white/10 p-10 md:p-16">
                  {ownerEnquiryStatus === "sent" ? (
                    <div className="text-center space-y-8 py-12">
                       <Sparkles className="w-12 h-12 text-gold mx-auto" strokeWidth={1} />
                       <h3 className="font-display text-4xl text-white tracking-wide uppercase">Enquiry Sent.</h3>
                       <p className="text-white/40 font-light">The Salt Route team will contact you within one business day.</p>
                       <LuxuryButton onClick={() => setOwnerEnquiryStatus("idle")} dark>Send Another</LuxuryButton>
                    </div>
                  ) : (
                    <form onSubmit={handleOwnerEnquiry} className="space-y-10">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-3">
                             <label className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/30 uppercase">Name</label>
                             <input name="name" required className="w-full bg-transparent border-b border-white/10 pb-4 text-white placeholder:text-white/10 focus:outline-none focus:border-gold transition-colors font-light" placeholder="Full name" />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/30 uppercase">Email</label>
                             <input name="email" type="email" required className="w-full bg-transparent border-b border-white/10 pb-4 text-white placeholder:text-white/10 focus:outline-none focus:border-gold transition-colors font-light" placeholder="your@email.com" />
                          </div>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-3">
                             <label className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/30 uppercase">Property Name</label>
                             <input name="propertyName" className="w-full bg-transparent border-b border-white/10 pb-4 text-white placeholder:text-white/10 focus:outline-none focus:border-gold transition-colors font-light" placeholder="Villa, Retreat, etc." />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/30 uppercase">Location</label>
                             <input name="propertyLocation" className="w-full bg-transparent border-b border-white/10 pb-4 text-white placeholder:text-white/10 focus:outline-none focus:border-gold transition-colors font-light" placeholder="City / Region" />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/30 uppercase">Message</label>
                          <textarea name="message" required rows={4} className="w-full bg-transparent border-b border-white/10 pb-4 text-white placeholder:text-white/10 focus:outline-none focus:border-gold transition-colors resize-none font-light" placeholder="Tell us about the property..." />
                       </div>
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

