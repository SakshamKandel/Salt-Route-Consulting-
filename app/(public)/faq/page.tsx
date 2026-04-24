"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-cream pt-16">
      <div className="bg-navy py-20 text-center px-4">
        <p className="text-gold text-xs uppercase tracking-widest font-semibold mb-3">Help Centre</p>
        <h1 className="font-display text-4xl md:text-5xl text-cream mb-4">Frequently Asked Questions</h1>
        <p className="text-cream/60 max-w-xl mx-auto">
          Everything you need to know before you book. Can&apos;t find an answer? We&apos;re always here.
        </p>
      </div>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20 space-y-3">
        <FaqItem
          q="How does the booking process work?"
          a="Browse our properties and submit a booking request with your preferred dates. Our team reviews availability and contacts you within 24 hours to confirm. Payment is only required once your booking is confirmed."
        />
        <FaqItem
          q="Are the prices per night or for the entire stay?"
          a="All prices displayed are per night. The total for your stay is calculated based on your check-in and check-out dates, and shown clearly before you confirm."
        />
        <FaqItem
          q="Can I cancel or modify a booking?"
          a="Yes. We offer free cancellation within 48 hours of booking confirmation. For cancellations after that window, please refer to our Refund Policy page for details on partial refunds based on notice period."
        />
        <FaqItem
          q="Do I need to create an account to book?"
          a="Yes, a free account is required to make a booking. This lets you track your reservation status, communicate with our team, and access exclusive member pricing."
        />
        <FaqItem
          q="What is included in the price?"
          a="Pricing varies by property — some include breakfast, guided activities, or airport transfers. Each property listing clearly states what is included. Our consultants can also advise on packages."
        />
        <FaqItem
          q="Are the properties suitable for families with children?"
          a="Many of our properties are family-friendly. Check the 'Max Guests' and amenities on each listing. Our team can also recommend the best options for families with specific needs."
        />
        <FaqItem
          q="How can I contact my host or property?"
          a="Once your booking is confirmed, your dedicated consultant will share property contact details and assist with any direct communication. All coordination flows through our team for your convenience."
        />
        <FaqItem
          q="What payment methods are accepted?"
          a="We accept all major credit and debit cards. Bank transfer is also available for longer stays. Our team will guide you through payment options once your booking is confirmed."
        />
        <FaqItem
          q="Is travel insurance required?"
          a="We strongly recommend travel insurance for all Nepal visits. While not mandatory, it provides peace of mind for flight changes, medical emergencies, and trek cancellations."
        />
        <FaqItem
          q="What if my question isn't answered here?"
          a="Please reach out via our contact form, email, or WhatsApp. Our team responds within 24 hours — often much sooner."
        />
      </section>

      <section className="bg-gold py-16 text-center px-4">
        <h2 className="font-display text-3xl text-navy mb-4">Still have questions?</h2>
        <p className="text-navy/70 mb-8">Our consultants are available 7 days a week to help you plan.</p>
        <Button asChild size="lg" className="bg-navy text-cream hover:bg-navy/90 px-10">
          <Link href="/contact">Contact Us</Link>
        </Button>
      </section>
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-xl border border-beige overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left"
      >
        <span className="font-medium text-navy pr-4">{q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-gold transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-navy/70 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}
