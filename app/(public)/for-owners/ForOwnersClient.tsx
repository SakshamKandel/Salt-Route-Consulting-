"use client"

import { useState, type FormEvent, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BadgeCheck,
  BedDouble,
  Building2,
  CalendarCheck,
  Camera,
  HeartHandshake,
  Home,
  LineChart,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"

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

type IconType = typeof Home

const fallbackPortfolio: ForOwnersPortfolioItem[] = [
  {
    slug: "sunshine-villa-ilam",
    name: "Sunshine Villa Ilam",
    location: "Ilam, Eastern Nepal",
    desc: "A premium villa retreat surrounded by Ilam's tea gardens, fresh air, quiet hills, and slow hospitality.",
    image: "/Sunshine%20Villa%20Main.png",
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 6,
    featured: true,
  },
  {
    slug: "sungava-residences-pokhara",
    name: "Sungava Residences",
    location: "Sungava Phulbari, Pokhara",
    desc: "A fully furnished 3BHK residence with mountain-view bedrooms, a teal open-plan kitchen, and easy Lakeside access.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1800&auto=format&fit=crop",
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    featured: false,
  },
]

const ownerPromises = [
  {
    icon: Camera,
    title: "Property Presentation",
    desc: "Photography, gallery flow, feature writing, and guest-ready listing pages that make each asset feel intentional.",
  },
  {
    icon: CalendarCheck,
    title: "Booking Readiness",
    desc: "Calendar visibility, reservation tracking, guest notes, and owner updates arranged around the property itself.",
  },
  {
    icon: LineChart,
    title: "Performance Discipline",
    desc: "Revenue, arrivals, completed stays, reviews, and portfolio signals shaped for quick owner decisions at scale.",
  },
  {
    icon: HeartHandshake,
    title: "People-First Care",
    desc: "A direct Salt Route channel for edits, housekeeping notes, guest needs, and operational support.",
  },
]

const operatingModel = [
  {
    step: "01",
    title: "Position",
    desc: "We define the property's market promise, guest profile, room story, location context, and owner goals.",
  },
  {
    step: "02",
    title: "Prepare",
    desc: "We shape listing copy, amenities, photos, house rules, pricing structure, and the first operational checklist.",
  },
  {
    step: "03",
    title: "Publish",
    desc: "We launch with clear enquiry paths, mobile-first pages, public guest views, and owner-side property visibility.",
  },
  {
    step: "04",
    title: "Perform",
    desc: "We keep watching arrivals, guest communication, revenue movement, reviews, and improvement requests.",
  },
]

const portalViews = [
  {
    icon: Home,
    title: "Portfolio Rooms",
    desc: "Each property opens with its own gallery, highlights, amenities, reviews, and revenue signals.",
  },
  {
    icon: Users,
    title: "Guest Movement",
    desc: "Owners see arrivals, stay dates, guest counts, and booking value without searching through admin clutter.",
  },
  {
    icon: MessageCircle,
    title: "Owner Requests",
    desc: "Calendar blocks, price changes, images, amenities, and description updates are routed from one place.",
  },
]

const standards = [
  "Ethical operations",
  "Local employment",
  "Sustainable practices",
  "Guest-first hospitality",
  "Global standards",
  "Community value",
]

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <span className={light ? "h-px w-9 bg-gold/60" : "h-px w-9 bg-gold/70"} />
      <p
        className={`text-[10px] uppercase tracking-[0.38em] font-medium ${
          light ? "text-sand/70" : "text-charcoal/55"
        }`}
      >
        {children}
      </p>
    </div>
  )
}

