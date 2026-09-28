"use client"

import Image from "next/image"
import { EditorialHero } from "@/components/public/EditorialHero"
import { siteConfig } from "@/lib/site.config"
import { Reveal } from "@/components/public/motion"
import {
  CompactButton,
  CompactHeading,
  CompactImageText,
  CompactMediaCard,
  CompactSection,
} from "@/components/public/Compact"
import imgVilla from "@/public/images/saltroute/misty-tea-gardens.webp"
import imgRetreat from "@/public/images/saltroute/jitpur-terraces.webp"
import imgInterior from "@/public/images/saltroute/painted-table.webp"
import imgDining from "@/public/images/saltroute/tea-harvest.webp"
import imgOffice from "@/public/images/saltroute/local-farmers.webp"

const principles = [
  {
    image: imgRetreat,
    alt: "Terraced fields and green hills in Jitpur",
    title: "Landscape & Place First",
    copy: "Every stay begins with its topography, mountain ridges, community craft, and the quiet character that makes it distinct in the Himalayas.",
    href: "/properties",
  },
  {
    image: imgDining,
    alt: "A tea picker working among green tea bushes",
    title: "People at the Heart",
    copy: "Local host families, mountain guides, organic farmers, and master craftsmen turn a property into a generous, unforgettable Himalayan welcome.",
    href: "/services",
  },
  {
    image: imgInterior,
    alt: "Hand-painted details on a traditional wooden table",
    title: "Artistry in the Details",
    copy: "We favour handcrafted natural stone, heritage wood joinery, and the quiet luxury of things created with intention and patience.",
    href: "/contact",
  },
]

export default function AboutPageClient({ propertyCount }: { propertyCount: number }) {
  return (
    <div className="bg-background text-navy overflow-hidden">
      {/* ─── HERO ─── */}
      <EditorialHero image={imgVilla} title="Our Story" />
      <div className="editorial-properties-intro">A Nepal-based hospitality and asset consulting house connecting distinctive stays with thoughtful travelers and sustainable regional prosperity.</div>

      {/* ─── WHO WE ARE ─── */}
      <CompactSection className="py-20 lg:py-28">
        <Reveal>
          <CompactImageText
            image={imgOffice}
            alt="Farmers tending a field in Jitpur"
            eyebrow="Who We Are"
            title="Purpose-led hospitality with rigorous commercial ambition."
            copy={`${siteConfig.brandName} unites hospitality strategists, travel curators, estate owners, and local village teams. Today our collection represents ${propertyCount} distinctive active ${propertyCount === 1 ? "sanctuary" : "sanctuaries"}, each shaped around the unique character of its geography.`}
            href="/properties"
            action="Explore the Collection"
          />
        </Reveal>
      </CompactSection>

      {/* ─── FOUNDER'S NOTE ─── */}
      <CompactSection className="founder-note-section">
        <div className="founder-note-grid">
          <Reveal className="founder-note-portrait">
            <div className="founder-note-portrait-frame">
              <Image
                src="/images/saltroute/founder-advait.png"
                alt="Advait Sherchan, founder of Salt Route Corp"
                fill
                sizes="(max-width: 900px) 100vw, 42vw"
                className="founder-note-portrait-image"
              />
            </div>
            <p className="founder-note-caption">Advait Sherchan · Founder, Salt Route Corp</p>
          </Reveal>

          <Reveal className="founder-note-copy" delay={0.08}>
            <h2>A Note from the Founder</h2>
            <div className="founder-note-prose">
              <p>
                Growing up, I learned that travel isn&apos;t just about moving through places, it is personal,
                emotional, and deeply transformative. It expands our horizons, shifts our perspectives, and
                leaves us with memories that stay with us long after the journey ends.
              </p>
              <p>
                The name Salt Route is personal to me. My forefathers were Thakali traders who walked the
                high-altitude salt routes across the Himalayas, connecting remote valleys, exchanging goods,
                and opening pathways across rugged borders. Warm hospitality, resilience, and connection are
                carried in our blood. Today, Salt Route Corp is my way of carrying that legacy forward into the modern world:
                connecting local roots to global routes.
              </p>
              <p>
                But with travel comes a deep responsibility. Conservation and community empowerment sit at the very heart
                of everything we build. I believe true, meaningful travel relies on preservation: protecting our fragile
                ecosystems, honoring local heritage, and ensuring that every journey creates a lasting positive impact
                for the communities who open their home to us.
              </p>
              <p className="founder-note-welcome">
                Whether you are seeking a quiet retreat in the hills or an authentic connection to Nepal,
                welcome to our route.
              </p>
            </div>
            <div className="founder-note-signature" aria-label="Advait Sherchan, Founder, Salt Route Corp">
              <span>Advait Sherchan</span>
              <small>Founder, Salt Route Corp</small>
            </div>
          </Reveal>
        </div>
      </CompactSection>

      {/* ─── PRINCIPLES ─── */}
      <CompactSection className="bg-background py-20 lg:py-28 border-y border-navy/6">
        <Reveal>
          <CompactHeading
            eyebrow="Our Guiding Values"
            title="Timeless principles, applied consistently."
            copy="We build bespoke travel experiences that feel deeply personal, authentic, and responsible—grounded in the spirit of Nepal."
          />
        </Reveal>
        <Reveal stagger={0.1} className="mt-12 grid gap-8 editorial-two-column md:grid-cols-2">
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
            alt="Terraced farmland in the hills of Jitpur"
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
