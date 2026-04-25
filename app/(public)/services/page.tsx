"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"


const guestServices = [
  {
    num: "01",
    title: "Curated Property Stays",
    desc: "Browse and book from our handpicked collection of heritage villas, boutique retreats, and eco-lodges across Nepal.",
    cta: "Browse Collection",
    href: "/properties",
  },
  {
    num: "02",
    title: "Bespoke Itineraries",
    desc: "Our consultants design a complete Nepal journey tailored exclusively to your interests, pace, and budget.",
    cta: "Plan Your Journey",
    href: "/contact",
  },
  {
    num: "03",
    title: "Guided Trekking",
    desc: "Private guided treks with experienced local experts. All logistics — permits, gear, accommodation — seamlessly handled.",
    cta: "Enquire Now",
    href: "/contact",
  },
  {
    num: "04",
    title: "Cultural Experiences",
    desc: "Immersive craft workshops, private temple visits, and cultural evenings with local masters and artisans.",
    cta: "Discover More",
    href: "/contact",
  },
  {
    num: "05",
    title: "Culinary Journeys",
    desc: "Farm-to-table dinners and guided food tours exploring the hidden backstreets and flavors of historic cities.",
    cta: "Learn More",
    href: "/contact",
  },
  {
    num: "06",
    title: "Private Transfers",
    desc: "Door-to-door transfers, inter-city private vehicles, domestic flight coordination, and airport assistance.",
    cta: "Get a Quote",
    href: "/contact",
  },
]

const ownerServices = [
  {
    num: "A",
    title: "Strategic Advisory",
    desc: "Market analysis, concept development, business planning, and go-to-market strategy.",
  },
  {
    num: "B",
    title: "Operational Setup",
    desc: "Staff recruitment, SOP development, financial modeling, and guest experience frameworks.",
  },
  {
    num: "C",
    title: "Brand Development",
    desc: "Identity creation, narrative building, customer touchpoint design, and marketing roadmap.",
  },
  {
    num: "D",
    title: "Sustainability Integration",
    desc: "ESG principles, energy efficiency, local sourcing, and regenerative tourism models.",
  },
]

function fadeUp(delay = 0) {
  const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

  return {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 1.2, delay, ease },
  }
}