function IconBlock({
  icon: Icon,
  title,
  desc,
  dark = false,
}: {
  icon: IconType
  title: string
  desc: string
  dark?: boolean
}) {
  return (
    <div
      className={`group flex min-h-[260px] flex-col justify-between p-7 transition-colors duration-500 ${
        dark ? "bg-[#0A1826] hover:bg-[#0F2133]" : "bg-white hover:bg-[#F8F4EC]"
      }`}
    >
      <Icon
        className={`h-5 w-5 stroke-[1.3] transition-colors duration-500 ${
          dark ? "text-gold/55 group-hover:text-gold" : "text-charcoal/35 group-hover:text-gold"
        }`}
      />
      <div className="space-y-4">
        <h3 className={`font-display text-2xl tracking-wide ${dark ? "text-sand/85" : "text-charcoal"}`}>
          {title}
        </h3>
        <p className={`text-sm font-light leading-[1.85] ${dark ? "text-sand/43" : "text-charcoal/58"}`}>
          {desc}
        </p>
      </div>
    </div>
  )
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-white/18 pt-4">
      <p className="font-display text-3xl text-white tracking-wide">{value}</p>
      <p className="mt-2 text-[9px] uppercase tracking-[0.28em] text-white/55">{label}</p>
    </div>
  )
}

