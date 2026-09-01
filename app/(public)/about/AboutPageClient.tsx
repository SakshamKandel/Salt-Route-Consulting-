import Image from "next/image"
import { siteConfig } from "@/lib/site.config"
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
    alt: "A Salt Route retreat connected to its landscape",
    title: "Place first",
    copy: "Every stay begins with its landscape, community, craft, and the character that makes it distinct.",
    href: "/properties",
  },
  {
    image: imgDining,
    alt: "Local hospitality and private dining",
    title: "People at the centre",
    copy: "Local teams, makers, growers, and guides turn a property into a generous and meaningful welcome.",
    href: "/services",
  },
  {
    image: imgInterior,
    alt: "Considered Nepalese interior details",
    title: "Care in the details",
    copy: "We favour thoughtful choices, honest service, and the quiet confidence of things done well.",
    href: "/contact",
  },
]

export default function AboutPageClient({ propertyCount }: { propertyCount: number }) {
  return (
    <div className="bg-background text-navy">
      <section className="relative min-h-[500px] overflow-hidden sm:min-h-[580px]">
        <Image src={imgVilla} alt="A Salt Route residence in Nepal" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/34" />
        <CompactContainer className="relative flex min-h-[500px] items-end pb-9 text-cream sm:min-h-[580px] sm:pb-12">
          <div className="max-w-2xl">
            <p className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-cream/80">Our story</p>
            <h1 className="mt-3 font-display text-[clamp(2.75rem,5vw,5rem)] leading-[1] tracking-[-0.02em]">Local roots. Wider routes.</h1>
            <p className="mt-4 max-w-xl font-sans text-base font-light leading-7 text-cream/88 sm:text-lg">
              A Nepal-based hospitality and consulting group connecting distinctive places with thoughtful guests and long-term opportunity.
            </p>
          </div>
        </CompactContainer>
      </section>

      <CompactSection>
        <CompactImageText
          image={imgOffice}
          alt="The Salt Route team"
          eyebrow="Who we are"
          title="Purpose-led hospitality with practical ambition."
          copy={`${siteConfig.brandName} brings together hospitality thinkers, travel makers, property partners, and local teams. Today the collection includes ${propertyCount} active ${propertyCount === 1 ? "property" : "properties"}, each shaped around its own place and people.`}
          href="/properties"
          action="Explore the collection"
        />
      </CompactSection>

      <CompactSection className="bg-beige">
        <CompactHeading
          eyebrow="How we work"
          title="Simple principles, applied consistently."
          copy="We build experiences that feel personal and responsible without making hospitality complicated."
        />
        <div className="mt-7 grid gap-7 md:grid-cols-3">
          {principles.map((principle) => (
            <CompactMediaCard key={principle.title} {...principle} action="Learn more" />
          ))}
        </div>
      </CompactSection>

      <CompactSection>
        <CompactImageText
          image={imgRetreat}
          alt="A private retreat in Nepal"
          eyebrow="Our responsibility"
          title="Value that lasts beyond a stay."
          copy="We support local employment, responsible property care, lower-impact travel, and stronger connections between guests and host communities. Sustainability is treated as an operating responsibility rather than a decorative claim."
          href="/services"
          action="See what we do"
          imageSide="right"
        />
      </CompactSection>

      <CompactSection className="bg-sand">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <CompactHeading
            eyebrow="Work with us"
            title="Build a stay or plan a journey with Salt Route."
            copy="Speak with our team about a property, a private itinerary, or a hospitality partnership in Nepal."
          />
          <CompactButton href="/contact">Start a conversation</CompactButton>
        </div>
      </CompactSection>
    </div>
  )
}
