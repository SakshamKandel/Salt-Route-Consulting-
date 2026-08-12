"use client"

import { siteConfig } from "@/lib/site.config"
import Image from "next/image"
import Link from "next/link"
import { Reveal, CurtainImage, KenBurns } from "@/components/public/motion"

// Authentic Nepali imagery (Unsplash) — replaces the generic stock PNGs.
// Hero: prayer flags against the Annapurna range.
// Mission: Kathmandu Valley heritage architecture (verified in journal.ts).
// Ethos: Newari tiered temple at Basantapur Durbar Square.
// People: Nepali Tamang woman in traditional attire, Patan Darbar Square.
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1751931628616-a359606b318c?q=80&w=2400&auto=format&fit=crop"
const MISSION_IMAGE =
  "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1600&auto=format&fit=crop"
const ETHOS_IMAGE =
  "https://images.unsplash.com/photo-1748760036656-964ac32eefb4?q=80&w=1600&auto=format&fit=crop"
const PEOPLE_IMAGE =
  "https://images.unsplash.com/photo-1762175048102-333cde165da6?q=80&w=1600&auto=format&fit=crop"

const ethos = [
  {
    eyebrow: "The Foundation",
    title: "Ethical Practices.",
    desc: "We operate with honesty, fairness, and a deep respect for human dignity in everything we do.",
  },
  {
    eyebrow: "The People",
    title: "Diversity & Inclusion.",
    desc: "We believe diversity is strength. We strive to create inclusive spaces that value every voice.",
  },
  {
    eyebrow: "The Planet",
    title: "Sustainability.",
    desc: "Environmental stewardship guides our strategies, decisions, and long-term goals.",
  },
  {
    eyebrow: "The Community",
    title: "Community Empowerment.",
    desc: "We prioritize local employment, uplift communities, and reinvest in the ecosystems that support us.",
  },
]

const peopleRows = [
  "Local Talent And Makers Engaged",
  "Property Care Across Nepal",
  "Growing Family of Tailored Stays",
]

interface Props {
  propertyCount: number
}

