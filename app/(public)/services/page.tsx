"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { LuxuryButton } from "@/components/ui/luxury-button"
import { LuxuryLinkWithArrow } from "@/components/ui/luxury-link-with-arrow"
import { 
  Compass, 
  Map, 
  Sparkles, 
  UtensilsCrossed, 
  Car, 
  Mountain, 
  ShieldCheck, 
  Activity, 
  Users,
  LineChart,
  Target
} from "lucide-react"

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

const guestServices = [
  {
    num: "01",
    title: "Curated Property Stays",
    cta: "Browse Collection",
    href: "/properties",
    icon: Map,
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2000&auto=format&fit=crop",
    desc: "Curated stays at our exclusive properties, honoring local heritage and delivering high-value experiences."
  },
  {
    num: "02",
    title: "Personal Travel Planning",
    cta: "Plan Your Journey",
    href: "/contact",
    icon: Compass,
    image: "https://images.unsplash.com/photo-1540961018629-a53dfce2fb66?q=80&w=2000&auto=format&fit=crop",
    desc: "Complete journeys shaped around Nepal's landscapes, cultures, and communities with care and authenticity."
  },
  {
    num: "03",
    title: "Nature Trails",
    cta: "Enquire Now",
    href: "/contact",
    icon: Target,
    image: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=2000&auto=format&fit=crop",
    desc: "Low-impact outdoor experiences that connect travelers gently with the landscape."
  },
  {
    num: "04",
    title: "Cultural Journeys",
    cta: "Discover More",
    href: "/contact",
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1550642249-6e5605421172?q=80&w=2000&auto=format&fit=crop",
    desc: "Immersive community-based journeys that celebrate heritage and leave a lasting memory."
  },
  {
    num: "05",
    title: "Community-Led Moments",
    cta: "Learn More",
    href: "/contact",
    icon: UtensilsCrossed,
    image: "https://images.unsplash.com/photo-1694506374847-ced565472398?q=80&w=2000&auto=format&fit=crop",
    desc: "Travel moments that support local businesses, create work, and share value with host communities."
  },
  {
    num: "06",
    title: "Private Travel Care",
    cta: "Get a Quote",
    href: "/contact",
    icon: Car,
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000&auto=format&fit=crop",
    desc: "Smooth travel support across Nepal, from private road journeys to flight coordination where available."
  }
]

const consultingServices = [
  {
    step: "01",
    icon: LineChart,
    title: "Opening Guidance",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2000&auto=format&fit=crop",
    desc: "Working with owners from the beginning to shape a clear guest promise and a strong path to opening.",
  },
  {
    step: "02",
    icon: Activity,
    title: "Day-to-Day Hospitality Care",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop",
    desc: "Helping teams care for guests, homes, calendars, and service details with warmth and consistency.",
  },
  {
    step: "03",
    icon: Users,
    title: "Story And Brand Shaping",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop",
    desc: "Giving each property a memorable story, guest tone, and market presence rooted in local insight.",
  },
  {
    step: "04",
    icon: ShieldCheck,
    title: "Sustainable Development",
    image: "https://images.unsplash.com/photo-1550966841-3ee71448744b?q=80&w=1974&auto=format&fit=crop",
    desc: "Building environmental care, fair opportunity, and community value into every project.",
  },
]

