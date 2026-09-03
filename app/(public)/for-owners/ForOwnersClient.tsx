"use client"

import { useState, type FormEvent } from "react"
import Image, { type StaticImageData } from "next/image"
import Link from "next/link"
import { ArrowRight, BarChart3, CheckCircle2, Compass, LineChart, Mail, MapPin, Megaphone, Phone, Quote, ShieldCheck, Sparkles } from "lucide-react"
import { CompactContainer } from "@/components/public/Compact"
import imgVilla from "@/public/images/marketing/sunshine-villa-main.png"
import imgRetreat from "@/public/images/marketing/himalayan-retreat-exterior.png"
import imgTeam from "@/public/images/marketing/boutique-office-team.png"
import imgDining from "@/public/images/marketing/private-himalayan-dining.png"
import imgInterior from "@/public/images/marketing/nepalese-interior-details.png"

export type ForOwnersPortfolioItem = {
  slug: string
  name: string
  location: string
  desc: string
  image: string | null
  bedrooms: number
  bathrooms: number
  maxGuests: number
  featured: boolean
}

export type ForOwnersContact = {
  siteName: string
  email: string
  phone: string
  phoneHref: string
  address: string
}

const disciplines = [
  { icon: Sparkles, title: "Brand & editorial direction", copy: "A distinctive identity, visual language, photography, film, and story rooted in the property rather than a generic hotel template." },
  { icon: Megaphone, title: "Marketing & distribution", copy: "Direct-booking campaigns, search visibility, public relations, travel-designer relationships, and selective international channels." },
  { icon: Compass, title: "Guest experience & operations", copy: "Reservations, concierge, service standards, host training, housekeeping protocols, local sourcing, and thoughtful guest communication." },
]

const commercialServices = [
  { image: imgInterior, title: "A brand guests remember", copy: "Naming, positioning, photography, film, editorial writing, and a visual system that gives your property a clear place in the market.", href: "/for-owners/brand-marketing" },
  { image: imgDining, title: "Demand with the right audience", copy: "Seasonal campaigns, press, private networks, embassies, travel designers, and direct channels focused on qualified guests.", href: "/for-owners/revenue-distribution" },
  { image: imgTeam, title: "Performance without daily friction", copy: "Dynamic rates, calendar management, reservations, guest care, monthly statements, and practical decisions backed by live data.", href: "/for-owners/guest-operations" },
]

function SectionHeading({ eyebrow, title, copy, align = "left" }: { eyebrow: string; title: string; copy?: string; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-gold-dark">{eyebrow}</p>
      <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.6rem)] leading-[1.06] tracking-[-0.02em] text-navy">{title}</h2>
      {copy ? <p className="mt-5 font-sans text-[15px] font-light leading-7 text-navy/68 sm:text-base">{copy}</p> : null}
    </div>
  )
}