export default function ForOwnersClient({ portfolio }: { portfolio: ForOwnersPortfolioItem[] }) {
  const featuredPortfolio = portfolio.length > 0 ? portfolio : fallbackPortfolio
  const heroImage = featuredPortfolio.find((item) => item.image)?.image ?? "/Sunshine%20Villa%20Main.png"
  const heroProperty = featuredPortfolio[0]
  const propertyCount = Math.max(featuredPortfolio.length, portfolio.length)
  const [ownerEnquiryStatus, setOwnerEnquiryStatus] = useState<"idle" | "loading" | "sent" | "error">("idle")

  async function handleOwnerEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setOwnerEnquiryStatus("loading")

    const form = event.currentTarget
    const formData = new FormData(form)
    const name = String(formData.get("name") || "")
    const email = String(formData.get("email") || "")
    const phone = String(formData.get("phone") || "")
    const propertyName = String(formData.get("propertyName") || "")
    const propertyLocation = String(formData.get("propertyLocation") || "")
    const message = String(formData.get("message") || "")

    const composedMessage = [
      `Owner property enquiry`,
      propertyName ? `Property: ${propertyName}` : "",
      propertyLocation ? `Location: ${propertyLocation}` : "",
      message,
    ].filter(Boolean).join("\n\n").slice(0, 2000)

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          subject: "Owner Partnership Enquiry",
          message: composedMessage,
        }),
      })

      if (!response.ok) throw new Error("Owner enquiry failed")
      form.reset()
      setOwnerEnquiryStatus("sent")
    } catch {
      setOwnerEnquiryStatus("error")
    }
  }

  return (
    <div className="bg-white text-charcoal">
      <section className="relative min-h-[86svh] overflow-hidden bg-[#091828] pt-24 text-white">
        <Image
          src={heroImage}
          alt={`${heroProperty.name} managed by Salt Route`}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.82]"
        />
        <div className="absolute inset-0 bg-[#06111D]/50" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#06111D] via-[#06111D]/55 to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[calc(86svh-6rem)] max-w-screen-2xl flex-col justify-end px-6 pb-8 sm:px-8 md:px-12 lg:px-16">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-5xl"
            >
              <Eyebrow light>Salt Route Consulting</Eyebrow>
              <h1 className="mt-7 max-w-4xl font-display text-5xl leading-[1.05] tracking-wide text-white md:text-7xl lg:text-[6.8rem]">
                For Property Owners
              </h1>
              <p className="mt-8 max-w-2xl text-base font-light leading-[1.9] text-white/76 md:text-lg">
                Turn distinctive homes, villas, apartments, and retreats into guest-ready hospitality assets with smart operations, sustainable practices, and people-first management.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="#owner-enquiry"
                  className="inline-flex items-center justify-center gap-3 bg-gold px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#07111C] transition-colors duration-500 hover:bg-sand"
                >
                  List Your Property
                  <ArrowRight className="h-4 w-4 stroke-[1.4]" />
                </Link>
                <Link
                  href="#owner-portal"
                  className="inline-flex items-center justify-center gap-3 border border-white/28 px-8 py-4 text-[10px] font-medium uppercase tracking-[0.28em] text-white transition-colors duration-500 hover:border-gold hover:text-gold"
                >
                  View Owner Experience
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="hidden border border-white/18 bg-[#06111D]/52 p-7 backdrop-blur-md md:block"
            >
              <p className="text-[9px] uppercase tracking-[0.34em] text-gold/85">Featured Asset</p>
              <h2 className="mt-4 font-display text-3xl tracking-wide text-white">{heroProperty.name}</h2>
              <p className="mt-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/55">
                <MapPin className="h-3.5 w-3.5 stroke-[1.4]" />
                {heroProperty.location}
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4">
                <MetricPill label="Beds" value={String(heroProperty.bedrooms)} />
                <MetricPill label="Baths" value={String(heroProperty.bathrooms)} />
                <MetricPill label="Guests" value={String(heroProperty.maxGuests)} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-b border-charcoal/10 bg-[#F7F5F0]">
        <div className="mx-auto grid max-w-screen-2xl grid-cols-2 gap-px bg-charcoal/8 px-0 md:grid-cols-4">
          {[
            ["Portfolio", `${propertyCount}+ active assets`],
            ["Positioning", "Local roots, global routes"],
            ["Operations", "Guest-ready systems"],
            ["Partner Care", "Direct owner support"],
          ].map(([label, value]) => (
            <div key={label} className="bg-[#F7F5F0] px-6 py-7 text-center md:px-8">
              <p className="text-[9px] uppercase tracking-[0.32em] text-charcoal/40">{label}</p>
              <p className="mt-3 font-display text-xl tracking-wide text-charcoal md:text-2xl">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="why-us" className="scroll-mt-28 bg-white py-24 md:py-32">
        <div className="mx-auto grid max-w-screen-2xl gap-14 px-6 sm:px-8 md:px-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-16">
          <FadeUp className="relative min-h-[420px] overflow-hidden bg-sand md:min-h-[620px]">
            <Image
              src="/Sunshine%20Villa%20Main.png"
              alt="Sunshine Villa Ilam property view"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </FadeUp>

          <div className="flex flex-col justify-center">
            <FadeUp>
              <Eyebrow>Owner Partnership</Eyebrow>
              <h2 className="mt-7 max-w-3xl font-display text-4xl leading-[1.14] tracking-wide text-charcoal md:text-6xl">
                We build hospitality value around the property, not around paperwork.
              </h2>
              <p className="mt-8 max-w-2xl text-base font-light leading-[1.9] text-charcoal/63 md:text-lg">
                Salt Route Consulting helps owners unlock long-term value through distinctive presentation, smart operations, responsible growth, and clear owner visibility. From Ilam&apos;s tea country to modern Pokhara apartments, every stay needs a story, a standard, and a system behind it.
              </p>
            </FadeUp>

            <FadeUp delay={0.1} className="mt-12 grid grid-cols-1 gap-px bg-charcoal/10 sm:grid-cols-3">
              {[
                ["Pre-opening", "Strategy, setup, listing readiness"],
                ["Live operation", "Guests, bookings, edits, reviews"],
                ["Asset growth", "Revenue clarity and better decisions"],
              ].map(([title, desc]) => (
                <div key={title} className="bg-white p-6">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-gold-dark">{title}</p>
                  <p className="mt-4 text-sm font-light leading-[1.75] text-charcoal/62">{desc}</p>
                </div>
              ))}
            </FadeUp>
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-28 bg-[#0A1826] py-24 text-sand md:py-32">
        <div className="mx-auto max-w-screen-2xl px-6 sm:px-8 md:px-12 lg:px-16">
          <FadeUp className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow light>Managed For Scale</Eyebrow>
              <h2 className="mt-7 max-w-3xl font-display text-4xl leading-[1.14] tracking-wide text-sand md:text-6xl">
                Owner services that stay clear with two properties or two hundred.
              </h2>
            </div>
            <p className="max-w-md text-sm font-light leading-[1.9] text-sand/45 md:text-base">
              The owner experience is built around repeatable property data: photos, amenities, features, arrivals, requests, messages, and performance.
            </p>
          </FadeUp>

          <div className="mt-16 grid grid-cols-1 gap-px bg-gold/10 sm:grid-cols-2 xl:grid-cols-4">
            {ownerPromises.map((item, index) => (
              <FadeUp key={item.title} delay={index * 0.06}>
                <IconBlock icon={item.icon} title={item.title} desc={item.desc} dark />
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F7F5F0] py-24 md:py-32">
        <div className="mx-auto grid max-w-screen-2xl gap-16 px-6 sm:px-8 md:px-12 lg:grid-cols-[0.85fr_1.15fr] lg:px-16">
          <FadeUp>
            <Eyebrow>Operating Model</Eyebrow>
            <h2 className="mt-7 font-display text-4xl leading-[1.14] tracking-wide text-charcoal md:text-6xl">
              From private asset to polished stay.
            </h2>
            <p className="mt-8 text-base font-light leading-[1.9] text-charcoal/62">
              Owners should be able to see what matters: how the property is presented, which guests are arriving, what needs attention, and how the asset is performing.
            </p>
          </FadeUp>

          <div className="grid gap-px bg-charcoal/10">
            {operatingModel.map((item, index) => (
              <FadeUp key={item.step} delay={index * 0.05}>
                <div className="grid gap-5 bg-[#F7F5F0] p-7 md:grid-cols-[110px_1fr] md:p-9">
                  <p className="font-display text-5xl text-gold-dark/55">{item.step}</p>
                  <div>
                    <h3 className="font-display text-3xl tracking-wide text-charcoal">{item.title}</h3>
                    <p className="mt-4 max-w-2xl text-sm font-light leading-[1.85] text-charcoal/60">{item.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <section id="portfolio" className="scroll-mt-28 bg-white py-24 md:py-32">
        <div className="mx-auto max-w-screen-2xl px-6 sm:px-8 md:px-12 lg:px-16">
          <FadeUp className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow>Portfolio Signal</Eyebrow>
              <h2 className="mt-7 max-w-3xl font-display text-4xl leading-[1.14] tracking-wide text-charcoal md:text-6xl">
                Properties shown as assets guests can feel.
              </h2>
            </div>
            <Link
              href="/properties"
              className="group inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-charcoal/55 transition-colors duration-500 hover:text-gold-dark"
            >
              View Guest Collection
              <ArrowRight className="h-4 w-4 stroke-[1.4] transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </FadeUp>

          <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
            {featuredPortfolio.slice(0, 6).map((property, index) => (
              <FadeUp key={`${property.slug}-${index}`} delay={index * 0.05}>
                <Link href={portfolio.length > 0 ? `/properties/${property.slug}` : "#owner-enquiry"} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                    {property.image ? (
                      <Image
                        src={property.image}
                        alt={property.name}
                        fill
                        sizes="(min-width: 1280px) 31vw, (min-width: 768px) 48vw, 100vw"
                        className="object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Building2 className="h-10 w-10 text-charcoal/20 stroke-[1.2]" />
                      </div>
                    )}
                    {property.featured && (
                      <div className="absolute left-5 top-5 border border-white/35 bg-[#06111D]/65 px-4 py-2 text-[8px] uppercase tracking-[0.28em] text-white backdrop-blur">
                        Signature
                      </div>
                    )}
                  </div>
                  <div className="border-b border-charcoal/10 py-7">
                    <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.28em] text-charcoal/43">
                      <MapPin className="h-3.5 w-3.5 stroke-[1.3]" />
                      {property.location}
                    </p>
                    <h3 className="mt-4 font-display text-3xl tracking-wide text-charcoal transition-colors duration-500 group-hover:text-gold-dark">
                      {property.name}
                    </h3>
                    <p className="mt-4 text-sm font-light leading-[1.8] text-charcoal/58">{property.desc}</p>
                    <div className="mt-6 flex flex-wrap gap-3 text-[9px] uppercase tracking-[0.24em] text-charcoal/42">
                      <span className="inline-flex items-center gap-2">
                        <BedDouble className="h-3.5 w-3.5 stroke-[1.3]" />
                        {property.bedrooms} bedrooms
                      </span>
                      <span>{property.bathrooms} baths</span>
                      <span>{property.maxGuests} guests</span>
                    </div>
                  </div>
                </Link>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <section id="owner-portal" className="bg-[#06111D] py-24 text-sand md:py-32">
        <div className="mx-auto grid max-w-screen-2xl gap-14 px-6 sm:px-8 md:px-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20 lg:px-16">
          <FadeUp className="flex flex-col justify-center">
            <Eyebrow light>Owner Portal</Eyebrow>
            <h2 className="mt-7 font-display text-4xl leading-[1.14] tracking-wide text-sand md:text-6xl">
              A property view first, not a dashboard wall.
            </h2>
            <p className="mt-8 text-base font-light leading-[1.9] text-sand/50">
              Owners enter through the asset: gallery, highlights, amenities, reviews, confirmed stays, revenue, and requested edits. The interface is quiet, responsive, and ready for bulk property portfolios.
            </p>
            <div className="mt-12 grid gap-px bg-gold/10 sm:grid-cols-3">
              {portalViews.map((view) => (
                <div key={view.title} className="bg-[#0A1826] p-6">
                  <view.icon className="h-5 w-5 text-gold/65 stroke-[1.3]" />
                  <p className="mt-5 font-display text-xl tracking-wide text-sand/85">{view.title}</p>
                  <p className="mt-3 text-xs font-light leading-[1.8] text-sand/40">{view.desc}</p>
                </div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.1} className="border border-gold/12 bg-[#0A1826] p-5 sm:p-7">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#11263A]">
              <Image
                src={heroImage}
                alt={`${heroProperty.name} owner portal preview`}
                fill
                sizes="(min-width: 1024px) 48vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06111D] via-transparent to-[#06111D]/20" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <p className="text-[9px] uppercase tracking-[0.32em] text-gold/80">Property Room</p>
                <h3 className="mt-3 font-display text-3xl tracking-wide text-white sm:text-4xl">{heroProperty.name}</h3>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[
                    ["Revenue", "Visible"],
                    ["Arrivals", "Tracked"],
                    ["Edits", "Queued"],
                  ].map(([label, value]) => (
                    <div key={label} className="border border-white/13 bg-white/8 p-4 backdrop-blur">
                      <p className="font-display text-xl text-white">{value}</p>
                      <p className="mt-2 text-[8px] uppercase tracking-[0.24em] text-white/45">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      <section className="bg-[#F7F5F0] py-24 md:py-32">
        <div className="mx-auto max-w-screen-xl px-6 text-center sm:px-8 md:px-12">
          <FadeUp>
            <div className="mx-auto mb-7 flex h-14 w-14 items-center justify-center border border-gold/35">
              <ShieldCheck className="h-6 w-6 text-gold-dark stroke-[1.3]" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.38em] text-charcoal/48">Salt Route Standards</p>
            <h2 className="mx-auto mt-6 max-w-4xl font-display text-4xl leading-[1.14] tracking-wide text-charcoal md:text-6xl">
              Purpose-driven hospitality that protects place, people, and long-term asset value.
            </h2>
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              {standards.map((standard) => (
                <span
                  key={standard}
                  className="inline-flex items-center gap-2 border border-charcoal/12 bg-white px-4 py-3 text-[9px] uppercase tracking-[0.24em] text-charcoal/55"
                >
                  <BadgeCheck className="h-3.5 w-3.5 text-gold-dark stroke-[1.4]" />
                  {standard}
                </span>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      <section id="owner-enquiry" className="relative scroll-mt-28 overflow-hidden bg-[#0A1826] py-24 text-sand md:py-32">
        <div className="mx-auto grid max-w-screen-xl gap-12 px-6 sm:px-8 md:px-12 lg:grid-cols-[1fr_0.75fr] lg:items-end">
          <FadeUp>
            <Eyebrow light>Partner With SRC</Eyebrow>
            <h2 className="mt-7 max-w-3xl font-display text-4xl leading-[1.14] tracking-wide text-sand md:text-6xl">
              Ready to make your property part of Nepal&apos;s finest hospitality collection?
            </h2>
            <p className="mt-8 max-w-2xl text-base font-light leading-[1.9] text-sand/50">
              Share your property details with Salt Route Consulting and our team will help assess positioning, listing readiness, guest potential, and the best path to launch.
            </p>
          </FadeUp>

          <FadeUp delay={0.1} className="space-y-5">
            <form onSubmit={handleOwnerEnquiry} className="border border-gold/14 bg-[#07111C]/60 p-5 sm:p-7">
              {ownerEnquiryStatus === "sent" ? (
                <div className="py-10 text-center">
                  <div className="mx-auto mb-6 h-px w-12 bg-gold/50" />
                  <p className="text-[10px] uppercase tracking-[0.34em] text-gold/70">Owner Enquiry Sent</p>
                  <p className="mt-4 text-sm font-light leading-[1.8] text-sand/55">
                    Thank you. Salt Route will review your property details and respond shortly.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      name="name"
                      required
                      placeholder="Your name"
                      className="min-w-0 border border-gold/14 bg-transparent px-4 py-3 text-sm font-light text-sand outline-none placeholder:text-sand/25 focus:border-gold/45"
                    />
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="Email address"
                      className="min-w-0 border border-gold/14 bg-transparent px-4 py-3 text-sm font-light text-sand outline-none placeholder:text-sand/25 focus:border-gold/45"
                    />
                  </div>
                  <input
                    name="phone"
                    placeholder="Phone or WhatsApp"
                    className="w-full border border-gold/14 bg-transparent px-4 py-3 text-sm font-light text-sand outline-none placeholder:text-sand/25 focus:border-gold/45"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      name="propertyName"
                      placeholder="Property name"
                      className="min-w-0 border border-gold/14 bg-transparent px-4 py-3 text-sm font-light text-sand outline-none placeholder:text-sand/25 focus:border-gold/45"
                    />
                    <input
                      name="propertyLocation"
                      placeholder="Property location"
                      className="min-w-0 border border-gold/14 bg-transparent px-4 py-3 text-sm font-light text-sand outline-none placeholder:text-sand/25 focus:border-gold/45"
                    />
                  </div>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    placeholder="Tell us about the property, rooms, views, current status, and what support you need."
                    className="w-full resize-y border border-gold/14 bg-transparent px-4 py-3 text-sm font-light leading-[1.8] text-sand outline-none placeholder:text-sand/25 focus:border-gold/45"
                  />
                  {ownerEnquiryStatus === "error" && (
                    <p className="text-[11px] font-light leading-[1.7] text-red-200">
                      We could not send this enquiry. Please use the email below.
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={ownerEnquiryStatus === "loading"}
                    className="flex w-full items-center justify-between bg-gold px-7 py-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#07111C] transition-colors duration-500 hover:bg-sand disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {ownerEnquiryStatus === "loading" ? "Sending" : "Send Owner Enquiry"}
                    <ArrowRight className="h-4 w-4 stroke-[1.4]" />
                  </button>
                </div>
              )}
            </form>
            <a
              href="mailto:info@saltroutegroup.com"
              className="flex w-full items-center justify-between border border-gold/22 px-7 py-5 text-[10px] font-medium uppercase tracking-[0.28em] text-gold/85 transition-colors duration-500 hover:border-gold hover:text-gold"
            >
              info@saltroutegroup.com
              <Sparkles className="h-4 w-4 stroke-[1.4]" />
            </a>
            <div className="border border-gold/10 p-6">
              <p className="text-[9px] uppercase tracking-[0.3em] text-sand/35">Office</p>
              <p className="mt-3 text-sm font-light leading-[1.8] text-sand/55">Hattigauda, Kathmandu, Nepal</p>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  )
}
