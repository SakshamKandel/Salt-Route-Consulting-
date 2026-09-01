"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getPrimaryImageUrl, type PropertyMediaLike } from "@/lib/property-media"
import { LocationCombobox, type ComboboxProperty } from "@/components/public/LocationCombobox"
import {
  CompactButton,
  CompactContainer,
  CompactHeading,
  CompactImageText,
  CompactMediaCard,
  CompactSection,
} from "@/components/public/Compact"
import imgRetreatExterior from "@/public/images/marketing/himalayan-retreat-exterior.png"
import imgVillaMain from "@/public/images/marketing/sunshine-villa-main.png"
import imgPrivateDining from "@/public/images/marketing/private-himalayan-dining.png"
import imgInteriorDetail from "@/public/images/marketing/nepalese-interior-details.png"
import imgOffice from "@/public/images/marketing/boutique-office-team.png"

type FeaturedProperty = {
  id: string
  title: string
  slug: string
  location: string
  images: PropertyMediaLike[]
  pricePerNight?: number
  description?: string
  propertyType?: string
  maxGuests?: number
  bedrooms?: number
  createdAt?: string | Date
}

const experiences = [
  {
    image: imgPrivateDining,
    title: "Private dining",
    copy: "Seasonal menus, local ingredients, and intimate tables arranged around the rhythm of your stay.",
    href: "/services",
  },
  {
    image: imgRetreatExterior,
    title: "Quiet Himalayan stays",
    copy: "Considered sanctuaries that offer space to slow down and experience Nepal with privacy.",
    href: "/properties",
  },
  {
    image: imgInteriorDetail,
    title: "Culture in the details",
    copy: "Interiors, craft, and journeys shaped by the people and materials of each destination.",
    href: "/about",
  },
]

const guestbook = [
  {
    image: "/images/testimonials/veronique-lorenzo.jpg",
    quote: "A beautiful tea-country base with the comfort and service needed for a truly memorable stay.",
    name: "Véronique Lorenzo",
    role: "European Union Ambassador to Nepal",
  },
  {
    image: "/images/testimonials/dean-jane-thompson.jpg",
    quote: "A new favourite place in Nepal—and in the world. Serene, beautiful, and warmly hosted.",
    name: "Dean and Jane Thompson",
    role: "United States Embassy, Kathmandu",
  },
  {
    image: "/images/testimonials/swarnim-wagle.jpg",
    quote: "An outstanding vision for calm, character, and sustainable opportunity in Nepal's hill towns.",
    name: "Dr. Swarnim Wagle",
    role: "Economist and Member of Parliament",
  },
]

function formatPrice(value?: number) {
  if (!value) return null
  return `NPR ${Math.round(value).toLocaleString("en-US")}`
}