export default function ServicesPage() {
  return (
    <div className="bg-background text-charcoal min-h-screen">
      
      {/* HERO SECTION - SIGNATURE PLANNING FLATLAY */}
      <section className="relative h-[80svh] w-full flex items-center justify-center pt-20 bg-charcoal overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2000&auto=format&fit=crop"
            alt="Salt Route Heritage Consulting"
            fill
            className="object-cover opacity-60 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl">
          <FadeUp>
            <p className="text-[10px] uppercase tracking-[0.6em] text-white/90 font-sans mb-8 font-light">Salt Route Group</p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-[8.5rem] text-white tracking-tight leading-none mb-10 font-normal uppercase">
              Consulting &<br/><span className="text-gold/80 italic">Experiences.</span>
            </h1>
            <div className="flex items-center justify-center gap-8 text-white/40">
                <span className="w-16 h-[1px] bg-white/20" />
                <p className="text-[9px] uppercase tracking-[0.5em] font-sans">Responsible Stays And Property Care</p>
                <span className="w-16 h-[1px] bg-white/20" />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* TRAVEL SERVICES - COMPACT GRID */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16">
            <FadeUp className="max-w-2xl space-y-6">
              <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 font-medium">Salt Route Experiences</p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-7xl text-charcoal tracking-wide leading-tight uppercase">
                Immersive,<br/>Responsible Travel.
              </h2>
            </FadeUp>
            <FadeUp delay={0.2} className="max-w-sm">
              <p className="font-sans text-[15px] text-charcoal/50 leading-relaxed font-light italic">
                &ldquo;We design journeys that connect travelers to the landscapes, cultures, and communities of Nepalâ€”with care, authenticity, and purpose.&rdquo;
              </p>
            </FadeUp>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 bg-charcoal/5 border border-charcoal/10">
            {guestServices.map((s, i) => (
              <FadeUp key={s.num} delay={i * 0.1} className="group relative bg-white border-charcoal/5 border-r border-b">
                <div className="flex flex-col h-full">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img 
                      src={s.image} 
                      alt={s.title} 
                      className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-charcoal/10 group-hover:bg-transparent transition-colors duration-700" />
                  </div>
                  
                  <div className="p-10 flex flex-col flex-grow justify-between gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">{s.num}</p>
                         <s.icon className="w-5 h-5 text-charcoal/20 group-hover:text-gold/60 transition-colors duration-500" strokeWidth={1} />
                      </div>
                      <h3 className="font-display text-2xl lg:text-3xl text-charcoal uppercase tracking-wide group-hover:text-gold transition-colors duration-500">
                        {s.title}
                      </h3>
                      <p className="text-[14px] text-charcoal/50 leading-relaxed font-light line-clamp-3">
                        {s.desc}
                      </p>
                    </div>
                    
                    <LuxuryLinkWithArrow href={s.href} className="text-[9px] uppercase tracking-[0.2em] font-bold">
                      {s.cta}
                    </LuxuryLinkWithArrow>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* SIGNATURE EXPERIENCE - VISUAL BREAK */}
      <section className="py-12 px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 bg-charcoal">
            <div className="p-12 md:p-20 flex flex-col justify-center space-y-10">
              <FadeUp>
                <p className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-medium">Signature Experience</p>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white tracking-wide uppercase leading-tight">
                  Private Courtyard<br/>Dining.
                </h2>
                <div className="w-12 h-[1px] bg-gold mt-10" />
              </FadeUp>
              <FadeUp delay={0.2} className="space-y-8">
                <p className="font-sans text-[16px] text-white/50 leading-relaxed font-light">
                  Our farm-to-table dining experiences are shaped around quiet settings, local ingredients, and the warmth of Nepali hospitality.
                </p>
                <div className="pt-6">
                   <LuxuryButton href="/contact" dark>Reserve Experience</LuxuryButton>
                </div>
              </FadeUp>
            </div>
            <div className="relative aspect-square lg:aspect-auto h-[500px] lg:h-auto">
              <RevealImage 
                src="/private_himalayan_dining_luxury_1777124309093.png"
                alt="Private Heritage Dining"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CONSULTING SERVICES - BOXY & ELITE */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center mb-20">
            <div className="lg:col-span-8 space-y-10">
              <FadeUp>
                <p className="text-[10px] uppercase tracking-[0.5em] text-charcoal/40 font-medium">Salt Route Consulting</p>
                <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-charcoal tracking-tight leading-[1] uppercase">
                  Growing Value<br/><span className="text-gold italic">Through Care</span> & Story.
                </h2>
              </FadeUp>
              <FadeUp delay={0.2} className="max-w-2xl">
                <p className="font-sans text-[17px] text-charcoal/60 leading-relaxed font-light">
                  From first idea to everyday hosting, SRC works alongside property owners to shape distinctive, responsible hospitality grounded in local insight and polished guest care.
                </p>
              </FadeUp>
            </div>
            <div className="lg:col-span-4 flex lg:justify-end">
               <LuxuryButton href="/for-owners">Partner With SRC</LuxuryButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-charcoal/10 border border-charcoal/10">
            {consultingServices.map((s, i) => (
              <FadeUp key={i} delay={i * 0.1} className="bg-white p-10 flex flex-col gap-8 group hover:bg-[#FBF9F4] transition-all duration-700">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img 
                    src={s.image} 
                    alt={s.title} 
                    className="w-full h-full object-cover grayscale-[0.6] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-charcoal/10 group-hover:bg-transparent transition-colors duration-700" />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">{s.step}</p>
                    <s.icon className="w-5 h-5 text-gold/60" strokeWidth={1} />
                  </div>
                  <h3 className="font-display text-2xl text-charcoal tracking-wide uppercase group-hover:text-gold transition-colors duration-500">
                    {s.title}
                  </h3>
                  <p className="font-sans text-[14px] text-charcoal/50 leading-relaxed font-light">{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CALL */}
      <section className="py-24 md:py-32 bg-[#FBF9F4] text-center px-6">
        <FadeUp className="max-w-4xl mx-auto space-y-12">
          <p className="text-[10px] uppercase tracking-[0.6em] text-charcoal/40 font-bold italic">The Journey Begins Here</p>
          <h2 className="font-display text-4xl md:text-6xl lg:text-[7rem] text-charcoal leading-none uppercase">Seamless Experience.</h2>
          <div className="pt-8">
            <LuxuryButton href="/properties">Browse Property Collection</LuxuryButton>
          </div>
        </FadeUp>
      </section>

    </div>
  )
}

