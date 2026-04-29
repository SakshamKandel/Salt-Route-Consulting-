"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { siteConfig } from "@/lib/site.config"

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
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
    body: "Each property chosen for its soul. Its setting, its story, and the warmth of its welcome.",
    cta: "Browse Collection",
    href: "/properties",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop",
  },
  {
    num: "02",
    title: "Personal Travel Planning",
    body: "Complete journeys shaped around Nepal's landscapes, cultures, and communities, with precision and care.",
    cta: "Plan Your Journey",
    href: "/contact",
    image: "https://images.unsplash.com/photo-1512813195386-6cf811ad3542?q=80&w=1200&auto=format&fit=crop",
  },
  {
    num: "03",
    title: "Nature Trails",
    body: "Low-impact outdoor experiences that connect travelers gently with Nepal's living landscape.",
    cta: "Enquire",
    href: "/contact",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    num: "04",
    title: "Cultural Journeys",
    body: "Immersive, community-rooted journeys celebrating Nepali heritage with honesty and depth.",
    cta: "Discover",
    href: "/contact",
    image: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    num: "05",
    title: "Community-Led Moments",
    body: "Travel moments designed to give back, supporting local businesses and sharing value with host communities.",
    cta: "Learn More",
    href: "/contact",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop",
  },
  {
    num: "06",
    title: "Private Travel Care",
    body: "Smooth, attentive movement across Nepal, from private road journeys to flight coordination.",
    cta: "Get a Quote",
    href: "/contact",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200&auto=format&fit=crop",
  },
]

const consultingServices = [
  {
    num: "01",
    title: "Opening Guidance",
    body: "Shaping a clear guest promise, a considered identity, and a confident path to opening day.",
  },
  {
    num: "02",
    title: "Day-to-Day Hospitality Care",
    body: "Supporting teams in caring for guests and homes with warmth, consistency, and quiet excellence.",
  },
  {
    num: "03",
    title: "Story & Brand Shaping",
    body: "Giving each property a memorable narrative and market presence grounded in local insight.",
  },
  {
    num: "04",
    title: "Sustainable Development",
    body: "Building environmental responsibility and lasting community value into every project.",
  },
]

