"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, BarChart3, Target, Globe } from "lucide-react"

export type ForOwnersPortfolioItem = {
  slug: string
  name: string
  location: string
  desc: string
  image: string | null
}

const services = [
  {
    num: "01",
    title: "Strategic Advisory",
    desc: "Market analysis, concept development, business planning, and go-to-market strategy tailored to Nepal's hospitality landscape.",
  },
  {
    num: "02",
    title: "Operational Setup",
    desc: "Staff recruitment and training, SOP development, financial modeling, and comprehensive guest experience frameworks.",
  },
  {
    num: "03",
    title: "Brand Development",
    desc: "Identity creation, narrative building, customer touchpoint design, and a complete marketing roadmap for your property.",
  },
  {
    num: "04",
    title: "Sustainability Integration",
    desc: "ESG principles, waste and energy efficiency strategies, local sourcing programs, and regenerative tourism models.",
  },
]

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

function RevealImage({ src, alt, className = "" }: { src: string, alt: string, className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        initial={{ scale: 1.15 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-full"
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
        />
      </motion.div>
    </div>
  )
}

function ElegantArrow({ className = "" }: { className?: string }) {
  return (
    <ArrowRight className={className} strokeWidth={1} />
  )
}

export default function ForOwnersClient({ portfolio }: { portfolio: ForOwnersPortfolioItem[] }) {
  const containerRef = useRef(null)

  return (
    <div className="bg-background relative" ref={containerRef}>

      {/* ─── QUIET LUXURY EXECUTIVE HERO ─── */}
      <section className="relative h-[85vh] w-full flex flex-col justify-between pt-20 bg-[#FAFAFA]">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
            alt="Salt Route Consulting Executive"
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/90" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[10px] uppercase tracking-[0.6em] text-charcoal/60 font-sans mb-8 font-medium">Partnership & Advisory</p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-[7.5rem] text-charcoal tracking-wide leading-none mb-10 font-normal">
              Empowering Excellence.
            </h1>
            <div className="w-16 h-[1px] bg-charcoal/20 mx-auto" />
          </motion.div>
        </div>

        <div className="relative z-20 w-full max-w-screen-2xl mx-auto px-6 md:px-12 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white/80 backdrop-blur-xl border border-charcoal/10 flex flex-col md:flex-row items-stretch"
          >
            <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-charcoal/10 group cursor-pointer hover:bg-white transition-colors text-center md:text-left">
              <div className="flex items-start gap-4 justify-center md:justify-start">
                <Target className="w-5 h-5 text-charcoal/30 group-hover:text-gold transition-colors mt-1" strokeWidth={1.5} />
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/40 mb-1 font-semibold">Strategic Services</p>
                  <p className="font-display text-2xl text-charcoal tracking-wide">Brand & Identity</p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-charcoal/10 group cursor-pointer hover:bg-white transition-colors text-center md:text-left">
              <div className="flex items-start gap-4 justify-center md:justify-start">
                <BarChart3 className="w-5 h-5 text-charcoal/30 group-hover:text-gold transition-colors mt-1" strokeWidth={1.5} />
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/40 mb-1 font-semibold">Performance</p>
                  <p className="font-display text-2xl text-charcoal tracking-wide">ROI Optimization</p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-8 group cursor-pointer hover:bg-white transition-colors text-center md:text-left">
              <div className="flex items-start gap-4 justify-center md:justify-start">
                <Globe className="w-5 h-5 text-charcoal/30 group-hover:text-gold transition-colors mt-1" strokeWidth={1.5} />
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/40 mb-1 font-semibold">Portfolio</p>
                  <p className="font-display text-2xl text-charcoal tracking-wide">Market Presence</p>
                </div>
              </div>
            </div>

            <Link
              href="/contact"
              className="bg-charcoal text-white px-12 py-6 md:py-0 text-[10px] uppercase tracking-[0.3em] font-sans hover:bg-charcoal/90 transition-all duration-700 flex items-center justify-center min-w-[200px]"
            >
              Request Advisory
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── ABOUT SRC ─── */}
      <section className="py-32 md:py-48 bg-white relative">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="hidden lg:block relative">
             <div className="absolute -inset-4 bg-charcoal/5 -z-10" />
            <RevealImage
              src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop"
              alt="Salt Route Consulting"
              className="aspect-[4/5] w-full"
            />
          </div>

          <div className="max-w-xl">
            <FadeUp>
              <h2 className="text-[10px] uppercase tracking-[0.4em] font-sans text-charcoal/40 mb-6 font-medium">Partnership Philosophy</h2>
              <h3 className="font-display text-4xl md:text-5xl text-charcoal leading-[1.2] mb-10 tracking-wide">Elevating The Asset.</h3>
              <p className="font-sans text-lg text-charcoal/60 leading-relaxed mb-10 font-light">
                Salt Route Consulting (SRC) is the hospitality and development consulting arm of Salt Route Group. We work with hospitality entrepreneurs, investors, and property owners across Nepal to bring ambitious ideas to life — grounded in local context, elevated by global best practices.
              </p>
              <div className="w-16 h-[1px] bg-charcoal/10 mb-12" />
              <div className="grid grid-cols-3 gap-12 border-t border-charcoal/5 pt-12">
                {[[`${portfolio.length}+`, "Properties"], ["5+", "Partners"], ["2026", "Founded"]].map(([v, l]) => (
                  <div key={l}>
                    <p className="font-display text-3xl md:text-4xl text-charcoal mb-3">{v}</p>
                    <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-charcoal/40 font-semibold">{l}</p>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ─── OUR SERVICES GRID ─── */}
      <section className="py-32 md:py-48 bg-[#FAFAFA] relative border-y border-charcoal/5">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <FadeUp className="mb-24 text-center">
            <h2 className="text-[10px] uppercase tracking-[0.4em] font-sans text-charcoal/40 mb-6 font-medium">Strategic Solutions</h2>
            <h3 className="font-display text-4xl md:text-5xl text-charcoal tracking-wide">Holistic Hospitality.</h3>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20">
            {services.map((s, i) => (
              <FadeUp key={s.num} delay={i * 0.1}>
                <div className="group border-t border-charcoal/10 pt-10 hover:border-charcoal/30 transition-all duration-700">
                  <span className="font-sans text-[10px] tracking-[0.2em] text-charcoal/30 mb-6 block font-semibold group-hover:text-gold/80 transition-colors">N° {s.num}</span>
                  <h4 className="font-display text-3xl text-charcoal mb-6 tracking-wide">{s.title}</h4>
                  <p className="font-sans text-base text-charcoal/60 leading-relaxed font-light">{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PORTFOLIO ─── */}
      <section id="portfolio" className="py-32 md:py-48 bg-white relative">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          <FadeUp className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-[0.4em] font-sans text-charcoal/40 mb-6 font-medium">Global Presence</p>
              <h3 className="font-display text-4xl md:text-5xl text-charcoal tracking-wide">Managed Portfolio.</h3>
            </div>
            <Link href="/properties" className="group flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-charcoal/60 hover:text-charcoal transition-all">
              <span>Our Full Collection</span>
              <ElegantArrow className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-500" />
            </Link>
          </FadeUp>

          {portfolio.length === 0 ? (
            <FadeUp className="border border-charcoal/10 bg-[#FAFAFA] px-8 py-32 text-center">
              <p className="font-display text-3xl text-charcoal/40 mb-6 tracking-wide">
                Portfolio Coming Soon
              </p>
              <p className="font-sans text-charcoal/50 font-light max-w-xl mx-auto text-lg">
                Our managed residences will appear here as they are listed. Begin a partnership to add your property to the collection.
              </p>
            </FadeUp>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-24">
              {portfolio.map((prop, idx) => {
                const formattedIdx = (idx + 1).toString().padStart(2, '0');
                return (
                  <div key={prop.slug} className="flex flex-col">
                    <Link href={`/properties/${prop.slug}`} className="group block h-full">
                      {prop.image ? (
                        <RevealImage src={prop.image} alt={prop.name} className="aspect-[4/3] w-full mb-8 bg-charcoal/5" />
                      ) : (
                        <div className="aspect-[4/3] w-full mb-8 bg-[#FAFAFA] flex items-center justify-center border border-charcoal/5">
                          <p className="text-[9px] uppercase tracking-[0.3em] text-charcoal/30 font-semibold">No Image</p>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-[10px] font-sans text-charcoal/40">N° {formattedIdx}</span>
                            <span className="w-8 h-[1px] bg-charcoal/20" />
                            <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/50 font-semibold">{prop.location}</p>
                        </div>
                        <h4 className="font-display text-3xl md:text-4xl text-charcoal tracking-wide mb-6 group-hover:text-gold transition-colors duration-700">{prop.name}</h4>
                        <p className="font-sans text-base text-charcoal/60 leading-relaxed font-light">{prop.desc}</p>
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─── CONTACT SECTION ─── */}
      <section className="py-32 md:py-48 bg-[#FAFAFA] text-center px-6 relative border-t border-charcoal/5">
        <div className="max-w-3xl mx-auto relative z-20">
          <FadeUp>
            <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 mb-6 font-medium">Strategic Inquiries</p>
            <h2 className="font-display text-4xl md:text-5xl text-charcoal mb-10 tracking-wide">
              Begin Your Partnership.
            </h2>
            <div className="w-16 h-[1px] bg-charcoal/10 mx-auto mb-10" />
            <p className="font-sans text-lg text-charcoal/60 font-light mb-12 leading-relaxed max-w-xl mx-auto">
              Our specialists are ready to discuss your project and provide a comprehensive strategy for growth and excellence.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link href="/contact" className="bg-charcoal text-white px-12 py-5 text-[10px] uppercase tracking-[0.3em] font-sans hover:bg-charcoal/90 transition-all duration-700">
                Book Consultation
              </Link>
              <a href="mailto:partners@saltroutegroup.com" className="border border-charcoal/20 text-charcoal px-12 py-5 text-[10px] uppercase tracking-[0.3em] font-sans hover:bg-charcoal hover:text-white transition-all duration-700">
                Email Partnership Team
              </a>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  )
}
