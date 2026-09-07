"use client"

import { EditorialHero } from "@/components/public/EditorialHero"
import Image from "next/image"
import Link from "next/link"
import { Reveal } from "@/components/public/motion"
import {
  CompactButton,
  CompactHeading,
  CompactImageText,
  CompactMediaCard,
  CompactSection,
} from "@/components/public/Compact"
import { MapPin } from "lucide-react"
import imgRetreat from "@/public/images/marketing/nepal-residence.jpg"
import imgDining from "@/public/images/saltroute/breakfast-with-a-view.webp"
import imgInterior from "@/public/images/marketing/nepal-interior.jpg"
import imgOffice from "@/public/images/marketing/boutique-office-team.png"
import imgVilla from "@/public/images/saltroute/tea-hills.webp"
import imgCulture from "@/public/images/saltroute/tea-harvest.webp"
import imgCheese from "@/public/images/saltroute/local-cheese.webp"

export type CollageProperty = {
  slug: string
  title: string
  location: string
  imageUrl: string | null
}

const services = [
  {
    image: imgRetreat,
    alt: "A private Himalayan retreat",
    title: "Tailored Sanctuary Stays",
    copy: "Distinctive private residences and boutique retreats chosen for their mountain setting, architectural narrative, seclusion, and genuine warmth of welcome.",
    href: "/properties",
    action: "Browse Stays",
  },
  {
    image: imgVilla,
    alt: "A walking landscape through tea-covered hills",
    title: "Private Itinerary Design",
    copy: "Seamless bespoke journeys orchestrated around Nepal's magnificent landscapes, living monastic traditions, private aviation, and secluded valleys.",
    href: "/contact",
    action: "Plan a Journey",
  },
  {
    image: imgCulture,
    alt: "Tea being harvested by hand",
    title: "Cultural Immersion & Craft",
    copy: "Intimate heritage experiences, master artisan encounters, private temple rituals, and curated culinary expeditions with renowned local hosts.",
    href: "/contact",
    action: "Enquire",
  },
  {
    image: imgCheese,
    alt: "Cheese maturing on wooden shelves at Lucky Dairy",
    title: "Local Food & Traditions",
    copy: "Discover Nepal through its food, from fresh breakfasts to regional producers and the everyday traditions behind a shared table.",
    href: "/contact",
    action: "Plan a Food Experience",
  },
]

export function ServicesClient({ latestProperties }: { latestProperties: CollageProperty[] }) {
  return (
    <div className="bg-background text-navy overflow-hidden">
      {/* ─── HERO ─── */}
      <EditorialHero image={imgDining} title="Experiences" />
      <div className="editorial-properties-intro">Quiet cultural access, private tables, and local encounters, arranged around your pace.</div>

      {/* ─── SERVICES GRID ─── */}
      <CompactSection className="py-20 lg:py-28">
        <Reveal>
          <CompactHeading
            eyebrow="What We Arrange"
            title="Every detail orchestrated with quiet precision."
            copy="Choose an individual sanctuary or let our private concierge weave your stay into an unforgettable Himalayan journey."
          />
        </Reveal>
        <Reveal stagger={0.1} className="mt-12 grid gap-8 editorial-two-column md:grid-cols-2">
          {services.map((service) => (
            <Reveal.Item key={service.title}>
              <CompactMediaCard key={service.title} {...service} />
            </Reveal.Item>
          ))}
        </Reveal>
      </CompactSection>

      {/* ─── PRIVATE TRAVEL CARE ─── */}
      <CompactSection className="bg-background py-20 lg:py-28 border-y border-navy/6">
        <Reveal>
          <CompactImageText
            image={imgVilla}
            alt="Tea gardens and hillside cabins in Nepal"
            eyebrow="White-Glove Hospitality"
            title="From arrival to departure, handled with discreet attention."
            copy="We coordinate helicopter transfers, luxury 4x4 mountain journeys, dedicated culinary masters, private trekking guides, and luggage care so your exploration of Nepal is effortless."
            href="/contact"
            action="Request a Private Itinerary"
          />
        </Reveal>
      </CompactSection>

      {/* ─── FEATURED PROPERTIES ─── */}
      {latestProperties.length ? (
        <CompactSection className="py-20 lg:py-28">
          <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-12">
            <CompactHeading
              eyebrow="The Collection"
              title="Begin with a sanctuary that resonates."
              copy="A selection of handpicked private properties currently available across Nepal."
            />
            <CompactButton href="/properties" tone="text" className="font-medium tracking-[0.16em]">
              View All Sanctuaries →
            </CompactButton>
          </Reveal>
          <Reveal stagger={0.1} className="grid gap-8 editorial-two-column md:grid-cols-2">
            {latestProperties.map((property) => (
              <Reveal.Item key={property.slug}>
                <article className="group flex flex-col h-full bg-white border border-navy/8 hover:border-gold/40 transition-all duration-300">
                  <Link
                    href={`/properties/${property.slug}`}
                    className="relative block aspect-[4/3] overflow-hidden bg-sand-dark"
                  >
                    <Image
                      src={property.imageUrl || imgRetreat}
                      alt={property.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>
                  <div className="p-6">
                    <p className="flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-[0.16em] text-navy/55 font-medium">
                      <MapPin className="w-3 h-3 text-gold-dark" />
                      {property.location}
                    </p>
                    <h2 className="mt-2 font-display text-2xl leading-tight text-navy group-hover:text-gold-dark transition-colors">
                      <Link href={`/properties/${property.slug}`}>{property.title}</Link>
                    </h2>
                  </div>
                </article>
              </Reveal.Item>
            ))}
          </Reveal>
        </CompactSection>
      ) : null}

      {/* ─── FOR OWNERS CONSULTING ─── */}
      <CompactSection className="bg-sand py-20 lg:py-28 border-y border-navy/6">
        <Reveal>
          <CompactImageText
            image={imgOffice}
            alt="Hospitality planning workspace"
            eyebrow="Hospitality Advisory"
            title="Property guidance grounded in real guest excellence."
            copy="We support pre-opening strategy, architectural alignment, operational standard operating procedures, brand identity, and long-term asset positioning for luxury property owners across the Himalayan region."
            href="/for-owners"
            action="Explore Owner Advisory"
            imageSide="right"
          />
        </Reveal>
      </CompactSection>

      {/* ─── CONTACT CALL TO ACTION ─── */}
      <CompactSection className="py-20 lg:py-28">
        <Reveal>
          <CompactImageText
            image={imgInterior}
            alt="Details of a Salt Route stay"
            eyebrow="Begin Your Conversation"
            title="Tell us what you would like your journey to feel like."
            copy="Share your preferred dates, party size, and passions. Our private concierge team will shape an itinerary and sanctuary stay exclusively around you."
            href="/contact"
            action="Contact Concierge"
          />
        </Reveal>
      </CompactSection>
    </div>
  )
}
