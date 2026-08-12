"use client"

import { useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import { LuxuryButton } from "@/components/ui/luxury-button"
import { LuxuryLinkWithArrow } from "@/components/ui/luxury-link-with-arrow"
import { KenBurns, ParallaxImage, Reveal, RevealText } from "@/components/public/motion"

// Owned /public artwork — static imports give free blur placeholders.
import imgVillaMain from "@/public/Sunshine Villa Main.png"
import imgRetreatExterior from "@/public/luxury_himalayan_retreat_exterior_1777124225845.png"
import imgTeam from "@/public/luxury_boutique_office_team.png"
import imgPrivateDining from "@/public/private_himalayan_dining_luxury_1777124309093.png"

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

// ── Partnership at a glance (facts ledger under the hero) ───────────────────
const resultsLedger = [
  { value: "30%", label: "Occupancy Lift", note: "first year of partnership" },
  { value: "2.4×", label: "Direct Revenue", note: "vs. unmanaged listings" },
  { value: "48h", label: "Statement Cadence", note: "monthly, on time" },
  { value: "100%", label: "Transparent Payouts", note: "no hidden margins" },
]

// ── The scope of partnership ─────────────────────────────────────────────────
const services = [
  {
    num: "01",
    title: "Positioning & Brand Story",
    desc: "We study the property's setting, history, and character, then shape a narrative that places it in the market with clarity and quiet confidence.",
    points: ["Market positioning", "Editorial photography", "Story & voice"],
  },
  {
    num: "02",
    title: "Listing & Distribution",
    desc: "A considered presence on our platform — gallery flow, calendar, pricing strategy, and policies prepared with you.",
    points: ["Listing build", "Pricing strategy", "Calendar & policies"],
  },
  {
    num: "03",
    title: "Guest Experience & Care",
    desc: "From first enquiry to departure, our team holds the entire stay — concierge, housekeeping coordination, and on-the-ground support.",
    points: ["24/7 concierge", "Housekeeping standards", "On-ground support"],
  },
  {
    num: "04",
    title: "Revenue & Reporting",
    desc: "Transparent monthly statements, clear performance reporting, and honest conversations about pricing, occupancy, and opportunity.",
    points: ["Monthly statements", "Performance reviews", "Owner payouts"],
  },
  {
    num: "05",
    title: "Maintenance & Stewardship",
    desc: "Preventive maintenance, seasonal checks, vendor coordination, and a quiet eye on the building so it ages gracefully.",
    points: ["Preventive care", "Vendor management", "Emergency response"],
  },
  {
    num: "06",
    title: "Community & Sustainability",
    desc: "Local employment, fair wages, environmental responsibility, and reinvestment in the communities that host our guests.",
    points: ["Local hiring", "Energy efficiency", "Community reinvestment"],
  },
]

// ── Brand and market growth ───────────────────────────────────────────────
const marketingCapabilities = [
  {
    title: "Positioning & Identity",
    desc: "A clear guest promise, audience, voice, and visual direction rooted in the property itself.",
  },
  {
    title: "Photography & Content",
    desc: "Editorial photography, film, copy, and social content that let guests feel the stay before they arrive.",
  },
  {
    title: "Digital Presence & Distribution",
    desc: "A considered website and listing presence, search visibility, social channels, and the right partner platforms.",
  },
  {
    title: "Campaigns & Performance",
    desc: "Seasonal campaigns, pricing, offers, and transparent reporting that turn visibility into sustainable revenue.",
  },
]

// ── Four steps into partnership ──────────────────────────────────────────────
const steps = [
  {
    num: "01",
    title: "Share Your Property",
    desc: "Send us a few details about your property and your story. We read every enquiry personally and respond within one business day.",
  },
  {
    num: "02",
    title: "A Visit & A Conversation",
    desc: "We walk the grounds, listen to your priorities, and discuss how we would hold the day-to-day and the long-term position together.",
  },
  {
    num: "03",
    title: "Onboarding & Launch",
    desc: "Photography, editorial copy, calendars, pricing, and policies — prepared with you, reviewed by you. Then your property goes live.",
  },
  {
    num: "04",
    title: "Hosting & Reporting",
    desc: "We manage reservations, guest care, and maintenance. You receive steady updates and your share of revenue on a calm rhythm.",
  },
]

// ── Principles — the conditions of partnership ───────────────────────────────
const principles = [
  {
    num: "01",
    title: "One Property, One Story",
    desc: "We never apply a template. Each property receives its own positioning, its own voice, its own standard of care.",
  },
  {
    num: "02",
    title: "Local Roots, Global Standards",
    desc: "Our teams live in the regions we operate in. We hire locally, train carefully, and hold ourselves to the standards of the world's finest houses.",
  },
  {
    num: "03",
    title: "Transparency as Default",
    desc: "Every booking and every guest interaction is visible to you. Monthly statements, open reporting — no black boxes, no surprises.",
  },
  {
    num: "04",
    title: "Stewardship, Not Extraction",
    desc: "We manage for seasons and decades, not for a single quarter's occupancy. The buildings we care for should age well and welcome well.",
  },
]

const testimonials = [
  {
    quote:
      "They understood the property before they understood the paperwork. That is rare. The first season was the best we have had in nine years of operating.",
    author: "Owner",
    property: "Heritage Villa, Bhaktapur",
  },
  {
    quote:
      "What I value most is the calm. I hear from them when it matters, I see the statements on time, and I never have to wonder whether the house is being looked after.",
    author: "Owner",
    property: "Mountain Lodge, Bandipur",
  },
  {
    quote:
      "The standard of guest care is something I could never have built alone. The team treats the property as if their name were on the door.",
    author: "Owner",
    property: "Riverside Retreat, Pokhara",
  },
]

export default function ForOwnersClient({
  portfolio,
  contact,
}: {
  portfolio: ForOwnersPortfolioItem[]
  contact: ForOwnersContact
}) {
  const heroImage = portfolio.find((item) => item.image)?.image ?? imgVillaMain
  const [ownerEnquiryStatus, setOwnerEnquiryStatus] = useState<"idle" | "loading" | "sent" | "error">("idle")

  async function handleOwnerEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setOwnerEnquiryStatus("loading")
    const form = event.currentTarget
    const formData = new FormData(form)
    const phone = String(formData.get("phone") ?? "").trim()

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          // Only include phone when provided — the API schema rejects null.
          ...(phone ? { phone } : {}),
          website: formData.get("website") ?? "",
          subject: "Owner Partnership Enquiry",
          message: `Property: ${formData.get("propertyName") || "—"} at ${formData.get("propertyLocation") || "—"}\n\n${formData.get("message")}`,
        }),
      })
      if (!response.ok) throw new Error("Failed")
      form.reset()
      setOwnerEnquiryStatus("sent")
    } catch {
      setOwnerEnquiryStatus("error")
    }
  }

  return (
    <div className="bg-background text-charcoal min-h-screen">

      {/* ─── 1 · HERO — compact, bottom-left anchored ─── */}
      <section className="relative h-[64svh] min-h-[520px] md:h-[74vh] w-full flex items-end bg-charcoal overflow-hidden">
        <div className="absolute inset-0 z-0">
          <KenBurns className="h-full w-full">
            <Image
              src={heroImage}
              alt="A Salt Route managed property"
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </KenBurns>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/30" />
        </div>

        <div className="relative z-10 w-full max-w-screen-xl mx-auto px-6 md:px-12 pb-24 md:pb-28">
          <Reveal delay={0.15} y={16}>
            <p className="text-[11px] md:text-[12px] uppercase tracking-[0.28em] text-white/65 font-medium mb-5">
              For Property Owners
            </p>
          </Reveal>
          <RevealText
            as="h1"
            lines={["Your property,", "held to a standard."]}
            delay={0.3}
            className="font-display font-normal text-white leading-[1.08] tracking-[-0.02em] text-[clamp(2.5rem,5.5vw,4.5rem)]"
          />
          <Reveal delay={0.55} y={16}>
            <div className="mt-7 md:mt-9 border-t border-white/20 pt-6 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <p className="max-w-md text-[14px] md:text-[15px] text-white/70 font-light leading-[1.8]">
                A long-term partnership for distinctive properties across the
                Himalayan range — built on the standards of the world&rsquo;s finest
                houses, delivered with the warmth of a host community.
              </p>
              <div className="flex items-center gap-8 shrink-0">
                <LuxuryButton href="#owner-enquiry" variant="primary" dark>
                  List Your Property
                </LuxuryButton>
                <LuxuryLinkWithArrow href="#portfolio" color="white">
                  View Portfolio
                </LuxuryLinkWithArrow>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 2 · RESULTS LEDGER — cream panel docked over the hero edge,
             mirroring the stay page's booking bar ─── */}
      <section className="relative z-20 -mt-14 md:-mt-16 px-4 sm:px-6 md:px-12">
        <div className="max-w-screen-xl mx-auto bg-cream border border-navy/10 px-6 md:px-10 py-6 md:py-7">
          <Reveal stagger={0.06} className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 lg:divide-x divide-navy/10">
            {resultsLedger.map((stat, i) => (
              <Reveal.Item key={stat.label} className={`lg:px-10 ${i === 0 ? "lg:pl-0" : ""}`}>
                <p className="font-display font-normal text-navy leading-none tracking-[-0.02em] text-3xl md:text-[2.75rem]">
                  {stat.value}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-navy/55 font-medium mt-2.5">
                  {stat.label}
                </p>
                <p className="text-[12px] text-charcoal/45 font-light mt-1">{stat.note}</p>
              </Reveal.Item>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ─── 3 · WHY SALT ROUTE — editorial split, drop-cap ─── */}
      <section className="py-10 md:py-16 bg-white overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-x-16 items-center">
            <div className="lg:col-span-6 space-y-6">
              <Reveal className="space-y-5">
                <p className="type-eyebrow">Why Salt Route</p>
                <h2 className="type-h2">
                  Hospitality value,
                  <br />
                  not paperwork.
                </h2>
              </Reveal>
              <Reveal delay={0.12} className="space-y-5">
                <p className="type-body max-w-xl first-letter:font-display first-letter:text-5xl first-letter:float-left first-letter:leading-[0.85] first-letter:mr-3 first-letter:text-navy">
                  We take time to understand what makes each property unrepeatable —
                  the setting, the light, the way the morning arrives, the kind of
                  guest it deserves — and build a long-term position around it. Not
                  a template. Not a pipeline. A relationship measured in seasons.
                </p>
                <p className="type-body max-w-xl">
                  The difference between a listing and a legacy is care. We bring the
                  care, the systems, and the people — you bring the property and the
                  trust. Everything else, we hold.
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <LuxuryLinkWithArrow href="#approach" color="charcoal">
                  Our Approach
                </LuxuryLinkWithArrow>
              </Reveal>
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <ParallaxImage className="aspect-[4/3] lg:aspect-[3/4]" speed={0.08}>
                <Image
                  src={imgRetreatExterior}
                  alt="A managed Salt Route property at altitude"
                  fill
                  placeholder="blur"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </ParallaxImage>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4 · THE PATH — four steps on one hairline rail ─── */}
      <section id="approach" className="bg-sand py-10 md:py-16 overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <Reveal className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-4 max-w-xl">
              <p className="type-eyebrow">Steps for Owners</p>
              <h2 className="type-h2">
                Four steps, from first call
                <br />
                to first guest.
              </h2>
            </div>
            <p className="type-body text-[14px] max-w-sm">
              A simple, unhurried path into partnership — always a relationship,
              never a checklist.
            </p>
          </Reveal>

          <Reveal stagger={0.08} className="grid sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <Reveal.Item
                key={step.num}
                className="relative border-t border-navy/15 pt-8 pb-6 lg:pb-0 lg:pr-8"
              >
                <span
                  className="absolute -top-4 left-0 bg-sand pr-4 font-display text-2xl md:text-3xl text-gold/60 leading-none"
                  aria-hidden
                >
                  {step.num}
                </span>
                <h3 className="type-h3">{step.title}</h3>
                <p className="type-body text-[13px] md:text-[14px] mt-3 max-w-xs">
                  {step.desc}
                </p>
              </Reveal.Item>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ─── 5 · THE SCOPE — six services as dense hairline rows ─── */}
      <section className="py-10 md:py-16 bg-white overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <Reveal className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <p className="type-eyebrow">The Scope of Partnership</p>
              <h2 className="type-h2">
                Everything we hold,
                <br />
                so you don&rsquo;t have to.
              </h2>
            </div>
            <p className="type-body text-[14px] max-w-sm">
              From the first conversation to the last guest of the season, every
              detail is held by a team that treats the property as their own.
            </p>
          </Reveal>

          <Reveal stagger={0.06} className="grid lg:grid-cols-2 gap-x-16 border-t border-charcoal/10">
            {services.map((s) => (
              <Reveal.Item key={s.num}>
                <div className="grid grid-cols-[3rem_1fr] gap-4 py-6 md:py-7 border-b border-charcoal/10">
                  <span className="font-display text-xl md:text-2xl text-gold/60 leading-none pt-1">
                    {s.num}
                  </span>
                  <div>
                    <h3 className="type-h3">{s.title}</h3>
                    <p className="text-[13px] md:text-[14px] text-charcoal/55 leading-[1.75] font-light mt-2 max-w-xl">
                      {s.desc}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-charcoal/40 font-medium mt-3">
                      {s.points.join("  ·  ")}
                    </p>
                  </div>
                </div>
              </Reveal.Item>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ─── 5b · MARKETING & BRAND GROWTH — asymmetric capability ledger ─── */}
      <section id="owner-marketing" className="bg-sand py-14 md:py-20 overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-x-16">
            <Reveal className="lg:col-span-5 space-y-6">
              <p className="type-eyebrow">Marketing &amp; Brand Growth</p>
              <h2 className="type-h2">
                Seen clearly.
                <br />
                Chosen for the right reasons.
              </h2>
              <p className="type-body max-w-md">
                We shape how your property is presented, found, and remembered
                &mdash; then carry that story across every channel with discipline.
              </p>
              <LuxuryLinkWithArrow href="#owner-enquiry" color="charcoal">
                Discuss Your Property
              </LuxuryLinkWithArrow>
            </Reveal>

            <Reveal
              stagger={0.07}
              className="lg:col-span-6 lg:col-start-7 border-t border-navy/15"
            >
              {marketingCapabilities.map((capability) => (
                <Reveal.Item key={capability.title}>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-y-2 md:gap-x-8 py-6 md:py-7 border-b border-navy/15">
                    <h3 className="type-h3 md:col-span-2">{capability.title}</h3>
                    <p className="type-body text-[13px] md:text-[14px] md:col-span-3">
                      {capability.desc}
                    </p>
                  </div>
                </Reveal.Item>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── 5c · PHOTO BREATH — text-free full-bleed band ─── */}
      <section className="relative h-[36vh] md:h-[48vh] w-full overflow-hidden bg-navy">
        <ParallaxImage speed={0.1} className="absolute inset-0">
          <Image
            src={imgPrivateDining}
            alt="A private dining moment at a managed property"
            fill
            placeholder="blur"
            sizes="100vw"
            className="object-cover"
          />
        </ParallaxImage>
      </section>

      {/* ─── 6 · PRINCIPLES — the one dark editorial moment ─── */}
      <section className="bg-navy py-14 md:py-20 overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-x-16">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28 space-y-6">
                <Reveal className="space-y-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80 font-medium">
                    Our Philosophy
                  </p>
                  <h2 className="font-display font-normal text-white leading-[1.1] tracking-[-0.01em] text-[clamp(1.85rem,3.2vw,2.9rem)]">
                    Four principles,
                    <br />
                    held without exception.
                  </h2>
                  <p className="text-[14px] text-white/50 leading-[1.8] font-light max-w-sm">
                    These are not aspirations — they are the conditions of
                    partnership.
                  </p>
                </Reveal>
                <Reveal delay={0.15} className="hidden lg:block">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={imgTeam}
                      alt="The Salt Route team"
                      fill
                      placeholder="blur"
                      sizes="30vw"
                      className="object-cover"
                    />
                  </div>
                </Reveal>
              </div>
            </div>

            <Reveal stagger={0.08} className="lg:col-span-8 border-t border-white/15">
              {principles.map((p) => (
                <Reveal.Item key={p.num}>
                  <div className="grid grid-cols-[3rem_1fr] gap-4 py-6 md:py-7 border-b border-white/15">
                    <span className="font-display text-xl md:text-2xl text-gold/50 leading-none pt-1">
                      {p.num}
                    </span>
                    <div>
                      <h3 className="font-display text-xl md:text-2xl text-white leading-[1.2] tracking-[-0.01em]">
                        {p.title}
                      </h3>
                      <p className="text-[13px] md:text-[14px] text-white/50 leading-[1.8] font-light mt-2 max-w-xl">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                </Reveal.Item>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── 7 · PORTFOLIO — compact grid with property facts ─── */}
      <section id="portfolio" className="py-10 md:py-16 bg-white scroll-mt-24">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <Reveal className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-xl">
              <p className="type-eyebrow">Managed Properties</p>
              <h2 className="type-h2">Signature managed stays.</h2>
            </div>
            <LuxuryLinkWithArrow href="/properties" className="shrink-0">
              View Full Collection
            </LuxuryLinkWithArrow>
          </Reveal>

          {portfolio.length === 0 ? (
            <div className="border-y border-charcoal/10 py-16 md:py-20 px-8 text-center space-y-5">
              <p className="font-display text-2xl md:text-3xl tracking-wide text-charcoal/40">
                Portfolio coming soon
              </p>
              <p className="font-sans text-[14px] text-charcoal/50 font-light max-w-xl mx-auto leading-[1.8]">
                New managed properties will appear here as they are ready to
                welcome guests. We onboard carefully, never in volume.
              </p>
            </div>
          ) : (
            <Reveal stagger={0.08} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {portfolio.slice(0, 6).map((property) => (
                <Reveal.Item key={property.slug} className="group">
                  <Link href={`/properties/${property.slug}`} className="block h-full">
                    <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                      <Image
                        src={property.image || imgVillaMain}
                        alt={property.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-[var(--ease-out-luxe)] group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="pt-5 space-y-2">
                      <p className="type-caption">{property.location}</p>
                      <h3 className="font-display text-xl md:text-2xl text-charcoal leading-[1.15] tracking-[-0.01em] group-hover:text-gold transition-colors duration-500">
                        {property.name}
                      </h3>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-charcoal/45 font-medium">
                        {property.maxGuests} guests · {property.bedrooms}{" "}
                        {property.bedrooms === 1 ? "bedroom" : "bedrooms"} ·{" "}
                        {property.bathrooms} {property.bathrooms === 1 ? "bath" : "baths"}
                      </p>
                    </div>
                  </Link>
                </Reveal.Item>
              ))}
            </Reveal>
          )}
        </div>
      </section>

      {/* ─── 8 · OWNER VOICES — lead quote + two side quotes ─── */}
      <section className="py-10 md:py-16 bg-sand overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-x-16">
            <div className="lg:col-span-6 space-y-8">
              <Reveal className="space-y-4">
                <p className="type-eyebrow">Owner Voices</p>
                <h2 className="type-h2">What our partners say.</h2>
              </Reveal>
              <Reveal delay={0.1}>
                <blockquote className="font-display font-light text-xl md:text-[1.65rem] text-charcoal leading-[1.4] tracking-[-0.01em] max-w-xl">
                  &ldquo;{testimonials[0].quote}&rdquo;
                </blockquote>
                <p className="mt-5 text-[10px] uppercase tracking-[0.2em] text-charcoal/50 font-medium">
                  {testimonials[0].author} · {testimonials[0].property}
                </p>
              </Reveal>
            </div>
            <Reveal stagger={0.1} className="lg:col-span-5 lg:col-start-8 lg:pt-2">
              {testimonials.slice(1).map((t) => (
                <Reveal.Item key={t.property}>
                  <div className="border-t border-charcoal/15 py-6 md:py-7">
                    <p className="type-body text-[14px]">&ldquo;{t.quote}&rdquo;</p>
                    <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-charcoal/50 font-medium">
                      {t.author} · {t.property}
                    </p>
                  </div>
                </Reveal.Item>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── 9 · ENQUIRY — the page's close, one primary CTA ─── */}
      <section id="owner-enquiry" className="py-14 md:py-20 bg-charcoal text-white scroll-mt-24">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-x-20">

            <div className="lg:col-span-5 space-y-8">
              <Reveal className="space-y-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/40 font-medium">
                  Partner With {contact.siteName}
                </p>
                <h2 className="font-display font-normal text-white leading-[1.1] tracking-[-0.01em] text-[clamp(2rem,4vw,3.25rem)]">
                  Tell us about
                  <br />
                  your property.
                </h2>
                <p className="font-sans text-[14px] md:text-[15px] text-white/50 leading-[1.85] font-light max-w-md">
                  Share what you have, what you&rsquo;ve imagined for it, and what
                  you&rsquo;re unsure about. We read every enquiry personally and
                  reply within one business day — with a real response, not a
                  template.
                </p>
              </Reveal>

              <Reveal delay={0.15} className="pt-8 border-t border-white/10 space-y-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-gold/70 font-medium">
                  Or Reach Us Directly
                </p>
                <div className="space-y-2.5">
                  <a
                    href={`mailto:${contact.email}`}
                    className="block text-[14px] text-white/70 hover:text-gold transition-colors duration-500 font-light tracking-wide"
                  >
                    {contact.email}
                  </a>
                  <a
                    href={contact.phoneHref}
                    className="block text-[14px] text-white/70 hover:text-gold transition-colors duration-500 font-light tracking-wide"
                  >
                    {contact.phone}
                  </a>
                  <p className="text-[12px] text-white/35 font-light leading-relaxed">
                    {contact.address}
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <Reveal className="border border-white/10 bg-navy-dark/40 p-7 md:p-10">
                {ownerEnquiryStatus === "sent" ? (
                  <div className="text-center space-y-6 py-8">
                    <Sparkles className="w-10 h-10 text-gold mx-auto" strokeWidth={1} />
                    <h3 className="font-display text-3xl text-white tracking-[-0.01em]">
                      Enquiry Sent.
                    </h3>
                    <p className="text-white/50 font-light leading-[1.8]">
                      The {contact.siteName} team will be in touch within one
                      business day.
                    </p>
                    <LuxuryButton onClick={() => setOwnerEnquiryStatus("idle")} dark>
                      Send Another
                    </LuxuryButton>
                  </div>
                ) : (
                  <form onSubmit={handleOwnerEnquiry} className="space-y-7">
                    {/* Honeypot — hidden from humans, catches bots. */}
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      className="hidden"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                      <div className="space-y-2.5">
                        <label className="text-[10px] uppercase tracking-[0.24em] font-medium text-white/45">
                          Name
                        </label>
                        <input
                          name="name"
                          required
                          className="w-full bg-transparent border-b border-white/15 pb-3 text-white placeholder:text-white/15 focus:outline-none focus:border-gold transition-colors font-light"
                          placeholder="Full name"
                        />
                      </div>
                      <div className="space-y-2.5">
                        <label className="text-[10px] uppercase tracking-[0.24em] font-medium text-white/45">
                          Email
                        </label>
                        <input
                          name="email"
                          type="email"
                          required
                          className="w-full bg-transparent border-b border-white/15 pb-3 text-white placeholder:text-white/15 focus:outline-none focus:border-gold transition-colors font-light"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                      <div className="space-y-2.5">
                        <label className="text-[10px] uppercase tracking-[0.24em] font-medium text-white/45">
                          Phone <span className="text-white/25 normal-case tracking-normal">(optional)</span>
                        </label>
                        <input
                          name="phone"
                          type="tel"
                          className="w-full bg-transparent border-b border-white/15 pb-3 text-white placeholder:text-white/15 focus:outline-none focus:border-gold transition-colors font-light"
                          placeholder="+977 ..."
                        />
                      </div>
                      <div className="space-y-2.5">
                        <label className="text-[10px] uppercase tracking-[0.24em] font-medium text-white/45">
                          Property Name
                        </label>
                        <input
                          name="propertyName"
                          className="w-full bg-transparent border-b border-white/15 pb-3 text-white placeholder:text-white/15 focus:outline-none focus:border-gold transition-colors font-light"
                          placeholder="Villa, Retreat, Estate"
                        />
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[10px] uppercase tracking-[0.24em] font-medium text-white/45">
                        Location
                      </label>
                      <input
                        name="propertyLocation"
                        className="w-full bg-transparent border-b border-white/15 pb-3 text-white placeholder:text-white/15 focus:outline-none focus:border-gold transition-colors font-light"
                        placeholder="City, Region"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[10px] uppercase tracking-[0.24em] font-medium text-white/45">
                        Tell us about the property
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        className="w-full bg-transparent border-b border-white/15 pb-3 text-white placeholder:text-white/15 focus:outline-none focus:border-gold transition-colors resize-none font-light leading-[1.8]"
                        placeholder="Setting, hosting style, what makes it distinctive, what you hope a partnership could look like..."
                      />
                    </div>
                    {ownerEnquiryStatus === "error" && (
                      <p className="text-[12px] text-red-300/80 font-light">
                        Something didn&rsquo;t send. Please try once more, or write
                        to us directly.
                      </p>
                    )}
                    <LuxuryButton
                      type="submit"
                      variant="primary"
                      dark
                      disabled={ownerEnquiryStatus === "loading"}
                      className="w-full"
                    >
                      {ownerEnquiryStatus === "loading" ? "Sending..." : "Send Partnership Enquiry"}
                    </LuxuryButton>
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