export default function AboutPageClient({ propertyCount }: Props) {
  const propertyCountDisplay = propertyCount < 10 ? `0${propertyCount}` : String(propertyCount)

  const stats = [
    { value: `${propertyCountDisplay}+`, label: "Tailored Properties", offset: "" },
    { value: "80%", label: "Local Talent Goal", offset: "md:col-start-5" },
    { value: "2030", label: "Net-Zero Aim", offset: "md:col-start-9" },
  ]

  return (
    <div className="bg-background text-navy min-h-screen">

      {/* HERO — one display moment, slow Ken Burns zoom */}
      <section className="relative h-[92svh] w-full flex items-center justify-center overflow-hidden bg-navy">
        <div className="absolute inset-0 z-0">
          <KenBurns className="h-full w-full">
            <Image
              src={HERO_IMAGE}
              alt="Prayer flags against the Annapurna range, Nepal"
              fill
              className="object-cover opacity-70"
              priority
            />
          </KenBurns>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/70" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-6xl">
          <Reveal>
            <p className="type-eyebrow text-white/80! mb-8">Connecting Local Roots</p>
            <h1 className="font-script text-white! mb-4 md:mb-6 leading-[1.02] tracking-[-0.045em] pb-2" style={{ fontSize: "clamp(3.5rem, 8vw, 8rem)" }}>
              To Global<br /><span className="italic text-gold/85">Routes.</span>
            </h1>
            <div className="flex items-center justify-center gap-8">
              <span className="w-16 h-px bg-white/20" />
              <p className="type-caption text-white/60!">Purpose-Driven Ambition</p>
              <span className="w-16 h-px bg-white/20" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* MISSION — editorial split with drop-cap */}
      <section className="py-10 md:py-16 bg-white border-b border-navy/5 overflow-hidden">
        <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-x-24 items-center">
            {/* Image side */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <CurtainImage className="aspect-[4/5]">
                <Image
                  src={MISSION_IMAGE}
                  alt="Kathmandu Valley heritage architecture"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </CurtainImage>
            </div>

            {/* Text side */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
              <Reveal>
                <div className="space-y-6">
                  <p className="type-eyebrow">Our Mission</p>
                  <h2 className="type-h2">
                    Purpose meets<br />Bold Ambition.
                  </h2>
                </div>
              </Reveal>

              <Reveal delay={0.15} className="space-y-8 max-w-2xl">
                <p className="type-body first-letter:text-6xl first-letter:font-display first-letter:float-left first-letter:mr-4 first-letter:mt-1 first-letter:text-gold">
                  Welcome to {siteConfig.brandName}, where purpose-driven business meets bold ambition. We are a {siteConfig.region}-based collective building pathways from local innovation to global opportunity, through transformative consulting, meaningful travel experiences, and sustainable development.
                </p>
                <p className="type-body">
                  At our core, we believe in doing business that uplifts people, protects the planet, and redefines what&apos;s possible from Nepal. We are committed to building ventures that reflect our values and deliver impact with integrity.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* BIG-NUMBER BAND — staggered editorial stats (not a symmetric row) */}
      <section className="py-10 md:py-16 bg-background overflow-hidden">
        <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-20">
          <Reveal>
            <div className="w-16 h-px bg-gold/50 mb-6 md:mb-8" />
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-8">
            {stats.map((stat, i) => (
              <Reveal
                key={stat.label}
                delay={i * 0.1}
                className={`md:col-span-4 ${stat.offset}`}
              >
                <p className="font-display font-light text-navy leading-none text-[clamp(3rem,6vw,5.5rem)] tracking-[-0.02em]">
                  {stat.value}
                </p>
                <p className="type-caption mt-5">{stat.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* THE ETHOS — numbered editorial list paired with a sticky portrait */}
      <section className="py-10 md:py-16 bg-sand overflow-hidden">
        <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-x-24">
            {/* Left: sticky label + anchoring portrait */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-32 space-y-6">
                <Reveal>
                  <p className="type-eyebrow text-gold!">Our Ethos</p>
                </Reveal>
                <CurtainImage className="aspect-[4/5]">
                  <Image
                    src={ETHOS_IMAGE}
                    alt="Newari tiered temple at Basantapur Durbar Square, Kathmandu"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </CurtainImage>
              </div>
            </div>

            {/* Right: the four principles as a dense numbered list */}
            <div className="lg:col-span-7 border-t border-navy/10">
              {ethos.map((item, i) => (
                <Reveal key={item.title} delay={i * 0.08}>
                  <div className="grid grid-cols-[auto_1fr] gap-6 md:gap-10 py-6 md:py-7 border-b border-navy/10">
                    <span className="font-display font-light text-4xl md:text-6xl text-navy/15 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="space-y-4 max-w-xl">
                      <p className="type-caption text-gold!">{item.eyebrow}</p>
                      <h3 className="type-h3">{item.title}</h3>
                      <p className="type-body">{item.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* THE PEOPLE — asymmetric split, hairline definition list */}
      <section className="py-10 md:py-16 bg-white overflow-hidden">
        <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-x-24 items-center">
            <div className="lg:col-span-5 space-y-6">
              <Reveal>
                <div className="space-y-6">
                  <p className="type-eyebrow">The People</p>
                  <h2 className="type-h2">
                    The People Behind<br />The Route.
                  </h2>
                </div>
              </Reveal>
              <Reveal delay={0.15} className="space-y-6">
                <p className="type-body">
                  {siteConfig.name} brings together hospitality thinkers, travel makers, property partners, and local teams who believe that every stay should feel personal, responsible, and rooted in {siteConfig.region}.
                </p>
                <div className="border-t border-navy/10">
                  {peopleRows.map((label, i) => (
                    <div key={label} className="flex items-baseline gap-6 py-5 border-b border-navy/10">
                      <span className="type-caption text-gold/80!">{String(i + 1).padStart(2, "0")}</span>
                      <p className="type-caption text-navy/70!">{label}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <CurtainImage className="aspect-square" direction="left">
                <Image
                  src={PEOPLE_IMAGE}
                  alt="Nepali Tamang woman in traditional attire, Patan Darbar Square"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </CurtainImage>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING QUOTE — oversized light serif in a near-empty field */}
      <section className="py-14 md:py-20 bg-sand px-6">
        <Reveal className="max-w-5xl mx-auto text-center space-y-6">
          <div className="w-16 h-px bg-gold mx-auto" />
          <blockquote className="font-display font-light text-3xl md:text-5xl text-navy leading-[1.25] tracking-[-0.01em]">
            &ldquo;We view sustainability not as a checklist, but as a <span className="italic text-gold">responsibility</span> to create long-term value for people, places, and the planet.&rdquo;
          </blockquote>
          <p className="type-caption">{siteConfig.name}</p>
          <div className="pt-6">
            <Link href="/contact" className="btn-primary">
              Start a Conversation
            </Link>
          </div>
        </Reveal>
      </section>

    </div>
  )
}