function StaySearch({ properties }: { properties: ComboboxProperty[] }) {
  const router = useRouter()
  const [location, setLocation] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(2)
  const today = new Date().toISOString().slice(0, 10)

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (location) params.set("location", location)
    if (checkIn) params.set("checkIn", checkIn)
    if (checkOut) params.set("checkOut", checkOut)
    if (guests > 0) params.set("guests", String(guests))
    router.push(params.size ? `/properties?${params.toString()}` : "/properties")
  }

  const fieldClass =
    "h-11 w-full bg-transparent px-0 font-sans text-sm text-navy outline-none placeholder:text-navy/45"

  return (
    <form
      onSubmit={submit}
      className="grid gap-4 bg-sand px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.35fr_1fr_1fr_.65fr_auto] lg:items-end"
    >
      <label className="block">
        <span className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-navy/55">
          Destination
        </span>
        <LocationCombobox
          value={location}
          onChange={setLocation}
          properties={properties}
          placeholder="Anywhere in Nepal"
          inputClassName={fieldClass}
        />
      </label>
      <label className="block">
        <span className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-navy/55">
          Check in
        </span>
        <input
          type="date"
          min={today}
          value={checkIn}
          onChange={(event) => {
            const value = event.target.value
            setCheckIn(value)
            if (checkOut && checkOut <= value) setCheckOut("")
          }}
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-navy/55">
          Check out
        </span>
        <input
          type="date"
          min={checkIn || today}
          value={checkOut}
          onChange={(event) => setCheckOut(event.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-navy/55">
          Guests
        </span>
        <input
          type="number"
          min={1}
          max={20}
          value={guests}
          onChange={(event) => setGuests(Math.max(1, Math.min(20, Number(event.target.value) || 1)))}
          className={fieldClass}
        />
      </label>
      <button
        type="submit"
        className="min-h-11 bg-navy px-6 font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-cream hover:bg-navy-dark"
      >
        Find a stay
      </button>
    </form>
  )
}

export default function HomeClient({
  featured = [],
  allProperties = [],
}: {
  featured?: FeaturedProperty[]
  allProperties?: ComboboxProperty[]
}) {
  const selected = featured.slice(0, 3)

  return (
    <div className="bg-background text-navy">
      <section className="relative min-h-[560px] overflow-hidden sm:min-h-[640px] lg:min-h-[700px]">
        <Image
          src={imgVillaMain}
          alt="A private Salt Route stay in the Himalayan landscape"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/32" />
        <CompactContainer className="relative flex min-h-[560px] items-end pb-9 sm:min-h-[640px] sm:pb-12 lg:min-h-[700px]">
          <div className="max-w-2xl text-cream">
            <p className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-cream/80">
              Private journeys through Nepal
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.75rem,5.5vw,5.5rem)] leading-[.98] tracking-[-0.02em]">
              Stay close to the place.
            </h1>
            <p className="mt-4 max-w-xl font-sans text-base font-light leading-7 text-cream/88 sm:text-lg">
              Distinctive homes, thoughtful hosting, and journeys designed around the landscapes and cultures of Nepal.
            </p>
            <CompactButton href="/properties" className="mt-6">
              Explore stays
            </CompactButton>
          </div>
        </CompactContainer>
      </section>

      <CompactContainer className="relative z-10 -mt-px">
        <StaySearch properties={allProperties} />
      </CompactContainer>

      <CompactSection>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <CompactHeading
            eyebrow="Selected stays"
            title="Places with a sense of their surroundings."
            copy="A small collection of private residences and retreats chosen for character, comfort, and connection to place."
          />
          <CompactButton href="/properties" tone="text" className="shrink-0">
            View all stays
          </CompactButton>
        </div>

        {selected.length ? (
          <div className="mt-7 grid gap-7 md:grid-cols-3">
            {selected.map((property) => {
              const image = getPrimaryImageUrl(property.images) || imgRetreatExterior
              return (
                <article key={property.id}>
                  <Link href={`/properties/${property.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-sand-dark">
                    <Image
                      src={image}
                      alt={property.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 hover:scale-[1.02]"
                    />
                  </Link>
                  <div className="pt-4">
                    <p className="font-sans text-[10px] uppercase tracking-[0.14em] text-navy/52">
                      {property.location}
                    </p>
                    <h2 className="mt-1 font-display text-2xl leading-tight text-navy">{property.title}</h2>
                    <div className="mt-2 flex items-center justify-between gap-4 font-sans text-sm text-navy/68">
                      <span>{property.maxGuests ? `Up to ${property.maxGuests} guests` : "Private stay"}</span>
                      {formatPrice(property.pricePerNight) ? <span>From {formatPrice(property.pricePerNight)}</span> : null}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <CompactImageText
            image={imgRetreatExterior}
            alt="Salt Route Himalayan retreat"
            title="Our collection is being prepared."
            copy="Speak with our team for private stays and tailored journeys currently available across Nepal."
            href="/contact"
            action="Contact us"
          />
        )}
      </CompactSection>

      <CompactSection className="bg-beige">
        <CompactHeading
          eyebrow="Experiences"
          title="Simple moments, thoughtfully arranged."
          copy="Each stay can be shaped with food, culture, wellbeing, and time outdoors—always grounded in its destination."
        />
        <div className="mt-7 grid gap-7 md:grid-cols-3">
          {experiences.map((experience) => (
            <CompactMediaCard key={experience.title} {...experience} alt={experience.title} action="Read more" />
          ))}
        </div>
      </CompactSection>

      <CompactSection id="wellbeing">
        <CompactImageText
          image={imgInteriorDetail}
          alt="A quiet, crafted Salt Route interior"
          eyebrow="A slower way to travel"
          title="Space for rest, renewal, and genuine connection."
          copy="Our journeys favour privacy, unhurried days, local knowledge, and experiences that feel natural rather than scheduled."
          href="/services"
          action="Explore experiences"
        />
      </CompactSection>

      <CompactSection className="bg-sand">
        <CompactImageText
          image={imgOffice}
          alt="The Salt Route hospitality team"
          eyebrow="For property owners"
          title="Hospitality shaped with care and commercial clarity."
          copy="We work with distinctive property owners to strengthen positioning, guest experience, operations, and long-term value."
          href="/for-owners"
          action="Partner with us"
          imageSide="right"
        />
      </CompactSection>

      <CompactSection id="vip-guestbook">
        <CompactHeading
          eyebrow="Guestbook"
          title="Words from recent stays."
          copy="A few reflections from guests who have experienced Salt Route hospitality in Nepal."
        />
        <div className="mt-7 grid gap-7 md:grid-cols-3">
          {guestbook.map((guest) => (
            <figure key={guest.name} className="grid grid-cols-[88px_1fr] gap-4 sm:grid-cols-1">
              <div className="relative aspect-square overflow-hidden bg-sand-dark sm:aspect-[4/3]">
                <Image src={guest.image} alt={guest.name} fill sizes="(max-width: 768px) 88px, 33vw" className="object-cover" />
              </div>
              <figcaption className="sm:pt-4">
                <blockquote className="font-display text-xl leading-7 text-navy">“{guest.quote}”</blockquote>
                <p className="mt-3 font-sans text-sm font-medium text-navy">{guest.name}</p>
                <p className="mt-0.5 font-sans text-xs leading-5 text-navy/58">{guest.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </CompactSection>

      <CompactSection className="bg-beige">
        <CompactImageText
          image={imgPrivateDining}
          alt="Private dining arranged by Salt Route"
          eyebrow="Plan your journey"
          title="Tell us where you want to begin."
          copy="Browse the collection or speak directly with our team for a private itinerary built around your pace and interests."
          href="/contact"
          action="Start a conversation"
        />
      </CompactSection>
    </div>
  )
}
