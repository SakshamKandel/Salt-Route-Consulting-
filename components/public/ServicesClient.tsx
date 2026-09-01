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
import imgRetreat from "@/public/images/marketing/himalayan-retreat-exterior.png"
import imgDining from "@/public/images/marketing/private-himalayan-dining.png"
import imgInterior from "@/public/images/marketing/nepalese-interior-details.png"
import imgOffice from "@/public/images/marketing/boutique-office-team.png"
import imgVilla from "@/public/images/marketing/sunshine-villa-main.png"

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
    title: "Tailored property stays",
    copy: "Distinctive homes chosen for their setting, story, privacy, and warmth of welcome.",
    href: "/properties",
    action: "Browse stays",
  },
  {
    image: imgOffice,
    alt: "The Salt Route travel planning team",
    title: "Personal travel planning",
    copy: "Complete journeys arranged around Nepal's landscapes, cultures, and communities.",
    href: "/contact",
    action: "Plan a journey",
  },
  {
    image: imgInterior,
    alt: "Nepalese craft and interior details",
    title: "Cultural journeys",
    copy: "Community-rooted experiences that share Nepal's heritage with honesty and depth.",
    href: "/contact",
    action: "Enquire",
  },
]

export function ServicesClient({ latestProperties }: { latestProperties: CollageProperty[] }) {
  return (
    <div className="bg-background text-navy">
      <section className="relative min-h-[500px] overflow-hidden sm:min-h-[580px]">
        <Image src={imgDining} alt="A private dining experience in Nepal" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/34" />
        <CompactContainer className="relative flex min-h-[500px] items-end pb-9 text-cream sm:min-h-[580px] sm:pb-12">
          <div className="max-w-2xl">
            <p className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-cream/80">Salt Route experiences</p>
            <h1 className="mt-3 font-display text-[clamp(2.75rem,5vw,5rem)] leading-[1] tracking-[-0.02em]">Journeys made personal.</h1>
            <p className="mt-4 max-w-xl font-sans text-base font-light leading-7 text-cream/88 sm:text-lg">
              Stay, food, culture, nature, and movement brought together around how you want to experience Nepal.
            </p>
            <CompactButton href="/contact" className="mt-6">Plan your journey</CompactButton>
          </div>
        </CompactContainer>
      </section>

      <CompactSection>
        <CompactHeading
          eyebrow="What we arrange"
          title="Everything you need, without unnecessary complexity."
          copy="Choose a stay or let us connect the details into one considered journey."
        />
        <div className="mt-7 grid gap-7 md:grid-cols-3">
          {services.map((service) => <CompactMediaCard key={service.title} {...service} />)}
        </div>
      </CompactSection>

      <CompactSection className="bg-beige">
        <CompactImageText
          image={imgVilla}
          alt="A Salt Route private residence"
          eyebrow="Private travel care"
          title="From arrival to departure, handled with quiet attention."
          copy="We coordinate road journeys, domestic flights, local hosts, dining, guides, and the small details that make movement through Nepal feel easy."
          href="/contact"
          action="Request a journey"
        />
      </CompactSection>

      {latestProperties.length ? (
        <CompactSection>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <CompactHeading
              eyebrow="The stay"
              title="Begin with a place that feels right."
              copy="A few current properties from the Salt Route collection."
            />
            <CompactButton href="/properties" tone="text">View all stays</CompactButton>
          </div>
          <div className="mt-7 grid gap-7 md:grid-cols-3">
            {latestProperties.map((property) => (
              <article key={property.slug}>
                <Link href={`/properties/${property.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-sand-dark">
                  <Image
                    src={property.imageUrl || imgRetreat}
                    alt={property.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 hover:scale-[1.02]"
                  />
                </Link>
                <p className="mt-4 font-sans text-[10px] uppercase tracking-[0.14em] text-navy/52">{property.location}</p>
                <h2 className="mt-1 font-display text-2xl leading-tight text-navy">{property.title}</h2>
              </article>
            ))}
          </div>
        </CompactSection>
      ) : null}

      <CompactSection className="bg-sand">
        <CompactImageText
          image={imgOffice}
          alt="Salt Route hospitality consulting"
          eyebrow="For owners"
          title="Property guidance grounded in guest experience."
          copy="We support positioning, opening, daily hospitality, brand storytelling, and sustainable development for distinctive properties."
          href="/for-owners"
          action="Explore owner services"
          imageSide="right"
        />
      </CompactSection>

      <CompactSection>
        <CompactImageText
          image={imgInterior}
          alt="Details of a Salt Route stay"
          eyebrow="Start a conversation"
          title="Tell us what you would like the journey to feel like."
          copy="Share your dates, interests, and pace. Our team will shape the stay and the route around you."
          href="/contact"
          action="Contact us"
        />
      </CompactSection>
    </div>
  )
}
