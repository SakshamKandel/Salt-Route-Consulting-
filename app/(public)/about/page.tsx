"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { LuxuryButton } from "@/components/ui/luxury-button"
import { ShieldCheck, Target, Award, Users, Map, Compass } from "lucide-react"

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

const values = [
  {
    icon: Award,
    title: "Heritage Vetting",
    desc: "We honor the architectural and cultural lineage of every space we manage, ensuring each property tells a story rooted in Nepal's rich tradition.",
  },
  {
    icon: ShieldCheck,
    title: "Absolute Excellence",
    desc: "A commitment to world-class service standards â€” from the properties we select to the guest experiences we create.",
  },
  {
    icon: Target,
    title: "Thoughtful Stewardship",
    desc: "Preserving the untamed beauty of Nepal's landscapes through conscious, responsible travel and hospitality management.",
  },
]

export default function AboutPage() {
  return (
    <div className="bg-background text-charcoal min-h-screen">
      
      {/* HERO SECTION - SIGNATURE EXTERIOR */}
      <section className="relative h-[85svh] w-full flex items-center justify-center overflow-hidden bg-charcoal">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2000&auto=format&fit=crop"
            alt="Salt Route Himalayan Heritage"
            fill
            className="object-cover opacity-70 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/80" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl">
          <FadeUp>
            <p className="text-[10px] md:text-[11px] uppercase tracking-[0.6em] text-white/90 font-sans mb-8 font-light">
              Connecting Local Roots
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-[9rem] text-white tracking-tight leading-[0.95] mb-12 font-normal uppercase">
              To Global<br/><span className="text-gold/80 italic">Routes.</span>
            </h1>
            <div className="flex items-center justify-center gap-8 text-white/40">
                <span className="w-16 h-[1px] bg-white/20" />
                <p className="text-[9px] uppercase tracking-[0.5em] font-sans">Purpose-Driven Ambition</p>
                <span className="w-16 h-[1px] bg-white/20" />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* STORY SECTION - SIGNATURE INTERIOR */}
      <section className="py-16 md:py-24 bg-white border-b border-charcoal/5 overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            {/* Image side */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <RevealImage 
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop"
                alt="Heritage Interior Craftsmanship"
                className="aspect-[4/5] border border-charcoal/10"
              />
            </div>

            {/* Text side */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-12">
              <FadeUp>
                <div className="space-y-6">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 font-medium">Our Mission</p>
                  <h2 className="font-display text-4xl md:text-5xl lg:text-[4.5rem] text-charcoal tracking-wide leading-[1.05] uppercase">
                    Purpose meets<br/>Bold Ambition.
                  </h2>
                </div>
              </FadeUp>

              <FadeUp delay={0.2} className="space-y-8">
                <p className="font-sans text-[17px] text-charcoal/60 leading-relaxed font-light first-letter:text-6xl first-letter:font-display first-letter:float-left first-letter:mr-4 first-letter:mt-1 first-letter:text-gold">
                  Welcome to Salt Route Group, where purpose-driven business meets bold ambition. We are a Nepal-based collective building pathways from local innovation to global opportunityâ€”through transformative consulting, meaningful travel experiences, and sustainable development.
                </p>
                <p className="font-sans text-[16px] text-charcoal/60 leading-relaxed font-light">
                  At our core, we believe in doing business that uplifts people, protects the planet, and redefines what&apos;s possible from Nepal. We are committed to building ventures that reflect our values and deliver impact with integrity.
                </p>
                
                <div className="grid grid-cols-3 gap-12 pt-12 border-t border-charcoal/10">
                  <div className="space-y-1">
                    <p className="font-display text-4xl text-charcoal">03+</p>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/40 font-bold">Boutique Properties</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-display text-4xl text-charcoal">80%</p>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/40 font-bold">Local Talent Goal</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-display text-4xl text-charcoal">2030</p>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/40 font-bold">Net-Zero Aim</p>
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* THE ETHOS - LUXURY BOUTIQUE REWORK */}
      <section className="py-20 md:py-32 bg-[#FBF9F4] overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            
            {/* Module 01: Heritage */}
            <div className="lg:col-span-5 space-y-12">
              <FadeUp className="relative">
                
                <div className="space-y-6 pt-12">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">The Foundation</p>
                  <h3 className="font-display text-4xl lg:text-5xl text-charcoal tracking-wide uppercase leading-tight">
                    Ethical<br/>Practices.
                  </h3>
                  <div className="w-12 h-[1px] bg-charcoal/20" />
                  <p className="font-sans text-[15px] text-charcoal/60 leading-relaxed font-light max-w-sm">
                    We operate with honesty, fairness, and a deep respect for human dignity in everything we do.
                  </p>
                </div>
              </FadeUp>
              
              {/* Image break within the grid */}
              <FadeUp delay={0.2} className="pt-12">
                 <RevealImage 
                   src="https://images.unsplash.com/photo-1550642249-6e5605421172?q=80&w=2000&auto=format&fit=crop" 
                   alt="Heritage Detail" 
                   className="aspect-[16/9] border border-charcoal/5 grayscale-[0.4]"
                 />
              </FadeUp>
            </div>

            {/* Middle Spacer / Divider */}
            <div className="hidden lg:block lg:col-span-1 h-full w-[1px] bg-charcoal/[0.08] mx-auto" />

            {/* Right Side: Modules 02 & 03 */}
            <div className="lg:col-span-6 space-y-32 lg:pt-24">
              {/* Module 02: Excellence */}
              <FadeUp delay={0.1} className="relative">
                
                <div className="space-y-6 pt-12">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">The People</p>
                  <h3 className="font-display text-4xl lg:text-5xl text-charcoal tracking-wide uppercase leading-tight">
                    Diversity &<br/>Inclusion.
                  </h3>
                  <div className="w-12 h-[1px] bg-charcoal/20" />
                  <p className="font-sans text-[15px] text-charcoal/60 leading-relaxed font-light max-w-sm">
                    We believe diversity is strengthâ€”and we strive to create inclusive spaces that value every voice.
                  </p>
                </div>
              </FadeUp>

              {/* Module 03: Stewardship */}
              <FadeUp delay={0.3} className="relative">
                
                <div className="space-y-6 pt-12">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">The Impact</p>
                  <h3 className="font-display text-4xl lg:text-5xl text-charcoal tracking-wide uppercase leading-tight">
                    Sustainability &<br/>Community.
                  </h3>
                  <div className="w-12 h-[1px] bg-charcoal/20" />
                  <p className="font-sans text-[15px] text-charcoal/60 leading-relaxed font-light max-w-sm">
                    Environmental stewardship guides our strategies. We prioritize local employment, uplift communities, and reinvest in the ecosystems that support us.
                  </p>
                </div>
              </FadeUp>
            </div>

          </div>
        </div>
      </section>

      {/* THE TEAM / MASTERS - NEW SECTION */}
      <section className="py-20 md:py-28 bg-white overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <FadeUp>
                <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 font-medium">The People</p>
                <h2 className="font-display text-4xl md:text-6xl text-charcoal tracking-wide uppercase">
                  The People Behind<br/>The Route.
                </h2>
              </FadeUp>
              <FadeUp delay={0.2} className="space-y-8">
                <p className="font-sans text-[16px] text-charcoal/60 leading-relaxed font-light">
                  Salt Route brings together hospitality thinkers, travel makers, property partners, and local teams who believe that every stay should feel personal, responsible, and rooted in Nepal.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-6 pb-6 border-b border-charcoal/5">
                    <Users className="w-5 h-5 text-gold/60" strokeWidth={1} />
                    <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-charcoal/80">Local Talent And Makers Engaged</p>
                  </div>
                  <div className="flex items-center gap-6 pb-6 border-b border-charcoal/5">
                    <Compass className="w-5 h-5 text-gold/60" strokeWidth={1} />
                    <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-charcoal/80">Property Care Across Nepal</p>
                  </div>
                  <div className="flex items-center gap-6 pb-6 border-b border-charcoal/5">
                    <Map className="w-5 h-5 text-gold/60" strokeWidth={1} />
                    <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-charcoal/80">Growing Family of Boutique Stays</p>
                  </div>
                </div>
              </FadeUp>
            </div>
            <div className="relative">
              <RevealImage 
                src="https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=2000&auto=format&fit=crop"
                alt="Cinematic Himalayan Landscape"
                className="aspect-square border border-charcoal/10 grayscale-[0.2]"
              />
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-gold/10 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* FINAL QUOTE */}
      <section className="py-24 md:py-32 bg-[#FBF9F4] text-center px-6">
        <FadeUp className="max-w-4xl mx-auto space-y-12">
          <div className="w-16 h-[1px] bg-gold mx-auto" />
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-charcoal leading-tight uppercase font-normal italic">
            &ldquo;We view sustainability not as a checklist, but as a responsibility to create long-term value for people, places, and the planet.&rdquo;
          </h2>
          <div className="pt-8">
            <LuxuryButton href="/contact">Start a Conversation</LuxuryButton>
          </div>
        </FadeUp>
      </section>

    </div>
  )
}