export default function ServicesPage() {
  return (
    <div className="bg-background text-charcoal min-h-screen">

      {/* HERO */}
      <section className="relative h-[85vh] w-full flex flex-col justify-center pt-20 bg-[#FAFAFA]">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop"
            alt="Salt Route Services"
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/30 to-white/90" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 mt-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5 }}>
            <p className="text-[10px] uppercase tracking-[0.6em] text-charcoal/60 font-sans mb-8 font-medium">What We Offer</p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-[7.5rem] text-charcoal tracking-wide leading-none mb-10 font-normal">
              Bespoke Services.
            </h1>
            <div className="w-16 h-[1px] bg-charcoal/20 mx-auto" />
          </motion.div>
        </div>
      </section>

      {/* GUEST SERVICES */}
      <section className="py-32 md:py-48 bg-white border-t border-charcoal/5">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <motion.div {...fadeUp()} className="mb-24 text-center max-w-2xl mx-auto">
            <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 mb-6 font-medium">Salt Route Experiences</p>
            <h2 className="font-display text-4xl md:text-5xl text-charcoal tracking-wide mb-10">
              For Travelers &amp; Guests.
            </h2>
            <div className="w-16 h-[1px] bg-charcoal/10 mx-auto mb-10" />
            <p className="font-sans text-lg text-charcoal/60 leading-relaxed font-light">
              From curated stays to thematic experiences, we offer end-to-end travel design that honors local heritage, supports community businesses, and redefines how Nepal is explored.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
            {guestServices.map((s, i) => (
              <motion.div key={s.num} {...fadeUp(i * 0.1)} className="pt-8 border-t border-charcoal/10 flex flex-col gap-6 group hover:border-charcoal/30 transition-colors duration-700">
                <span className="font-sans text-[10px] tracking-[0.2em] text-charcoal/30 font-semibold group-hover:text-gold/80 transition-colors">N° {s.num}</span>
                <div className="flex-1 flex flex-col">
                  <h3 className="font-display text-2xl text-charcoal mb-4 tracking-wide">{s.title}</h3>
                  <p className="font-sans text-base text-charcoal/60 leading-relaxed font-light mb-8 flex-1">{s.desc}</p>
                  <Link href={s.href} className="inline-flex text-[9px] uppercase tracking-[0.2em] font-semibold font-sans text-charcoal/60 hover:text-charcoal transition-colors">
                    {s.cta} &rarr;
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* OWNER SERVICES TEASER */}
      <section className="py-32 md:py-48 bg-[#FAFAFA] border-y border-charcoal/5">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <motion.div {...fadeUp()} className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-24">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 mb-6 font-medium">Salt Route Consulting</p>
              <h2 className="font-display text-4xl md:text-5xl text-charcoal tracking-wide leading-[1.2] mb-10">
                For Property<br />Owners &amp; Investors.
              </h2>
              <p className="font-sans text-lg text-charcoal/60 leading-relaxed mb-12 font-light">
                SRC works alongside property owners and investors to shape distinctive, profitable, and responsible hospitality brands — grounded in local insight and driven by global standards.
              </p>
              <Link href="/for-owners" className="bg-charcoal text-white px-10 py-4 text-[10px] uppercase tracking-[0.3em] font-sans hover:bg-charcoal/90 transition-all duration-700">
                Explore Owner Services
              </Link>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden hidden lg:block bg-white border border-charcoal/5 p-4">
              <div className="relative w-full h-full">
                  <Image
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
                    alt="Owner services"
                    fill
                    className="object-cover"
                  />
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16">
            {ownerServices.map((s, i) => (
              <motion.div key={s.num} {...fadeUp(i * 0.1)} className="pt-6 border-t border-charcoal/10 flex flex-col gap-4">
                <span className="font-sans text-[10px] tracking-[0.2em] text-charcoal/30 font-semibold">PART {s.num}</span>
                <h3 className="font-display text-xl text-charcoal mb-2 tracking-wide">{s.title}</h3>
                <p className="font-sans text-sm text-charcoal/50 leading-relaxed font-light">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FUTURE EXPANSION */}
      <section className="py-32 md:py-48 bg-white">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div {...fadeUp()}>
              <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 mb-6 font-medium">What&apos;s Next</p>
              <h2 className="font-display text-4xl md:text-5xl text-charcoal mb-10 tracking-wide">
                Future Expansion.
              </h2>
              <div className="w-16 h-[1px] bg-charcoal/10 mb-10" />
              <p className="font-sans text-base text-charcoal/60 leading-relaxed mb-6 font-light">
                We&apos;re developing a growing portfolio of experience-based tourism products — from nature trails and cultural circuits to community-based travel hubs.
              </p>
              <p className="font-sans text-base text-charcoal/60 leading-relaxed mb-12 font-light">
                Our focus remains on low-impact, high-value experiences that leave a lasting mark — for both traveler and host. Every new venture we develop is rooted in place, purpose, and people.
              </p>
              <div className="flex gap-6 flex-wrap">
                <Link href="/contact" className="bg-charcoal text-white px-10 py-4 text-[10px] uppercase tracking-[0.3em] font-sans hover:bg-charcoal/90 transition-all duration-700">Get in Touch</Link>
                <Link href="/about" className="border border-charcoal/20 text-charcoal px-10 py-4 text-[10px] uppercase tracking-[0.3em] font-sans hover:border-charcoal hover:bg-charcoal hover:text-white transition-all duration-700">Our Mission</Link>
              </div>
            </motion.div>
            <motion.div {...fadeUp(0.15)} className="relative aspect-square overflow-hidden hidden lg:block bg-[#FAFAFA] border border-charcoal/5">
              <Image
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1470&auto=format&fit=crop"
                alt="Nepal future"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
