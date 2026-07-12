"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Minus } from "lucide-react"
import { motion } from "framer-motion"
import { Reveal } from "@/components/public/motion"

const FAQ_GROUPS = [
  {
    id: "reservations",
    label: "Reservations",
    items: [
      {
        q: "How does the booking process work?",
        a: "Browse our collection and submit a request with your preferred dates. Our team will review availability and contact you within 24 hours to coordinate your stay.",
      },
      {
        q: "Can I cancel or modify a booking?",
        a: "Yes. We offer free cancellation within 48 hours of confirmation. For later adjustments, our standard policies apply to ensure the integrity of our partner properties.",
      },
      {
        q: "Do I need to create an account to book?",
        a: "A private account keeps your stay details, messages, and reservations together in one simple guest area.",
      },
    ],
  },
  {
    id: "rates",
    label: "Rates & Inclusions",
    items: [
      {
        q: "Are the prices per night or for the entire stay?",
        a: "All prices displayed are per night. The total for your stay is calculated based on your dates and shown clearly before confirmation.",
      },
      {
        q: "What is included in the price?",
        a: "Each stay includes the amenities listed on its property page. Breakfast, transfers, and experiences are shown clearly where available.",
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <div className="bg-background text-navy min-h-screen">
      <section className="px-6 md:px-12 lg:px-20 pt-24 md:pt-28 pb-10 md:pb-16">
        <div className="max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-x-10 xl:gap-x-24">
          {/* Sticky category rail */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <Reveal>
                <p className="type-eyebrow mb-6">Stays &amp; Enquiries</p>
                <h1 className="type-display mb-6 md:mb-10">Common Inquiries.</h1>
                <div className="w-16 h-px bg-navy/15" />
                <p className="type-body max-w-sm mt-6">
                  Everything you need to know before you reserve. Should a question
                  remain, our team is a message away.
                </p>
                <nav className="hidden lg:block border-t border-navy/10 pt-6 mt-6">
                  {FAQ_GROUPS.map((group, i) => (
                    <a
                      key={group.id}
                      href={`#${group.id}`}
                      className="group flex items-baseline gap-4 py-1.5 text-navy/55 hover:text-navy transition-colors duration-300"
                    >
                      <span className="font-sans uppercase text-[10px] tracking-[0.15em] text-gold">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-sans">{group.label}</span>
                    </a>
                  ))}
                </nav>
                <Link
                  href="/contact"
                  className="group mt-6 inline-flex items-center gap-3 font-sans font-medium uppercase text-[11px] tracking-[0.22em] text-navy"
                >
                  Speak with our team
                  <span
                    className="block h-px w-8 bg-current transition-all duration-300 ease-[var(--ease-out-quart)] group-hover:w-14"
                    aria-hidden
                  />
                </Link>
              </Reveal>
            </div>
          </div>

          {/* Accordion, chaptered by category */}
          <div className="lg:col-span-7">
            {FAQ_GROUPS.map((group, gi) => {
              const start = FAQ_GROUPS.slice(0, gi).reduce(
                (n, g) => n + g.items.length,
                0
              )
              return (
                <div
                  key={group.id}
                  id={group.id}
                  className={`scroll-mt-36 ${gi > 0 ? "mt-10 md:mt-16" : ""}`}
                >
                  <Reveal>
                    <p className="type-eyebrow mb-3">{group.label}</p>
                  </Reveal>
                  <div className="border-t border-navy/10">
                    {group.items.map((item, i) => (
                      <FaqItem
                        key={item.q}
                        index={start + i + 1}
                        q={item.q}
                        a={item.a}
                      />
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Enquire close — the page's one primary action */}
            <Reveal className="pt-12 md:pt-16">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
                <h2 className="type-h3">Still have a question?</h2>
                <Link href="/contact" className="btn-primary">
                  Enquire
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  )
}

function FaqItem({ index, q, a }: { index: number; q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-navy/10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-6 py-6 md:py-7 text-left group"
        aria-expanded={open}
      >
        <span className="flex items-baseline gap-5 md:gap-8">
          <span className="w-8 shrink-0 font-sans uppercase text-[10px] tracking-[0.15em] text-gold">
            {String(index).padStart(2, "0")}
          </span>
          <span className="type-h3 group-hover:text-gold transition-colors duration-500">
            {q}
          </span>
        </span>
        <span className="shrink-0 text-navy/30 group-hover:text-gold transition-colors duration-500 mt-1">
          {open ? <Minus size={20} strokeWidth={1} /> : <Plus size={20} strokeWidth={1} />}
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <p className="type-body pb-7 pr-6 md:pl-16">{a}</p>
      </motion.div>
    </div>
  )
}
