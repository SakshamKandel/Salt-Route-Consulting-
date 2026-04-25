"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { toast } from "sonner"


export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    }

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setSent(true)
        toast.success("Inquiry received.")
      }
    } catch {
      toast.error("An error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background text-charcoal min-h-screen">

      {/* HERO */}
      <section className="relative h-[65vh] w-full flex flex-col justify-center pt-20 bg-[#FAFAFA]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          className="absolute inset-0 z-0 overflow-hidden"
        >
          <Image
            src="https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=2070&auto=format&fit=crop"
            alt="Contact Salt Route"
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-white/90" />
        </motion.div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 mt-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
          >
            <p className="text-[10px] uppercase tracking-[0.6em] text-charcoal/60 font-sans mb-8 font-medium">Get in Touch</p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-[7.5rem] text-charcoal tracking-wide leading-none mb-10 font-normal">
              Conversation.
            </h1>
            <p className="font-sans text-base md:text-lg text-charcoal/60 max-w-xl mx-auto leading-relaxed font-light">
              Whether you&apos;re planning a stay or looking to partner with us, our team is ready to help.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="py-32 md:py-48 bg-white flex items-center justify-center p-8 md:p-16">
        <div className="max-w-screen-xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 mb-6 font-medium">Contact Details</p>
            <h2 className="font-display text-4xl md:text-5xl text-charcoal mb-10 tracking-wide leading-[1.2]">
              We&apos;d Love<br />to Hear From You.
            </h2>
            <div className="w-16 h-[1px] bg-charcoal/10 mb-12" />

            <div className="space-y-10 mb-16">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] font-semibold text-charcoal/40 mb-2">Email</p>
                <a
                  href="mailto:info@saltroutegroup.com"
                  className="font-sans text-lg text-charcoal hover:text-gold transition-colors font-light"
                >
                  info@saltroutegroup.com
                </a>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] font-semibold text-charcoal/40 mb-2">Phone</p>
                <a
                  href="tel:+97701XXXXXXX"
                  className="font-sans text-lg text-charcoal hover:text-gold transition-colors font-light"
                >
                  +977-01-XXXXXXX
                </a>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] font-semibold text-charcoal/40 mb-2">Office</p>
                <p className="font-sans text-lg text-charcoal font-light">
                  Salt Route Group HQ, Jhamsikhel,<br/>Lalitpur, Nepal
                </p>
              </div>
            </div>

            <p className="font-sans text-sm text-charcoal/50 leading-relaxed max-w-sm font-light">
              For property inquiries, booking requests, or partnership discussions — we typically respond within one business day.
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.2 }}
          >
            {sent ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[#FAFAFA] p-16 text-center border border-charcoal/5 h-full flex flex-col justify-center items-center min-h-[500px]"
              >
                <div className="w-12 h-[1px] bg-gold mx-auto mb-10" />
                <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 mb-6 font-medium">Message Received</p>
                <h3 className="font-display text-4xl text-charcoal mb-6 tracking-wide">
                  Thank You.
                </h3>
                <p className="font-sans text-base text-charcoal/60 leading-relaxed font-light">
                  We will be in touch within one business day.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-[#FAFAFA] p-10 md:p-14 border border-charcoal/5">
                <div className="space-y-10">
                  <div>
                    <label className="text-[9px] uppercase tracking-[0.2em] font-semibold text-charcoal/40 block mb-3">Your Name</label>
                    <input
                      name="name"
                      required
                      className="w-full bg-transparent border-b border-charcoal/10 pb-4 font-sans text-base text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-charcoal/40 transition-colors font-light"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-[0.2em] font-semibold text-charcoal/40 block mb-3">Email Address</label>
                    <input
                      name="email"
                      type="email"
                      required
                      className="w-full bg-transparent border-b border-charcoal/10 pb-4 font-sans text-base text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-charcoal/40 transition-colors font-light"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-[0.2em] font-semibold text-charcoal/40 block mb-3">Subject</label>
                    <input
                      name="subject"
                      className="w-full bg-transparent border-b border-charcoal/10 pb-4 font-sans text-base text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-charcoal/40 transition-colors font-light"
                      placeholder="Booking inquiry, partnership, etc."
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-[0.2em] font-semibold text-charcoal/40 block mb-3">Message</label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      className="w-full bg-transparent border-b border-charcoal/10 pb-4 font-sans text-base text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-charcoal/40 transition-colors resize-none font-light"
                      placeholder="Tell us about your plans..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-charcoal text-white py-5 text-[10px] uppercase tracking-[0.3em] font-sans hover:bg-charcoal/90 transition-all duration-700 disabled:opacity-60 mt-4"
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
