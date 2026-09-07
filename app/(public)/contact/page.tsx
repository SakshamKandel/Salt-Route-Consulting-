"use client"

import { useState } from "react"
import { EditorialHero } from "@/components/public/EditorialHero"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Clock3, Home, Mail, MapPin, Phone, Sparkles, Users } from "lucide-react"
import { toast } from "sonner"
import { siteConfig } from "@/lib/site.config"
import { CompactContainer } from "@/components/public/Compact"
import imgRetreat from "@/public/images/saltroute/misty-tea-gardens.webp"
import imgDining from "@/public/images/saltroute/garden-breakfast.webp"

const enquiryTypes = [
  { icon: Home, title: "Plan a private stay", copy: "Dates, rooms, transfers, celebrations, and the details that will make the stay yours.", subject: "Private stay enquiry" },
  { icon: Sparkles, title: "Create a Nepal journey", copy: "A considered itinerary shaped around landscapes, culture, food, and unhurried time.", subject: "Journey planning enquiry" },
  { icon: Users, title: "Discuss your property", copy: "Brand, market, operate, or enhance a distinctive private home or small retreat.", subject: "Owner partnership enquiry" },
]

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [subject, setSubject] = useState("")

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
      const response = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
      if (!response.ok) throw new Error("Unable to send enquiry")
      setSent(true)
      form.reset()
      setSubject("")
      toast.success("Enquiry received.")
    } catch {
      toast.error("We could not send your enquiry. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "mt-2 min-h-12 w-full border border-navy/14 bg-white px-4 py-3 font-sans text-sm text-navy outline-none transition-colors placeholder:text-navy/30 focus:border-gold-dark"

  return (
    <main className="bg-background text-navy">
      <EditorialHero image={imgRetreat} title="Let’s begin a conversation" />
      <div className="editorial-properties-intro">Tell us where your thoughts are taking you. A Salt Route travel designer will respond personally within one business day.</div>

      <section className="border-b border-navy/8 bg-white py-16 lg:py-20"><CompactContainer>
        <div className="grid gap-10 editorial-two-column md:grid-cols-2">{enquiryTypes.map((type) => { const Icon = type.icon; return <button key={type.title} type="button" onClick={() => { setSubject(type.subject); document.getElementById("enquiry")?.scrollIntoView({ behavior: "smooth" }) }} className="group bg-transparent px-0 py-9 text-left transition-colors hover:bg-beige sm:px-9"><Icon className="h-5 w-5 text-gold-dark" /><h2 className="mt-5 font-display text-2xl">{type.title}</h2><p className="mt-3 text-sm font-light leading-7 text-navy/62">{type.copy}</p><span className="mt-5 inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em]">Choose enquiry <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span></button> })}</div>
      </CompactContainer></section>

      <section id="enquiry" className="scroll-mt-24 py-20 lg:py-28"><CompactContainer>
        <div className="grid gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-dark">Speak with us</p>
            <h2 className="mt-4 font-display text-[clamp(2.3rem,4vw,4rem)] leading-[1.06]">Tell us what you have in mind.</h2>
            <p className="mt-5 text-sm font-light leading-7 text-navy/65">You do not need a finished plan. Share the place, occasion, people, or property you are considering and we will help shape the next step.</p>
            <dl className="mt-9 space-y-6 border-t border-navy/10 pt-7 text-sm">
              <div className="flex gap-4"><Mail className="mt-0.5 h-4 w-4 text-gold-dark" /><div><dt className="text-[9px] uppercase tracking-[0.18em] text-navy/42">Email</dt><dd className="mt-1"><a href={`mailto:${siteConfig.contact.email}`} className="hover:text-gold-dark">{siteConfig.contact.email}</a></dd></div></div>
              <div className="flex gap-4"><Phone className="mt-0.5 h-4 w-4 text-gold-dark" /><div><dt className="text-[9px] uppercase tracking-[0.18em] text-navy/42">Phone</dt><dd className="mt-1"><a href={siteConfig.contact.phoneHref} className="hover:text-gold-dark">{siteConfig.contact.phone}</a></dd></div></div>
              <div className="flex gap-4"><MapPin className="mt-0.5 h-4 w-4 text-gold-dark" /><div><dt className="text-[9px] uppercase tracking-[0.18em] text-navy/42">Office</dt><dd className="mt-1 max-w-sm leading-6 text-navy/68">{siteConfig.contact.addressFull}</dd></div></div>
              <div className="flex gap-4"><Clock3 className="mt-0.5 h-4 w-4 text-gold-dark" /><div><dt className="text-[9px] uppercase tracking-[0.18em] text-navy/42">Response</dt><dd className="mt-1 text-navy/68">Usually within one business day</dd></div></div>
            </dl>
          </div>

          <div className="editorial-form">
            {sent ? <div className="py-16 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-emerald-700" /><h2 className="mt-5 font-display text-3xl">Your note is with us.</h2><p className="mx-auto mt-4 max-w-lg text-sm font-light leading-7 text-navy/65">Thank you for contacting {siteConfig.name}. A member of our team will be in touch shortly.</p><button type="button" onClick={() => setSent(false)} className="mt-7 bg-navy px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-cream">Send another enquiry</button></div> :
            <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
              <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy/58">Your name *<input name="name" required minLength={2} maxLength={100} placeholder="How should we address you?" className={inputClass} /></label>
              <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy/58">Email *<input name="email" type="email" required placeholder="you@example.com" className={inputClass} /></label>
              <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy/58">Phone<input name="phone" type="tel" placeholder="+977" className={inputClass} /></label>
              <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy/58">Subject *<input name="subject" required minLength={2} maxLength={200} value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="What can we help with?" className={inputClass} /></label>
              <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy/58 sm:col-span-2">Your message *<textarea name="message" required minLength={10} maxLength={2000} rows={6} placeholder="Dates, destination, group size, property details, or simply the beginning of an idea…" className={`${inputClass} resize-y`} /></label>
              <button type="submit" disabled={loading} className="min-h-12 bg-navy px-7 text-[10px] font-semibold uppercase tracking-[0.2em] text-cream transition-colors hover:bg-gold-dark disabled:opacity-50 sm:col-span-2">{loading ? "Sending…" : "Send enquiry"}</button>
            </form>}
          </div>
        </div>
      </CompactContainer></section>

      <section className="grid min-h-[520px] lg:grid-cols-2">
        <div className="relative min-h-[360px]"><Image src={imgDining} alt="Private dining arranged by Salt Route" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div>
        <div className="flex items-center bg-navy px-7 py-16 text-cream sm:px-12 lg:px-20"><div><p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">Prefer to explore first?</p><h2 className="mt-5 font-display text-[clamp(2.2rem,4vw,4rem)] leading-[1.06]">Discover the stays and stories that shape Salt Route.</h2><p className="mt-5 max-w-xl text-sm font-light leading-7 text-cream/65">Browse private properties or learn how we work with owners before beginning your conversation.</p><div className="mt-8 flex flex-wrap gap-5"><Link href="/properties" className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">Explore stays <ArrowRight className="h-3.5 w-3.5" /></Link><Link href="/for-owners" className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-cream">For owners <ArrowRight className="h-3.5 w-3.5" /></Link></div></div></div>
      </section>
    </main>
  )
}
