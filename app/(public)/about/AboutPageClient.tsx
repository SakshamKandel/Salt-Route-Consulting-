"use client"

import Image from "next/image"
import { siteConfig } from "@/lib/site.config"
import { Reveal } from "@/components/public/motion"
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
import imgInterior from "@/public/images/marketing/nepalese-interior-details.png"
import imgDining from "@/public/images/marketing/private-himalayan-dining.png"
import imgOffice from "@/public/images/marketing/boutique-office-team.png"

const principles = [
  {
    image: imgRetreat,
    alt: "A Salt Route sanctuary connected to its landscape",
    title: "Landscape & Place First",
    copy: "Every stay begins with its topography, mountain ridges, community craft, and the quiet character that makes it distinct in the Himalayas.",
    href: "/properties",
  },
  {
    image: imgDining,
    alt: "Local hospitality and private dining",
    title: "People at the Heart",
    copy: "Local host families, mountain guides, organic farmers, and master craftsmen turn a property into a generous, unforgettable Himalayan welcome.",
    href: "/services",
  },
  {
    image: imgInterior,
    alt: "Considered Nepalese interior details",
    title: "Artistry in the Details",
    copy: "We favour handcrafted natural stone, heritage wood joinery, and the quiet luxury of things created with intention and patience.",
    href: "/contact",
  },
]

export default function AboutPageClient({ propertyCount }: { propertyCount: number }) {
  return (
    <div className="bg-background text-navy overflow-hidden">
      {/* ─── HERO ─── */}
      <section className="relative min-h-[540px] sm:min-h-[620px] lg:min-h-[700px] flex items-end overflow-hidden">
        <Image
          src={imgVilla}
          alt="A Salt Route residence in Nepal"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />
        <CompactContainer className="relative z-10 pb-16 sm:pb-20 lg:pb-24 text-cream">
          <Reveal className="max-w-3xl">
            <h1 className="font-display text-[clamp(2.75rem,5.5vw,5.5rem)] leading-[0.98] tracking-[-0.02em]">
              Local roots. Wider routes.
            </h1>
            <p className="mt-5 max-w-2xl font-sans text-base font-light leading-relaxed text-cream/90 sm:text-lg">
              A Nepal-based luxury hospitality and asset consulting house connecting distinctive sanctuaries with thoughtful global travelers and sustainable regional prosperity.
            </p>
          </Reveal>
        </CompactContainer>
      </section>

      {/* ─── WHO WE ARE ─── */}
      <CompactSection className="py-20 lg:py-28">
        <Reveal>
          <CompactImageText
            image={imgOffice}
            alt="The Salt Route team"
            eyebrow="Who We Are"
            title="Purpose-led hospitality with rigorous commercial ambition."
            copy={`${siteConfig.brandName} unites hospitality strategists, travel curators, estate owners, and local village teams. Today our collection represents ${propertyCount} distinctive active ${propertyCount === 1 ? "sanctuary" : "sanctuaries"}, each shaped around the unique character of its geography.`}
            href="/properties"
            action="Explore the Collection"
          />
        </Reveal>
      </CompactSection>

      {/* ─── PRINCIPLES ─── */}
      <CompactSection className="bg-beige py-20 lg:py-28 border-y border-navy/6">
        <Reveal>
          <CompactHeading
            eyebrow="Our Guiding Values"
            title="Timeless principles, applied consistently."
            copy="We build bespoke travel experiences that feel deeply personal, authentic, and responsible—grounded in the spirit of Nepal."
          />
        </Reveal>
        <Reveal stagger={0.1} className="mt-12 grid gap-8 md:grid-cols-3">
          {principles.map((principle) => (
            <Reveal.Item key={principle.title}>
              <CompactMediaCard key={principle.title} {...principle} action="Learn more" />
            </Reveal.Item>
          ))}
        </Reveal>
      </CompactSection>

      {/* ─── RESPONSIBILITY ─── */}
      <CompactSection className="py-20 lg:py-28">
        <Reveal>
          <CompactImageText
            image={imgRetreat}
            alt="A private retreat in Nepal"
            eyebrow="Sustainable Stewardship"
            title="Value that lasts far beyond a single stay."
            copy="We champion fair local employment, responsible ecological property care, slow travel paths, and respectful connections between guests and indigenous host communities. Sustainability is woven directly into our operating architecture."
            href="/services"
            action="Discover Our Services"
            imageSide="right"
          />
        </Reveal>
      </CompactSection>

      {/* ─── WORK WITH US CTA ─── */}
      <CompactSection className="bg-sand py-20 lg:py-28 border-t border-navy/6">
        <Reveal className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <CompactHeading
            eyebrow="Collaborate With Us"
            title="Build a stay or design a private journey with Salt Route."
            copy="Speak with our private concierge team regarding bespoke journeys, property partnerships, or estate representation across Nepal."
          />
          <CompactButton href="/contact" className="min-h-12 px-8">
            Start a Conversation
          </CompactButton>
        </Reveal>
      </CompactSection>
    </div>
  )
}
