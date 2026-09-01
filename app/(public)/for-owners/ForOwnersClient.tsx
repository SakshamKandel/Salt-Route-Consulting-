"use client"

import { useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  CompactButton,
  CompactContainer,
  CompactHeading,
  CompactImageText,
  CompactMediaCard,
  CompactSection,
} from "@/components/public/Compact"
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

const services = [
  {
    image: imgInterior,
    alt: "Distinctive property brand details",
    title: "Positioning and story",
    copy: "A clear guest promise, confident market position, photography, and copy rooted in the property itself.",
    href: "#owner-enquiry",
    action: "Discuss your property",
  },
  {
    image: imgDining,
    alt: "Guest experience and private dining",
    title: "Guest experience and care",
    copy: "Reservations, concierge, housekeeping standards, local coordination, and consistent attention throughout the stay.",
    href: "#owner-enquiry",
    action: "Discuss operations",
  },
  {
    image: imgTeam,
    alt: "Salt Route property management team",
    title: "Revenue and reporting",
    copy: "Pricing, distribution, performance review, owner communication, and transparent reporting without hidden complexity.",
    href: "#owner-enquiry",
    action: "Discuss performance",
  },
]

const steps = [
  ["Share the property", "Send the location, property details, and what you want the partnership to achieve."],
  ["Visit and assess", "We walk the property, listen to your priorities, and identify the right operating model."],
  ["Prepare and launch", "Positioning, photography, content, standards, calendars, and pricing are prepared with you."],
  ["Host and improve", "We manage guest care, review performance, and keep the property moving forward."],
] as const