function ImagePanel({ src, alt, className = "" }: { src: string | StaticImageData; alt: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-sand-dark ${className}`}>
      <Image src={src} alt={alt} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
    </div>
  )
}

export default function ForOwnersClient({ portfolio, contact, stats, ownerVoice }: {
  portfolio: ForOwnersPortfolioItem[]
  contact: ForOwnersContact
  stats: { properties: number; regions: number }
  ownerVoice: { quote: string; name: string; role: string | null } | null
}) {
  const heroImage = portfolio.find((item) => item.image)?.image || imgVilla
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle")

  async function handleOwnerEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("loading")
    const form = event.currentTarget
    const data = new FormData(form)
    const phone = String(data.get("phone") ?? "").trim()
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"), email: data.get("email"), ...(phone ? { phone } : {}), website: data.get("website") ?? "",
          subject: `Owner Partnership Enquiry: ${data.get("propertyName") || "Property Partnership"}`,
          message: `Property Name: ${data.get("propertyName") || "—"}\nLocation: ${data.get("propertyLocation") || "—"}\nEstimated Units/Bedrooms: ${data.get("units") || "—"}\n\nOwner Note:\n${data.get("message")}`,
        }),
      })
      if (!response.ok) throw new Error("Unable to send enquiry")
      form.reset()
      setStatus("sent")
    } catch {
      setStatus("error")
    }
  }

  const inputClass = "mt-2 min-h-12 w-full border border-navy/16 bg-transparent px-4 py-3 font-sans text-sm text-navy outline-none transition-colors placeholder:text-navy/35 focus:border-gold-dark"

  return (
    <main className="overflow-hidden bg-background text-navy">
      <section className="relative flex min-h-[650px] items-center justify-center overflow-hidden text-center text-cream lg:min-h-[760px]">
        <Image src={heroImage} alt="A Salt Route partner property" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-navy/52" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/65 via-transparent to-navy/35" />
        <CompactContainer className="relative z-10">
          <div className="mx-auto max-w-4xl">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">For distinctive property owners</p>
            <h1 className="mt-6 font-display text-[clamp(2.75rem,6vw,5.75rem)] leading-[0.98] tracking-[-0.02em]">Let your property become a destination.</h1>
            <p className="mx-auto mt-7 max-w-2xl font-sans text-base font-light leading-8 text-cream/88 sm:text-lg">Brand, market, operate, and care for your estate with one hospitality partner—while keeping full ownership and the freedom to return whenever you wish.</p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-5">
              <Link href="#owner-enquiry" className="inline-flex min-h-12 items-center gap-3 bg-gold px-7 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy transition-colors hover:bg-cream">Begin a conversation <ArrowRight className="h-4 w-4" /></Link>
              <Link href="#owner-marketing" className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-cream underline decoration-cream/40 underline-offset-8 hover:decoration-cream">Explore our approach</Link>
            </div>
          </div>
        </CompactContainer>
      </section>

      <section id="performance" className="border-b border-navy/8 bg-white py-16 lg:py-20">
        <CompactContainer>
          <SectionHeading eyebrow="A complete hospitality partnership" title="Everything your property needs to stand apart." copy="Salt Route brings the creative, commercial, and operating disciplines of a luxury hospitality team into one clear relationship." align="center" />
          <div className="mt-14 grid gap-px bg-navy/10 md:grid-cols-3">
            {disciplines.map((item) => { const Icon = item.icon; return (
              <article key={item.title} className="bg-white px-7 py-10 text-center lg:px-10">
                <Icon className="mx-auto h-6 w-6 text-gold-dark" strokeWidth={1.4} />
                <h3 className="mt-5 font-display text-2xl text-navy">{item.title}</h3>
                <p className="mt-3 font-sans text-sm font-light leading-7 text-navy/64">{item.copy}</p>
              </article>
            )})}
          </div>
        </CompactContainer>
      </section>

      <section id="owner-marketing" className="scroll-mt-24 bg-beige py-20 lg:py-28">
        <CompactContainer>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="grid grid-cols-2 gap-3">
              <ImagePanel src={heroImage} alt="Distinctive Nepal property" className="aspect-[3/4]" />
              <ImagePanel src={imgRetreat} alt="Property set in the Himalayan landscape" className="mt-14 aspect-[3/4]" />
            </div>
            <div>
              <SectionHeading eyebrow="Positioning & launch" title="We find the story only your property can tell." copy="Before we sell a room, we define why the place matters. Our team studies the architecture, landscape, local culture, and owner vision, then translates them into a distinctive brand guests can recognise and desire." />
              <ul className="mt-8 grid gap-4 font-sans text-sm text-navy/72 sm:grid-cols-2">
                {["Brand strategy & naming", "Editorial photography", "Cinematic film", "Website & booking journey", "Press and launch campaigns", "Luxury trade introductions"].map((item) => <li key={item} className="flex items-center gap-3 border-t border-navy/10 pt-4"><span className="h-1.5 w-1.5 bg-gold-dark" /> {item}</li>)}
              </ul>
              <Link href="#owner-enquiry" className="mt-9 inline-flex items-center gap-3 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-navy hover:text-gold-dark">Discuss your property <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </CompactContainer>
      </section>

      <section className="relative flex min-h-[520px] items-center justify-center overflow-hidden text-center text-cream">
        <Image src={imgVilla} alt="A beautifully positioned luxury villa" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-navy/62" />
        <CompactContainer className="relative z-10">
          <div className="mx-auto max-w-3xl"><p className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">Marketing with purpose</p><h2 className="mt-5 font-display text-[clamp(2.25rem,5vw,4.75rem)] leading-[1.02]">Create desire before arrival.</h2><p className="mx-auto mt-6 max-w-2xl font-sans text-base font-light leading-8 text-cream/82">Beautiful imagery begins the conversation. Disciplined distribution, direct-booking strategy, and thoughtful guest communication turn that interest into enduring value.</p></div>
        </CompactContainer>
      </section>

      <section className="bg-background py-20 lg:py-28">
        <CompactContainer><div className="grid gap-10 md:grid-cols-3">
          {commercialServices.map((service) => <article key={service.title}><ImagePanel src={service.image} alt={service.title} className="aspect-[4/3]" /><h3 className="mt-6 font-display text-2xl text-navy">{service.title}</h3><p className="mt-3 font-sans text-sm font-light leading-7 text-navy/66">{service.copy}</p><Link href={service.href} className="mt-5 inline-flex items-center gap-2 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-navy hover:text-gold-dark">Explore the service <ArrowRight className="h-3.5 w-3.5" /></Link></article>)}
        </div></CompactContainer>
      </section>

      <section className="bg-beige py-20 lg:py-28">
        <CompactContainer><div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20">
          <ImagePanel src={imgRetreat} alt="A maintained Himalayan retreat" className="aspect-[16/11]" />
          <div><SectionHeading eyebrow="Property enhancement" title="Protect the character. Improve the experience." copy="We create a practical enhancement plan for each home—from arrival sequence and room readiness to local procurement, landscape care, preventive maintenance, and thoughtful design improvements." /><div className="mt-8 grid grid-cols-2 gap-6 border-t border-navy/10 pt-7"><div><ShieldCheck className="h-5 w-5 text-gold-dark" /><p className="mt-3 font-display text-lg">Asset care</p><p className="mt-1 font-sans text-xs leading-5 text-navy/58">Standards, maintenance, and transparent oversight.</p></div><div><Sparkles className="h-5 w-5 text-gold-dark" /><p className="mt-3 font-display text-lg">Guest readiness</p><p className="mt-1 font-sans text-xs leading-5 text-navy/58">Every room, ritual, and touchpoint considered.</p></div></div><Link href="/for-owners/property-enhancement" className="mt-7 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]">Explore property enhancement <ArrowRight className="h-3.5 w-3.5" /></Link></div>
        </div></CompactContainer>
      </section>

      <section className="bg-background py-20 lg:py-28">
        <CompactContainer><div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div><SectionHeading eyebrow="Owner intelligence" title="Clear decisions, without daily management." copy="Owners receive a direct view of reservations, revenue, guest feedback, and maintenance priorities. Our monthly reporting explains what happened, why it matters, and what we recommend next." /><div className="mt-9 grid grid-cols-2 gap-7 sm:grid-cols-3"><div><LineChart className="h-5 w-5 text-gold-dark" /><p className="mt-3 text-xs uppercase tracking-[0.14em] text-navy/62">Revenue strategy</p></div><div><BarChart3 className="h-5 w-5 text-gold-dark" /><p className="mt-3 text-xs uppercase tracking-[0.14em] text-navy/62">Monthly reports</p></div><div><ShieldCheck className="h-5 w-5 text-gold-dark" /><p className="mt-3 text-xs uppercase tracking-[0.14em] text-navy/62">Owner control</p></div></div><Link href="/for-owners/owner-intelligence" className="mt-7 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]">Explore owner reporting <ArrowRight className="h-3.5 w-3.5" /></Link></div>
          <ImagePanel src={imgInterior} alt="Considered luxury property details" className="aspect-[16/11]" />
        </div></CompactContainer>
      </section>

      <section className="bg-navy py-16 text-cream"><CompactContainer><div className="grid gap-8 sm:grid-cols-3">
        <div><p className="font-display text-4xl text-gold">{stats.properties || "—"}</p><p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-cream/58">Curated properties</p></div>
        <div className="border-cream/15 sm:border-l sm:pl-10"><p className="font-display text-4xl text-gold">{stats.regions || "—"}</p><p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-cream/58">Regions represented</p></div>
        <div className="border-cream/15 sm:border-l sm:pl-10"><p className="font-display text-4xl text-gold">100%</p><p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-cream/58">Ownership retained</p></div>
      </div></CompactContainer></section>

      {portfolio.length ? <section id="portfolio" className="bg-beige py-20 lg:py-28"><CompactContainer>
        <SectionHeading eyebrow="Current portfolio" title="Properties with a distinct sense of place." copy="A selection of private homes and small retreats currently represented by Salt Route." align="center" />
        <div className="mt-14 grid gap-8 md:grid-cols-3">{portfolio.slice(0, 3).map((property) => <article key={property.slug} className="bg-white"><Link href={`/properties/${property.slug}`} className="block"><ImagePanel src={property.image || imgRetreat} alt={property.name} className="aspect-[4/3]" /></Link><div className="p-6"><p className="text-[10px] uppercase tracking-[0.18em] text-gold-dark">{property.location}</p><h3 className="mt-2 font-display text-2xl"><Link href={`/properties/${property.slug}`}>{property.name}</Link></h3><p className="mt-3 line-clamp-2 text-sm font-light leading-6 text-navy/62">{property.desc}</p></div></article>)}</div>
      </CompactContainer></section> : null}

      {ownerVoice ? <section className="bg-background py-20 lg:py-28"><CompactContainer><figure className="mx-auto max-w-4xl text-center"><Quote className="mx-auto h-7 w-7 text-gold-dark/50" /><blockquote className="mt-7 font-display text-[clamp(1.6rem,3vw,2.75rem)] italic leading-[1.28] text-navy">“{ownerVoice.quote}”</blockquote><figcaption className="mt-7 text-xs uppercase tracking-[0.16em] text-navy/55">{ownerVoice.name}{ownerVoice.role ? ` · ${ownerVoice.role}` : ""}</figcaption></figure></CompactContainer></section> : null}

      <section id="owner-enquiry" className="scroll-mt-24 border-t border-navy/8 bg-white py-20 lg:py-28">
        <CompactContainer><div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div><SectionHeading eyebrow="Owner partnership" title="Tell us about your property." copy={`Share the setting, current stage, and what you hope to achieve. The ${contact.siteName} team will review it personally and respond within one business day.`} /><div className="mt-9 space-y-4 text-sm text-navy/65"><a href={`mailto:${contact.email}`} className="flex items-center gap-3 hover:text-navy"><Mail className="h-4 w-4 text-gold-dark" />{contact.email}</a><a href={contact.phoneHref} className="flex items-center gap-3 hover:text-navy"><Phone className="h-4 w-4 text-gold-dark" />{contact.phone}</a><p className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />{contact.address}</p></div></div>
          <div className="border border-navy/10 bg-beige p-7 sm:p-10">
            {status === "sent" ? <div className="py-12 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-emerald-700" /><h2 className="mt-5 font-display text-3xl">Thank you.</h2><p className="mx-auto mt-3 max-w-md text-sm leading-7 text-navy/65">Your property details are with our team. We will be in touch within one business day.</p></div> :
            <form onSubmit={handleOwnerEnquiry} className="grid gap-5 sm:grid-cols-2">
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-navy/64">Your name *<input name="name" required minLength={2} maxLength={100} className={inputClass} /></label>
              <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-navy/64">Email *<input name="email" type="email" required className={inputClass} /></label>
              <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-navy/64">Phone<input name="phone" type="tel" className={inputClass} /></label>
              <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-navy/64">Property name *<input name="propertyName" required className={inputClass} /></label>
              <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-navy/64">Location *<input name="propertyLocation" required className={inputClass} /></label>
              <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-navy/64">Bedrooms / keys<input name="units" className={inputClass} /></label>
              <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-navy/64 sm:col-span-2">Your property and goals *<textarea name="message" required minLength={10} maxLength={1800} rows={5} className={`${inputClass} resize-y`} /></label>
              {status === "error" ? <p className="text-sm text-red-700 sm:col-span-2">The enquiry could not be sent. Please try again or email {contact.email}.</p> : null}
              <button type="submit" disabled={status === "loading"} className="min-h-12 bg-navy px-7 text-[10px] font-semibold uppercase tracking-[0.2em] text-cream transition-colors hover:bg-gold-dark disabled:opacity-50 sm:col-span-2">{status === "loading" ? "Sending…" : "Submit property enquiry"}</button>
            </form>}
          </div>
        </div></CompactContainer>
      </section>
    </main>
  )
}