export default function ServicesPage() {
  return (
    <div className="bg-[#FFFDF8] text-charcoal">

      {/* ── HERO ── */}
      <section className="relative h-[72vh] overflow-hidden bg-charcoal">
        <Image
          src="/luxury_himalayan_retreat_exterior_1777124225845.png"
          alt="Salt Route Services"
          fill
          className="object-cover opacity-55"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/65" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10"
        >
          <p className="text-[8px] uppercase tracking-[0.7em] text-white/35 mb-6">
            {siteConfig.brandName} · {siteConfig.region}
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-white leading-[0.95] tracking-wide uppercase">
            Consulting &<br />
            <em className="not-italic text-[#C9A96E]/85">Experiences</em>
          </h1>
          <div className="flex items-center gap-6 mt-8">
            <span className="w-10 h-px bg-white/15" />
            <p className="text-[8px] uppercase tracking-[0.45em] text-white/30">
              Responsible Stays · Property Care
            </p>
            <span className="w-10 h-px bg-white/15" />
          </div>
        </motion.div>
      </section>

      {/* ── OPENING LINE ── */}
      <section className="py-20 md:py-28 px-8 border-b border-charcoal/6">
        <FadeUp className="max-w-2xl mx-auto text-center space-y-5">
          <p className="font-display text-xl md:text-2xl lg:text-3xl text-charcoal/75 italic leading-[1.6]">
            &ldquo;Every journey we curate is a study in intention. Knowing a place deeply, and sharing it with rare generosity.&rdquo;
          </p>
          <div className="flex items-center justify-center gap-5 pt-2">
            <span className="w-6 h-px bg-[#C9A96E]/50" />
            <p className="text-[8px] uppercase tracking-[0.5em] text-[#C9A96E]/70">{siteConfig.name}</p>
            <span className="w-6 h-px bg-[#C9A96E]/50" />
          </div>
        </FadeUp>
      </section>

      {/* ── GUEST EXPERIENCES LABEL ── */}
      <div className="max-w-screen-xl mx-auto px-8 md:px-14 pt-16 pb-10">
        <FadeUp className="flex items-center gap-6">
          <p className="text-[8px] uppercase tracking-[0.5em] text-charcoal/30 whitespace-nowrap">Guest Experiences</p>
          <div className="flex-1 h-px bg-charcoal/8" />
        </FadeUp>
      </div>

      {/* ── SERVICE GRID ── */}
      <section className="max-w-screen-xl mx-auto px-8 md:px-14 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-charcoal/8 border border-charcoal/8">
          {guestServices.map((s, i) => (
            <FadeUp key={s.num} delay={i * 0.07}>
              <Link href={s.href} className="group flex flex-col bg-[#FFFDF8] hover:bg-white transition-colors duration-500 h-full">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    className="object-cover group-hover:scale-[1.04] transition-transform duration-1000"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* Number overlay */}
                  <span className="absolute top-4 left-5 font-display text-xs text-white/50 tracking-widest tabular-nums">
                    {s.num}
                  </span>
                </div>

                {/* Text */}
                <div className="p-7 flex flex-col flex-1 gap-5">
                  <h3 className="font-display text-xl text-charcoal tracking-wide uppercase leading-tight group-hover:text-[#C9A96E] transition-colors duration-500">
                    {s.title}
                  </h3>
                  <p className="text-[13px] text-charcoal/45 leading-relaxed font-light font-sans flex-1">
                    {s.body}
                  </p>
                  <span className="inline-flex items-center gap-2 text-[8px] uppercase tracking-[0.35em] text-charcoal/35 group-hover:text-[#C9A96E] transition-colors duration-500">
                    {s.cta}
                    <ArrowUpRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── QUOTE BREAK ── */}
      <section className="relative h-[50vh] overflow-hidden flex items-center justify-center">
        <Image
          src="/private_himalayan_dining_luxury_1777124309093.png"
          alt="A private dining moment"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/55" />
        <FadeUp className="relative z-10 text-center max-w-xl px-8 space-y-5">
          <span className="w-6 h-px bg-[#C9A96E]/60 block mx-auto" />
          <p className="font-display text-xl md:text-2xl lg:text-3xl text-white/90 italic leading-[1.6]">
            &ldquo;A private table in a courtyard. A guide who knows every name. A morning that asks nothing of you.&rdquo;
          </p>
          <p className="text-[8px] uppercase tracking-[0.45em] text-[#C9A96E]/60">The Salt Route Standard</p>
        </FadeUp>
      </section>

      {/* ── CONSULTING LABEL ── */}
      <div className="max-w-screen-xl mx-auto px-8 md:px-14 pt-16 pb-10">
        <FadeUp className="flex items-center gap-6">
          <p className="text-[8px] uppercase tracking-[0.5em] text-charcoal/30 whitespace-nowrap">Property Consulting</p>
          <div className="flex-1 h-px bg-charcoal/8" />
        </FadeUp>
      </div>

      {/* ── CONSULTING SECTION ── */}
      <section className="max-w-screen-xl mx-auto px-8 md:px-14 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-14 lg:gap-20 items-start">

          {/* Left: intro */}
          <FadeUp className="space-y-7 lg:sticky lg:top-28">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal leading-[1.1] tracking-wide uppercase">
              Growing Value<br />
              <em className="not-italic text-[#C9A96E]">Through Care</em><br />
              &amp; Story.
            </h2>
            <p className="font-sans text-[13px] text-charcoal/45 leading-[1.9] font-light max-w-xs">
              From first idea to everyday hosting, SRC works alongside owners to shape distinctive, responsible hospitality grounded in local insight.
            </p>
            <Link
              href="/for-owners"
              className="inline-flex items-center gap-3 border border-charcoal/15 hover:border-[#C9A96E] text-[8px] uppercase tracking-[0.4em] text-charcoal/50 hover:text-[#C9A96E] px-7 py-3.5 transition-all duration-500 group"
            >
              Partner With SRC
              <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </Link>
          </FadeUp>

          {/* Right: numbered list */}
          <div className="divide-y divide-charcoal/6">
            {consultingServices.map((s, i) => (
              <FadeUp key={s.num} delay={i * 0.08} className="py-8 flex gap-7 group">
                <span className="font-display text-xs text-[#C9A96E]/40 tabular-nums shrink-0 mt-0.5">{s.num}</span>
                <div className="space-y-2.5">
                  <h3 className="font-display text-xl text-charcoal tracking-wide uppercase leading-tight group-hover:text-[#C9A96E] transition-colors duration-500">
                    {s.title}
                  </h3>
                  <p className="font-sans text-[13px] text-charcoal/40 leading-relaxed font-light">{s.body}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative overflow-hidden h-[55vh] flex items-end">
        <Image
          src="/Sunshine Villa Main.png"
          alt="A Salt Route property"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

        <div className="relative z-10 px-10 md:px-20 pb-14 md:pb-20 space-y-7 max-w-lg">
          <FadeUp>
            <p className="text-[8px] uppercase tracking-[0.5em] text-white/25">Begin Your Journey</p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h2 className="font-display text-4xl md:text-5xl text-white leading-[0.95] tracking-wide uppercase">
              Find Your Place<br />
              <em className="not-italic text-[#C9A96E]/90">in Nepal.</em>
            </h2>
          </FadeUp>
          <FadeUp delay={0.2} className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/properties"
              className="bg-[#C9A96E] hover:bg-[#DBCBAA] text-[#1B3A5C] text-[8px] uppercase tracking-[0.4em] font-medium px-8 py-3.5 transition-all duration-500"
            >
              View Stays
            </Link>
            <Link
              href="/contact"
              className="border border-white/25 hover:border-white text-white text-[8px] uppercase tracking-[0.4em] px-8 py-3.5 transition-all duration-500 hover:bg-white/5 inline-flex items-center gap-2"
            >
              Contact Concierge <ArrowUpRight className="h-3 w-3" />
            </Link>
          </FadeUp>
        </div>
      </section>

    </div>
  )
}
