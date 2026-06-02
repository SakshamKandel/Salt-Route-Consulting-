"use client"

import { siteConfig } from "@/lib/site.config"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { LuxuryButton } from "@/components/ui/luxury-button"
import { ShieldCheck, Target, Award, Users, Map, Compass } from "lucide-react"
import { FacebookAvatar } from "@/components/public/FacebookAvatar"

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
    desc: "A commitment to world-class service standards, from the properties we select to the guest experiences we create.",
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
            src="/luxury_himalayan_retreat_exterior_1777124225845.png"
            alt="A Salt Route property at altitude"
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
                src="/luxury_nepalese_interior_details_1777124245155.png"
                alt="Heritage interior craftsmanship"
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
                  Welcome to {siteConfig.brandName}, where purpose-driven business meets bold ambition. We are a {siteConfig.region}-based collective building pathways from local innovation to global opportunity, through transformative consulting, meaningful travel experiences, and sustainable development.
                </p>
                <p className="font-sans text-[16px] text-charcoal/60 leading-relaxed font-light">
                  At our core, we believe in doing business that uplifts people, protects the planet, and redefines what&apos;s possible from Nepal. We are committed to building ventures that reflect our values and deliver impact with integrity.
                </p>
                
                <div className="grid grid-cols-3 gap-12 pt-12 border-t border-charcoal/10">
                  <div className="space-y-1">
                    <p className="font-display text-4xl text-charcoal">03+</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-charcoal/50 font-bold">Tailored Properties</p>
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
                   src="/mastery_details.png"
                   alt="Mastery in detail"
                   className="aspect-[16/9] border border-charcoal/5"
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
                    We believe diversity is strength. We strive to create inclusive spaces that value every voice.
                  </p>
                </div>
              </FadeUp>

              {/* Module 03: Sustainability */}
              <FadeUp delay={0.3} className="relative">

                <div className="space-y-6 pt-12">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">The Planet</p>
                  <h3 className="font-display text-4xl lg:text-5xl text-charcoal tracking-wide uppercase leading-tight">
                    Sustainability.
                  </h3>
                  <div className="w-12 h-[1px] bg-charcoal/20" />
                  <p className="font-sans text-[15px] text-charcoal/60 leading-relaxed font-light max-w-sm">
                    Environmental stewardship guides our strategies, decisions, and long-term goals.
                  </p>
                </div>
              </FadeUp>

              {/* Module 04: Community */}
              <FadeUp delay={0.4} className="relative">

                <div className="space-y-6 pt-12">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">The Community</p>
                  <h3 className="font-display text-4xl lg:text-5xl text-charcoal tracking-wide uppercase leading-tight">
                    Community<br/>Empowerment.
                  </h3>
                  <div className="w-12 h-[1px] bg-charcoal/20" />
                  <p className="font-sans text-[15px] text-charcoal/60 leading-relaxed font-light max-w-sm">
                    We prioritize local employment, uplift communities, and reinvest in the ecosystems that support us.
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
                  {siteConfig.name} brings together hospitality thinkers, travel makers, property partners, and local teams who believe that every stay should feel personal, responsible, and rooted in {siteConfig.region}.
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
                    <p className="text-sm uppercase tracking-[0.2em] font-bold text-charcoal/80">Growing Family of Tailored Stays</p>
                  </div>
                </div>
              </FadeUp>
            </div>
            <div className="relative">
              <RevealImage
                src="/luxury_boutique_office_team.png"
                alt="The Salt Route Group team"
                className="aspect-square border border-charcoal/10"
              />
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-gold/10 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* COUNSEL — long-form, alternating editorial spreads */}
      {/*
        Hidden for now (kept in code, not removed) — re-enable by removing the
        `hidden` class below.
        Placeholder advisors. Replace each `photo` with a real headshot before
        going live (using stock photos for named advisors is misleading).
        Bios + quotes are placeholders too; swap with what each person tells you
        about themselves, in their words.
      */}
      <section id="advisors" className="hidden py-24 md:py-32 bg-white border-t border-charcoal/8">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          {/* Section opener — short, no marketing chrome */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-20 md:mb-28">
            <FadeUp className="lg:col-span-5 space-y-5">
              <p className="text-sm uppercase tracking-[0.4em] text-charcoal/50 font-medium">Counsel</p>
              <h2 className="font-display text-charcoal tracking-wide leading-[1.04] uppercase" style={{ fontSize: "clamp(2.25rem, 5vw, 4.75rem)" }}>
                Four people<br />we lean on.
              </h2>
            </FadeUp>
            <FadeUp delay={0.1} className="lg:col-span-6 lg:col-start-7 space-y-5 lg:pt-3">
              <p className="font-sans text-base md:text-lg text-charcoal/65 leading-[1.85] font-light">
                When we are unsure, these are the four phone calls we make. Some have spent their careers inside hotels; one has spent hers writing about the people who carve their door frames; one moves capital quietly into buildings that should not be lost.
              </p>
              <p className="font-sans text-base md:text-lg text-charcoal/65 leading-[1.85] font-light">
                None of them are on payroll. They are friends of the practice — read what they have written, then decide whether they sound like the kind of people you would want behind a property of yours.
              </p>
            </FadeUp>
          </div>

          {/* Profile spreads */}
          <div className="space-y-24 md:space-y-32">
            {[
              {
                name: "Ram Bahadur",
                role: "Hospitality",
                location: "Patan, Lalitpur",
                bio: [
                  "Founding GM at a heritage Kathmandu hotel from 1998 to 2006, when the city was barely on the international map. Moved to Bangkok for a decade after that to run F&B for a regional group, then quietly came home in 2018.",
                  "Doesn't take on more than four properties at once. We have been one of them since the first season. Answers calls before 7am and rarely after 9.",
                ],
                quote: "A property only sells what it actually is. Our job is to make sure that's enough.",
              },
              {
                name: "Ram Bahadur",
                role: "Cultural Heritage",
                location: "Bhaktapur",
                bio: [
                  "Curator at the Kathmandu Triennale in 2017; has spent the years since tracking the disappearing repoussé metalwork families of Patan — the ones who hammer copper into Buddhas one breath at a time.",
                  "Writes a quiet column for Nepali Times and is the reason every Salt Route property has at least one piece of object-made-by-someone-they-know. Prefers to be paid in tea.",
                ],
                quote: "If a craft loses its context, you have kept the object and lost the meaning.",
              },
              {
                name: "Ram Bahadur",
                role: "Sustainable Tourism",
                location: "Pokhara · Cornwall",
                bio: [
                  "South Asia lead for a global responsible-travel collective from 2019 to 2023. Before that, eight years at a small boutique operator in the UK they left when it sold to a private-equity house they didn't trust.",
                  "Splits time between Pokhara and a small cottage in Cornwall, two children, one fishing boat. Talks slowly, edits ruthlessly. Has no interest in growing anything for its own sake.",
                ],
                quote: "Sustainability is local first. The rest is marketing.",
              },
              {
                name: "Ram Bahadur",
                role: "Property Investment",
                location: "Kathmandu",
                bio: [
                  "Eight years on a real-estate desk in Singapore before moving home in 2020 to do the opposite of what that job had trained for. Now runs a small fund focused on heritage retrofits in Nepal and Bhutan — the kind of buildings most spreadsheets would walk past.",
                  "Reads detective fiction in three languages and has a strong opinion about lime mortar. We bring every property to them before we sign.",
                ],
                quote: "Buy slow buildings. They outlast every cycle.",
              },
            ].map((advisor, i) => {
              const reverse = i % 2 === 1
              return (
                <FadeUp key={i} delay={0.04}>
                  <article className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start ${reverse ? "lg:[direction:rtl]" : ""}`}>
                    {/* Portrait placeholder */}
                    <div className="lg:col-span-5 lg:[direction:ltr]">
                      <FacebookAvatar
                        className="aspect-[4/5] border border-charcoal/8"
                        ariaLabel={`Profile photo placeholder for ${advisor.name}`}
                      />
                      <div className="mt-3 flex items-baseline justify-between">
                        <p className="text-xs uppercase tracking-[0.25em] text-charcoal/40 font-medium">
                          {advisor.location}
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-charcoal/30 font-medium">
                          0{i + 1}
                        </p>
                      </div>
                    </div>

                    {/* Text */}
                    <div className="lg:col-span-7 lg:[direction:ltr] space-y-7">
                      <header className="space-y-2">
                        <h3 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal tracking-wide leading-[1.05]">
                          {advisor.name}
                        </h3>
                        <p className="text-sm uppercase tracking-[0.3em] text-charcoal/50 font-medium">
                          {advisor.role}
                        </p>
                      </header>

                      {advisor.bio.map((para, pi) => (
                        <p key={pi} className="font-sans text-base md:text-lg text-charcoal/70 leading-[1.85] font-light">
                          {para}
                        </p>
                      ))}

                      <blockquote className="border-l border-gold/55 pl-5 md:pl-7 py-1 mt-2 max-w-xl">
                        <p className="font-display italic text-xl md:text-2xl text-charcoal/85 leading-[1.4]">
                          &ldquo;{advisor.quote}&rdquo;
                        </p>
                      </blockquote>
                    </div>
                  </article>
                </FadeUp>
              )
            })}
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

