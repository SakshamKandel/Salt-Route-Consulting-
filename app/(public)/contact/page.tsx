"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { LuxuryButton } from "@/components/ui/luxury-button"
import { Mail, Phone, MapPin, Send } from "lucide-react"

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

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
        toast.success("Enquiry received.")
      }
    } catch {
      toast.error("An error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background text-charcoal min-h-screen">
      {/* HERO SECTION - Elegant & Focused */}
      <section className="relative h-[60svh] w-full flex items-center justify-center pt-20 bg-charcoal">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=2070&auto=format&fit=crop"
            alt="Contact Salt Route"
            fill
            className="object-cover opacity-40 grayscale-[0.5]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        </div>

        <div className="relative z-10 text-center px-6">
          <FadeUp>
            <p className="text-[10px] uppercase tracking-[0.6em] text-white/80 font-sans mb-8 font-medium">Thoughtful Enquiry</p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-[8rem] text-white tracking-wide leading-none mb-10 font-normal">
              Conversation.
            </h1>
            <div className="flex items-center justify-center gap-6 text-white/40">
                <span className="w-12 h-[1px] bg-white/20" />
                <p className="text-[9px] uppercase tracking-[0.4em] font-sans">Reach Out to Salt Route</p>
                <span className="w-12 h-[1px] bg-white/20" />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* CONTACT GRID - COMPACT LUXURY */}
      <section className="py-12 md:py-16 bg-white border-b border-charcoal/5">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            
            {/* Info Column */}
            <div className="lg:col-span-5 space-y-16">
              <FadeUp>
                <div className="space-y-6">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 font-medium">Direct Contact</p>
                  <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-charcoal tracking-wide leading-[1.1]">
                    We&apos;d Love to<br/>Hear From You.
                  </h2>
                </div>
              </FadeUp>

              <div className="space-y-10">
                <FadeUp delay={0.1}>
                  <div className="group flex items-start gap-6 border-t border-charcoal/10 pt-10">
                    <div className="w-10 h-10 border border-charcoal/10 flex items-center justify-center shrink-0 group-hover:bg-charcoal group-hover:text-white transition-all duration-500">
                      <Mail className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-charcoal/40">Email</p>
                      <a href="mailto:info@saltroutegroup.com" className="font-display text-2xl text-charcoal hover:text-gold transition-colors block">
                        info@saltroutegroup.com
                      </a>
                    </div>
                  </div>
                </FadeUp>

                <FadeUp delay={0.2}>
                  <div className="group flex items-start gap-6 border-t border-charcoal/10 pt-10">
                    <div className="w-10 h-10 border border-charcoal/10 flex items-center justify-center shrink-0 group-hover:bg-charcoal group-hover:text-white transition-all duration-500">
                      <Phone className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-charcoal/40">Phone</p>
                      <a href="tel:+97701XXXXXXX" className="font-display text-2xl text-charcoal hover:text-gold transition-colors block">
                        +977-01-XXXXXXX
                      </a>
                    </div>
                  </div>
                </FadeUp>

                <FadeUp delay={0.3}>
                  <div className="group flex items-start gap-6 border-t border-charcoal/10 pt-10">
                    <div className="w-10 h-10 border border-charcoal/10 flex items-center justify-center shrink-0 group-hover:bg-charcoal group-hover:text-white transition-all duration-500">
                      <MapPin className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-charcoal/40">Location</p>
                      <p className="font-display text-2xl text-charcoal leading-snug">
                        Salt Route Group HQ, Jhamsikhel,<br/>Lalitpur, Nepal
                      </p>
                    </div>
                  </div>
                </FadeUp>
              </div>

              <FadeUp delay={0.4} className="pt-10">
                <p className="font-sans text-[14px] text-charcoal/50 leading-relaxed font-light italic">
                  &ldquo;For property enquiries, booking requests, or partnership conversations, we typically respond within one business day.&rdquo;
                </p>
              </FadeUp>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7">
              <FadeUp className="bg-[#FBF9F4] border border-charcoal/10 p-8 md:p-16 h-full">
                {sent ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col justify-center items-center text-center space-y-8"
                  >
                    <div className="w-16 h-16 border border-gold flex items-center justify-center rounded-full">
                       <Send className="w-6 h-6 text-gold" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-display text-4xl text-charcoal tracking-wide">Message Received.</h3>
                      <p className="font-sans text-base text-charcoal/60 leading-relaxed font-light">
                        Thank you for reaching out. The Salt Route team will contact you shortly.
                      </p>
                    </div>
                    <LuxuryButton onClick={() => setSent(false)}>Send Another</LuxuryButton>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-3 group">
                        <label className="text-[9px] uppercase tracking-[0.4em] font-bold text-charcoal/40 group-focus-within:text-charcoal transition-colors">Your Name</label>
                        <input
                          name="name"
                          required
                          className="w-full bg-transparent border-b border-charcoal/10 pb-4 font-sans text-lg text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-charcoal transition-colors font-light"
                          placeholder="Full name"
                        />
                      </div>
                      <div className="space-y-3 group">
                        <label className="text-[9px] uppercase tracking-[0.4em] font-bold text-charcoal/40 group-focus-within:text-charcoal transition-colors">Email Address</label>
                        <input
                          name="email"
                          type="email"
                          required
                          className="w-full bg-transparent border-b border-charcoal/10 pb-4 font-sans text-lg text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-charcoal transition-colors font-light"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 group">
                      <label className="text-[9px] uppercase tracking-[0.4em] font-bold text-charcoal/40 group-focus-within:text-charcoal transition-colors">Subject</label>
                      <input
                        name="subject"
                        className="w-full bg-transparent border-b border-charcoal/10 pb-4 font-sans text-lg text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-charcoal transition-colors font-light"
                        placeholder="Stay, partnership, or general question"
                      />
                    </div>

                    <div className="space-y-3 group">
                      <label className="text-[9px] uppercase tracking-[0.4em] font-bold text-charcoal/40 group-focus-within:text-charcoal transition-colors">Message</label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        className="w-full bg-transparent border-b border-charcoal/10 pb-4 font-sans text-lg text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-charcoal transition-colors resize-none font-light"
                        placeholder="Tell us what you have in mind..."
                      />
                    </div>

                    <div className="pt-6">
                      <LuxuryButton type="submit" disabled={loading} className="w-full">
                        {loading ? "Sending..." : "Send Enquiry"}
                      </LuxuryButton>
                    </div>
                  </form>
                )}
              </FadeUp>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}

