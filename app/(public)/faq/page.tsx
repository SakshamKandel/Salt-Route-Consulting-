"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"
import { motion } from "framer-motion"


export default function FaqPage() {
  return (
    <div className="bg-background text-charcoal min-h-screen">
      
      {/* HEADER */}
      <section className="pt-40 pb-20 px-6 md:px-12 text-center bg-[#FBF9F4] border-b border-charcoal/5">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
            className="max-w-3xl mx-auto"
        >
            <p className="text-[10px] uppercase tracking-[0.6em] text-charcoal/40 mb-8 font-medium">Stays &amp; Enquiries</p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-[7rem] tracking-wide mb-10 font-normal">
                Common<br/>Inquiries.
            </h1>
            <div className="w-16 h-[1px] bg-charcoal/10 mx-auto" />
        </motion.div>
      </section>

      {/* ACCORDION */}
      <section className="py-32 bg-white flex items-center justify-center px-6 md:px-12">
        <div className="max-w-4xl w-full border-t border-charcoal/10">
            <FaqItem
              q="How does the booking process work?"
              a="Browse our collection and submit a request with your preferred dates. Our team will review availability and contact you within 24 hours to coordinate your stay."
            />
            <FaqItem
              q="Are the prices per night or for the entire stay?"
              a="All prices displayed are per night. The total for your stay is calculated based on your dates and shown clearly before confirmation."
            />
            <FaqItem
              q="Can I cancel or modify a booking?"
              a="Yes. We offer free cancellation within 48 hours of confirmation. For later adjustments, our boutique policies apply to ensure the integrity of our partner properties."
            />
            <FaqItem
              q="Do I need to create an account to book?"
              a="A private account keeps your stay details, messages, and reservations together in one simple guest area."
            />
            <FaqItem
              q="What is included in the price?"
              a="Each stay includes the amenities listed on its property page. Breakfast, transfers, and experiences are shown clearly where available."
            />
        </div>
      </section>
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-charcoal/10 overflow-hidden bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-10 text-left group"
      >
        <span className="font-display text-2xl text-charcoal tracking-wide group-hover:text-gold transition-colors">{q}</span>
        <span className="shrink-0 text-charcoal/30 group-hover:text-gold transition-colors duration-500 ml-6">
          {open ? <Minus size={20} strokeWidth={1} /> : <Plus size={20} strokeWidth={1} />}
        </span>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="pb-10 pt-2 pr-12">
            <p className="font-sans text-base text-charcoal/60 leading-relaxed font-light">{a}</p>
        </div>
      </div>
    </div>
  )
}

