"use client"

import { useState } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { siteConfig } from "@/lib/site.config"
import { CompactContainer, CompactHeading, CompactSection } from "@/components/public/Compact"
import imgRetreat from "@/public/images/marketing/himalayan-retreat-exterior.png"

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    const form = event.currentTarget
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    }

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Unable to send enquiry")
      setSent(true)
      form.reset()
      toast.success("Enquiry received.")
    } catch {
      toast.error("We could not send your enquiry. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    "mt-2 min-h-12 w-full border border-navy/14 bg-white px-4 py-3 font-sans text-base text-navy outline-none focus:border-navy"

  return (
    <div className="min-h-screen bg-background text-navy">
      <CompactSection className="pb-7 sm:pb-8">
        <CompactHeading
          eyebrow="Contact Salt Route"
          title="Start a conversation."
          copy="Tell us about a stay, a private journey, or a property partnership. Our team usually responds within one business day."
        />
      </CompactSection>

      <CompactContainer>
        <div className="relative aspect-[16/7] min-h-[260px] overflow-hidden bg-sand-dark">
          <Image src={imgRetreat} alt="A Salt Route retreat in Nepal" fill priority sizes="100vw" className="object-cover" />
        </div>
      </CompactContainer>

      <CompactSection>
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-12">
          <div>
            <h2 className="font-display text-3xl text-navy">Direct contact</h2>
            <dl className="mt-5 space-y-5 font-sans text-base">
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-[0.14em] text-navy/50">Email</dt>
                <dd className="mt-1"><a href={`mailto:${siteConfig.contact.email}`} className="text-navy hover:text-gold-dark">{siteConfig.contact.email}</a></dd>
              </div>
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-[0.14em] text-navy/50">Phone</dt>
                <dd className="mt-1"><a href={siteConfig.contact.phoneHref} className="text-navy hover:text-gold-dark">{siteConfig.contact.phone}</a></dd>
              </div>
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-[0.14em] text-navy/50">Address</dt>
                <dd className="mt-1 max-w-sm font-light leading-7 text-navy/72">{siteConfig.contact.addressFull}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-sand p-5 sm:p-7">
            {sent ? (
              <div className="py-8">
                <h2 className="font-display text-3xl text-navy">Message received.</h2>
                <p className="mt-3 max-w-xl font-sans text-base font-light leading-7 text-navy/70">
                  Thank you for contacting {siteConfig.name}. Our team will be in touch shortly.
                </p>
                <button type="button" onClick={() => setSent(false)} className="mt-5 bg-navy px-6 py-3 font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-cream">
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
                <label className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-navy/62">
                  Your name
                  <input name="name" required minLength={2} maxLength={100} className={inputClass} />
                </label>
                <label className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-navy/62">
                  Email address
                  <input name="email" type="email" required className={inputClass} />
                </label>
                <label className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-navy/62">
                  Phone
                  <input name="phone" type="tel" className={inputClass} />
                </label>
                <label className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-navy/62">
                  Subject
                  <input name="subject" required minLength={2} maxLength={200} className={inputClass} />
                </label>
                <label className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-navy/62 sm:col-span-2">
                  Message
                  <textarea name="message" required minLength={10} maxLength={2000} rows={5} className={`${inputClass} resize-y`} />
                </label>
                <button type="submit" disabled={loading} className="min-h-12 bg-navy px-6 font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-cream hover:bg-navy-dark disabled:opacity-50 sm:col-span-2">
                  {loading ? "Sending…" : "Send enquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      </CompactSection>
    </div>
  )
}
