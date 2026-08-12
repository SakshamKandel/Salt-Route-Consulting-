"use client"

import { siteConfig } from "@/lib/site.config"
import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Send } from "lucide-react"
import { CurtainImage, EASE, KenBurns, Reveal, RevealText } from "@/components/public/motion"

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
      {/* ── HERO ── */}
      <section className="relative h-[60svh] min-h-[480px] md:h-[68vh] w-full flex items-center justify-center overflow-hidden pt-20 bg-charcoal">
        <div className="absolute inset-0 z-0">
          <KenBurns className="h-full w-full">
            <Image
              src="/luxury_himalayan_retreat_exterior_1777124225845.png"
              alt="Reach Salt Route Corp"
              fill
              className="object-cover opacity-50"
              priority
            />
          </KenBurns>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        </div>

        <div className="relative z-10 text-center px-5 sm:px-6">
          <Reveal delay={0.2} y={16}>
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/80 font-sans mb-6 md:mb-8 font-medium">Thoughtful Enquiry</p>
          </Reveal>
          <RevealText
            as="h1"
            lines={["Conversation."]}
            delay={0.35}
            clipPad="0.12em"
            className="font-script text-4xl min-[360px]:text-5xl md:text-7xl lg:text-[8rem] text-white tracking-[-0.045em] leading-[1.02] pb-2 mb-6 md:mb-8"
          />
          <Reveal delay={0.65} y={16}>
            <div className="flex max-w-full items-center justify-center gap-3 text-white/40 sm:gap-6">
              <span className="hidden w-12 h-[1px] bg-white/20 min-[380px]:block" />
              <p className="text-[10px] uppercase tracking-[0.16em] font-sans sm:tracking-[0.28em]">Reach Out to {siteConfig.name}</p>
              <span className="hidden w-12 h-[1px] bg-white/20 min-[380px]:block" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CONTACT — asymmetric info + form (42/58) ── */}
      <section className="py-10 md:py-16">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-8 md:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-x-12">

            {/* Info column */}
            <div className="lg:col-span-5 space-y-10">
              <Reveal>
                <div className="space-y-6">
                  <p className="type-eyebrow">Direct Contact</p>
                  <h2 className="type-h2">
                    We&apos;d Love to<br />Hear From You.
                  </h2>
                </div>
              </Reveal>

              {/* Hairline-divided definition list */}
              <dl>
                <Reveal delay={0.05} className="border-t border-charcoal/10 py-8">
                  <dt className="type-eyebrow">Email</dt>
                  <dd className="mt-3">
                    <a href="mailto:connect@saltroutecorp.com" className="font-display text-xl sm:text-2xl text-charcoal hover:text-gold transition-colors duration-500 block">
                      connect@saltroutecorp.com
                    </a>
                  </dd>
                </Reveal>

                <Reveal delay={0.1} className="border-t border-charcoal/10 py-8">
                  <dt className="type-eyebrow">Phone</dt>
                  <dd className="mt-3">
                    <a href={siteConfig.contact.phoneHref} className="font-display text-xl sm:text-2xl text-charcoal hover:text-gold transition-colors duration-500 block">
                      {siteConfig.contact.phone}
                    </a>
                  </dd>
                </Reveal>

                <Reveal delay={0.15} className="border-t border-charcoal/10 py-8">
                  <dt className="type-eyebrow">Location</dt>
                  <dd className="mt-3">
                    <p className="font-display text-xl sm:text-2xl text-charcoal leading-snug">
                      {siteConfig.contact.addressFull}
                    </p>
                  </dd>
                </Reveal>
              </dl>

              <Reveal delay={0.1}>
                <span className="block w-10 h-px bg-gold/50 mb-6" aria-hidden />
                <p className="font-sans text-sm text-charcoal/50 leading-[1.8] font-light max-w-sm">
                  For property enquiries, booking requests, or partnership conversations, we typically respond within one business day.
                </p>
              </Reveal>

              {/* Location / imagery anchor */}
              <Reveal delay={0.15}>
                <CurtainImage className="aspect-[3/4] w-full max-w-sm">
                  <Image
                    src="/luxury_nepalese_interior_details_1777124245155.png"
                    alt="Interior detail at a Salt Route property"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 30vw"
                  />
                </CurtainImage>
                <p className="type-caption mt-4">Kathmandu · Nepal</p>
              </Reveal>
            </div>

            {/* Form column */}
            <div className="lg:col-span-7 lg:border-l lg:border-charcoal/10 lg:pl-12 xl:pl-20">
              <Reveal delay={0.1} className="h-full">
                {sent ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, ease: EASE.outLuxe }}
                    className="h-full flex flex-col justify-center items-center text-center space-y-8 py-16"
                  >
                    <Send className="w-6 h-6 text-gold" strokeWidth={1.5} />
                    <div className="space-y-4">
                      <h3 className="font-display text-3xl md:text-4xl text-charcoal tracking-[-0.01em]">Message Received.</h3>
                      <p className="font-sans text-base text-charcoal/60 leading-relaxed font-light">
                        Thank you for reaching out. The {siteConfig.name} team will contact you shortly.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSent(false)}
                      className="group relative inline-block text-[10px] uppercase tracking-[0.24em] text-charcoal/60 hover:text-charcoal transition-colors duration-300"
                    >
                      Send Another
                      <span className="absolute left-0 -bottom-1 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-500 ease-out-quart group-hover:scale-x-100" aria-hidden />
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-9 md:space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-9 md:gap-12">
                      <div className="space-y-3 group">
                        <label className="text-[10px] uppercase tracking-[0.24em] font-medium text-charcoal/40 group-focus-within:text-charcoal transition-colors">Your Name</label>
                        <input
                          name="name"
                          required
                          className="w-full bg-transparent border-b border-charcoal/10 pb-4 font-sans text-lg text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-charcoal transition-colors font-light"
                          placeholder="Full name"
                        />
                      </div>
                      <div className="space-y-3 group">
                        <label className="text-[10px] uppercase tracking-[0.24em] font-medium text-charcoal/40 group-focus-within:text-charcoal transition-colors">Email Address</label>
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
                      <label className="text-[10px] uppercase tracking-[0.24em] font-medium text-charcoal/40 group-focus-within:text-charcoal transition-colors">Subject</label>
                      <input
                        name="subject"
                        className="w-full bg-transparent border-b border-charcoal/10 pb-4 font-sans text-lg text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-charcoal transition-colors font-light"
                        placeholder="Stay, partnership, or general question"
                      />
                    </div>

                    <div className="space-y-3 group">
                      <label className="text-[10px] uppercase tracking-[0.24em] font-medium text-charcoal/40 group-focus-within:text-charcoal transition-colors">Message</label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        className="w-full bg-transparent border-b border-charcoal/10 pb-4 font-sans text-lg text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:border-charcoal transition-colors resize-none font-light"
                        placeholder="Tell us what you have in mind..."
                      />
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary group relative w-full overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="absolute inset-0 origin-left scale-x-0 bg-navy-dark transition-transform duration-300 ease-in-out group-hover:scale-x-100" aria-hidden />
                        <span className="relative z-10">{loading ? "Sending..." : "Send Enquiry"}</span>
                      </button>
                    </div>
                  </form>
                )}
              </Reveal>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