export default function ForOwnersClient({
  portfolio,
  contact,
}: {
  portfolio: ForOwnersPortfolioItem[]
  contact: ForOwnersContact
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
          name: data.get("name"),
          email: data.get("email"),
          ...(phone ? { phone } : {}),
          website: data.get("website") ?? "",
          subject: "Owner Partnership Enquiry",
          message: `Property: ${data.get("propertyName") || "—"} at ${data.get("propertyLocation") || "—"}\n\n${data.get("message")}`,
        }),
      })
      if (!response.ok) throw new Error("Unable to send enquiry")
      form.reset()
      setStatus("sent")
    } catch {
      setStatus("error")
    }
  }

  const inputClass =
    "mt-2 min-h-12 w-full border border-navy/14 bg-white px-4 py-3 font-sans text-base text-navy outline-none focus:border-navy"

  return (
    <div className="min-h-screen bg-background text-navy">
      <section className="relative min-h-[520px] overflow-hidden sm:min-h-[600px]">
        <Image src={heroImage} alt="A Salt Route partner property" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/36" />
        <CompactContainer className="relative flex min-h-[520px] items-end pb-9 text-cream sm:min-h-[600px] sm:pb-12">
          <div className="max-w-2xl">
            <p className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-cream/80">For property owners</p>
            <h1 className="mt-3 font-display text-[clamp(2.75rem,5vw,5rem)] leading-[1] tracking-[-0.02em]">Your property, thoughtfully positioned and cared for.</h1>
            <p className="mt-4 max-w-xl font-sans text-base font-light leading-7 text-cream/88 sm:text-lg">
              Hospitality strategy, market presence, guest care, and practical management for distinctive properties in Nepal.
            </p>
            <CompactButton href="#owner-enquiry" className="mt-6">Discuss your property</CompactButton>
          </div>
        </CompactContainer>
      </section>

      <CompactSection>
        <CompactHeading
          eyebrow="The partnership"
          title="A clear approach from positioning to daily hospitality."
          copy="We connect the commercial and operational parts of the property so the guest promise is carried through consistently."
        />
        <div className="mt-7 grid gap-7 md:grid-cols-3">
          {services.map((service) => <CompactMediaCard key={service.title} {...service} />)}
        </div>
      </CompactSection>

      <CompactSection className="bg-beige" id="owner-marketing">
        <CompactImageText
          image={imgTeam}
          alt="Salt Route hospitality and marketing team"
          eyebrow="Market presence"
          title="A property story that is clear, specific, and easy to discover."
          copy="We shape positioning, photography, content, listings, distribution, seasonal campaigns, and performance reporting around the property's real strengths."
          href="#owner-enquiry"
          action="Start a conversation"
        />
      </CompactSection>

      {portfolio.length ? (
        <CompactSection id="portfolio">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <CompactHeading
              eyebrow="Current collection"
              title="Properties represented by Salt Route."
              copy="A selection of active stays currently connected to the Salt Route platform."
            />
            <CompactButton href="/properties" tone="text">View guest collection</CompactButton>
          </div>
          <div className="mt-7 grid gap-7 md:grid-cols-3">
            {portfolio.slice(0, 6).map((property) => (
              <article key={property.slug}>
                <Link href={`/properties/${property.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-sand-dark">
                  <Image
                    src={property.image || imgRetreat}
                    alt={property.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 hover:scale-[1.02]"
                  />
                </Link>
                <p className="mt-4 font-sans text-[10px] uppercase tracking-[0.14em] text-navy/52">{property.location}</p>
                <h2 className="mt-1 font-display text-2xl text-navy">{property.name}</h2>
                <p className="mt-2 line-clamp-2 font-sans text-[15px] font-light leading-6 text-navy/68">{property.desc}</p>
              </article>
            ))}
          </div>
        </CompactSection>
      ) : null}

      <CompactSection className="bg-sand">
        <CompactHeading
          eyebrow="How it begins"
          title="Four straightforward stages."
          copy="Enough structure to move carefully, without turning the relationship into a complicated process."
        />
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([title, copy], index) => (
            <article key={title} className="bg-white p-5">
              <p className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-gold-dark">0{index + 1}</p>
              <h3 className="mt-2 font-display text-2xl text-navy">{title}</h3>
              <p className="mt-2 font-sans text-[15px] font-light leading-6 text-navy/68">{copy}</p>
            </article>
          ))}
        </div>
      </CompactSection>

      <CompactSection id="owner-enquiry">
        <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:gap-12">
          <div>
            <CompactHeading
              eyebrow="Owner enquiry"
              title="Tell us about the property."
              copy={`Share the essentials and the ${contact.siteName} team will respond within one business day.`}
            />
            <div className="mt-5 space-y-1 font-sans text-sm text-navy/68">
              <a href={`mailto:${contact.email}`} className="block hover:text-navy">{contact.email}</a>
              <a href={contact.phoneHref} className="block hover:text-navy">{contact.phone}</a>
              <p>{contact.address}</p>
            </div>
          </div>

          <div className="bg-beige p-5 sm:p-7">
            {status === "sent" ? (
              <div className="py-8">
                <h2 className="font-display text-3xl text-navy">Thank you.</h2>
                <p className="mt-3 font-sans text-base font-light leading-7 text-navy/70">Your property enquiry has been received. Our team will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleOwnerEnquiry} className="grid gap-5 sm:grid-cols-2">
                <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                <label className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-navy/62">Your name<input name="name" required minLength={2} maxLength={100} className={inputClass} /></label>
                <label className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-navy/62">Email<input name="email" type="email" required className={inputClass} /></label>
                <label className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-navy/62">Phone<input name="phone" type="tel" className={inputClass} /></label>
                <label className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-navy/62">Property name<input name="propertyName" required className={inputClass} /></label>
                <label className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-navy/62 sm:col-span-2">Property location<input name="propertyLocation" required className={inputClass} /></label>
                <label className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-navy/62 sm:col-span-2">Tell us about the property<textarea name="message" required minLength={10} maxLength={1800} rows={5} className={`${inputClass} resize-y`} /></label>
                {status === "error" ? <p className="font-sans text-sm text-red-700 sm:col-span-2">The enquiry could not be sent. Please try again or contact us directly.</p> : null}
                <button type="submit" disabled={status === "loading"} className="min-h-12 bg-navy px-6 font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-cream hover:bg-navy-dark disabled:opacity-50 sm:col-span-2">
                  {status === "loading" ? "Sending…" : "Send owner enquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      </CompactSection>
    </div>
  )
}
