"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"


const values = [
  {
    num: "01",
    title: "Heritage",
    desc: "We honor the architectural and cultural lineage of every space we manage, ensuring each property tells a story rooted in Nepal's rich tradition.",
  },
  {
    num: "02",
    title: "Excellence",
    desc: "A commitment to world-class service standards — from the properties we select to the guest experiences we create — in the heart of Nepal.",
  },
  {
    num: "03",
    title: "Stewardship",
    desc: "Preserving the untamed beauty of Nepal's landscapes through conscious, responsible travel and hospitality that gives back to local communities.",
  },
]

export default function AboutPage() {
  return (
    <div className="bg-background text-charcoal min-h-screen">

      {/* HERO */}
      <section className="relative h-[85vh] w-full flex flex-col justify-center pt-20 bg-[#FAFAFA]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          className="absolute inset-0 z-0 overflow-hidden"
        >
          <Image
            src="https://images.unsplash.com/photo-1518173946687-a4c8a9833d8e?q=80&w=1974&auto=format&fit=crop"
            alt="Nepal landscape"
            fill
            className="object-cover opacity-90"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/90" />
        </motion.div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 mt-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
          >
            <p className="text-[10px] uppercase tracking-[0.6em] text-charcoal/60 font-sans mb-8 font-medium">Our Story</p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-[7.5rem] text-charcoal tracking-wide leading-[1.05] mb-10 font-normal">
              Who We Are.
            </h1>
            <p className="font-sans text-base md:text-lg text-charcoal/60 max-w-xl mx-auto leading-relaxed font-light">
              A boutique consultancy focused on bespoke stays and world-class hospitality management across Nepal.
            </p>
          </motion.div>
        </div>
      </section>

      {/* STORY */}
      <section className="py-32 md:py-48 bg-white flex items-center justify-center p-8 md:p-16 border-t border-charcoal/5">
        <div className="max-w-screen-xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 mb-6 font-medium">The Essence</p>
            <h2 className="font-display text-4xl md:text-5xl text-charcoal mb-10 tracking-wide leading-[1.2]">
              Nepal&apos;s Finest<br />Hospitality.
            </h2>
            <p className="font-sans text-base text-charcoal/60 leading-relaxed mb-6 font-light">
              Salt Route was established to bridge the gap between Nepal&apos;s untamed landscapes and the world&apos;s most discerning travelers. We are a boutique consultancy focused on bespoke stays and world-class hospitality management.
            </p>
            <p className="font-sans text-base text-charcoal/60 leading-relaxed mb-12 font-light">
              Our collection is limited, our vetting is rigorous, and our standards are absolute. We believe that true luxury is found in the intersection of authentic heritage and modern comfort.
            </p>
            <div className="w-16 h-[1px] bg-charcoal/10 mb-12" />
            <div className="grid grid-cols-3 gap-8">
              <div>
                <p className="font-display text-4xl text-charcoal mb-2">3+</p>
                <p className="font-sans text-[9px] uppercase tracking-[0.2em] font-semibold text-charcoal/40">Properties</p>
              </div>
              <div>
                <p className="font-display text-4xl text-charcoal mb-2">100%</p>
                <p className="font-sans text-[9px] uppercase tracking-[0.2em] font-semibold text-charcoal/40">Satisfaction</p>
              </div>
              <div>
                <p className="font-display text-4xl text-charcoal mb-2">2026</p>
                <p className="font-sans text-[9px] uppercase tracking-[0.2em] font-semibold text-charcoal/40">Founded</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[4/5] overflow-hidden hidden lg:block bg-[#FAFAFA] border border-charcoal/5"
          >
            <Image
              src="https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1974&auto=format&fit=crop"
              alt="Salt Route hospitality"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-32 md:py-48 bg-[#FAFAFA] flex items-center justify-center p-8 md:p-16 border-y border-charcoal/5">
        <div className="max-w-screen-xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 text-center"
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 mb-6 font-medium">What We Stand For</p>
            <h2 className="font-display text-4xl md:text-5xl text-charcoal tracking-wide">Our Values.</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-16 gap-y-12">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                className="pt-8 border-t border-charcoal/10 flex flex-col gap-8 group"
              >
                <span className="font-sans text-[10px] tracking-[0.2em] text-charcoal/30 font-semibold group-hover:text-gold transition-colors">N° {v.num}</span>
                <div>
                  <h3 className="font-display text-3xl text-charcoal mb-4 tracking-wide">
                    {v.title}
                  </h3>
                  <p className="font-sans text-base text-charcoal/60 leading-relaxed font-light">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 md:py-48 bg-white flex items-center justify-center p-8 md:p-16 relative">
        <div className="max-w-screen-xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 mb-6 font-medium">Experience Salt Route</p>
            <h2 className="font-display text-4xl md:text-5xl text-charcoal tracking-wide leading-[1.2] mb-10">
              Ready to<br />Discover Nepal?
            </h2>
            <div className="w-16 h-[1px] bg-charcoal/10 mb-10" />
            <p className="font-sans text-lg text-charcoal/60 leading-relaxed mb-12 font-light">
              Browse our curated collection of properties or reach out to plan a bespoke stay tailored to your journey.
            </p>
            <div className="flex gap-6 flex-wrap">
              <Link href="/properties" className="bg-charcoal text-white px-10 py-4 text-[10px] uppercase tracking-[0.3em] font-sans hover:bg-charcoal/90 transition-all duration-700">
                Explore Stays
              </Link>
              <Link href="/contact" className="border border-charcoal/20 text-charcoal px-10 py-4 text-[10px] uppercase tracking-[0.3em] font-sans hover:border-charcoal hover:bg-charcoal hover:text-white transition-all duration-700">
                Contact Us
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="relative aspect-square overflow-hidden hidden lg:block bg-[#FAFAFA] border border-charcoal/5"
          >
            <Image
              src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070&auto=format&fit=crop"
              alt="Nepal property"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>
      </section>
    </div>
  )
}
