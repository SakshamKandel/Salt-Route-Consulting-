"use client"

import { useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useReducedMotion } from "framer-motion"
import { getPrimaryImageUrl, type PropertyMediaLike } from "@/lib/property-media"
import { LocationCombobox, type ComboboxProperty } from "@/components/public/LocationCombobox"
import {
  ParallaxImage,
  Reveal,
  RevealText,
} from "@/components/public/motion"
import {
  CompactButton,
  CompactContainer,
  CompactHeading,
  CompactImageText,
  CompactMediaCard,
  CompactSection,
} from "@/components/public/Compact"
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Compass,
  MapPin,
  Quote,
  Star,
  Users,
} from "lucide-react"
import imgRetreatExterior from "@/public/images/marketing/himalayan-retreat-exterior.png"
import imgVillaMain from "@/public/images/marketing/sunshine-villa-main.png"
import imgPrivateDining from "@/public/images/marketing/private-himalayan-dining.png"
import imgInteriorDetail from "@/public/images/marketing/nepalese-interior-details.png"
import imgOffice from "@/public/images/marketing/boutique-office-team.png"
import imgTrustedSwissContact from "@/public/brand/Trusted By/SwissContact.png"
import imgTrustedRedPanda from "@/public/brand/Trusted By/Red Panda Network.png"
import imgTrustedSunshineVilla from "@/public/brand/Trusted By/Sunshine VIlla.png"
import imgTrustedNatureCoffee from "@/public/brand/Trusted By/Nature Coffee.png"

type FeaturedProperty = {
  id: string
  title: string
  slug: string
  location: string
  images: PropertyMediaLike[]
  pricePerNight?: number
  hidePrice?: boolean
  description?: string
  propertyType?: string
  maxGuests?: number
  bedrooms?: number
  rating?: number | null
  reviewCount?: number
  createdAt?: string | Date
}

type TestimonialItem = {
  id: string
  quote: string
  name: string
  role: string | null
  source: string | null
  kind: "DIPLOMATIC" | "VERIFIED"
  rating: number
  location: string | null
}

type GuestReviewItem = {
  id: string
  rating: number
  comment: string
  guestName: string
  propertyTitle: string
  propertySlug: string
  location: string
  createdAt: string
}

const HERO_VIDEO =
  "https://res.cloudinary.com/diu4mp2f3/video/upload/f_auto,q_auto,c_limit,w_1920/v1780381657/salt-route/home-hero.mp4"
const HERO_POSTER =
  "https://res.cloudinary.com/diu4mp2f3/video/upload/f_auto,q_auto,so_0/v1780381657/salt-route/home-hero.jpg"

const trustedBy = [
  {
    src: imgTrustedSwissContact,
    name: "SwissContact",
  },
  {
    src: imgTrustedRedPanda,
    name: "Red Panda Network",
  },
  {
    src: imgTrustedSunshineVilla,
    name: "Sunshine Villa",
  },
  {
    src: imgTrustedNatureCoffee,
    name: "Nature Coffee",
  },
]

const experiences = [
  {
    image: imgPrivateDining,
    title: "Private Dining in the Hills",
    copy: "Seasonal menus, local Himalayan produce, and a private table set around your stay in the hills.",
    href: "/services",
  },
  {
    image: imgRetreatExterior,
    title: "Himalayan Homes",
    copy: "Private houses, villas, and small retreats with quiet, wide views, and a real connection to local life.",
    href: "/properties",
  },
  {
    image: imgInteriorDetail,
    title: "Craft, Culture & Rituals",
    copy: "Old woodwork, living crafts, and time with local artisans, planned around what you want to see.",
    href: "/about",
  },
]

function formatPrice(value?: number) {
  if (!value) return null
  return `NPR ${Math.round(value).toLocaleString("en-US")}`
}

function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? "fill-gold text-gold" : "text-navy/15"}`}
        />
      ))}
    </div>
  )
}

function HeroMedia() {
  const reduce = useReducedMotion()
  const [videoReady, setVideoReady] = useState(false)

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-navy">
      <Image
        src={HERO_POSTER}
        alt="A Salt Route Himalayan sanctuary at first light"
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className={`object-cover transition-opacity duration-1000 ${
          videoReady ? "opacity-0" : "opacity-100"
        }`}
      />
      {!reduce && (
        <video
          src={HERO_VIDEO}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden
          onCanPlay={() => setVideoReady(true)}
          onLoadedData={() => setVideoReady(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-out ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25" />
    </div>
  )
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

  const labelClass =
    "flex items-center gap-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/60 mb-1"

  return (
    <form
      onSubmit={submit}
      className="grid gap-x-6 gap-y-5 border border-navy/10 bg-sand px-6 py-7 shadow-lg sm:px-8 lg:grid-cols-[1.35fr_1fr_1fr_.65fr_auto] lg:items-end"
    >
      <label className="block">
        <span className={labelClass}>
          <MapPin className="h-3 w-3 text-gold-dark" />
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
        <span className={labelClass}>
          <Calendar className="h-3 w-3 text-gold-dark" />
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
        <span className={labelClass}>
          <Calendar className="h-3 w-3 text-gold-dark" />
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
        <span className={labelClass}>
          <Users className="h-3 w-3 text-gold-dark" />
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
        className="min-h-12 bg-navy px-8 font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-cream transition-colors duration-300 hover:bg-gold-dark hover:text-white"
      >
        Find a stay
      </button>
    </form>
  )
}

function CarouselControls({ target, label }: { target: React.RefObject<HTMLDivElement | null>; label: string }) {
  function move(direction: -1 | 1) {
    if (!target.current) return
    const cardWidth = target.current.firstElementChild ? (target.current.firstElementChild as HTMLElement).offsetWidth + 28 : 380
    target.current.scrollBy({ left: direction * cardWidth, behavior: "smooth" })
  }
  return (
    <div className="flex items-center gap-2" aria-label={`${label} carousel controls`}>
      <button
        type="button"
        onClick={() => move(-1)}
        aria-label={`Previous ${label}`}
        className="grid h-10 w-10 place-items-center border border-navy/15 bg-white text-navy transition-all duration-300 hover:border-gold-dark hover:bg-gold hover:text-navy active:scale-95"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => move(1)}
        aria-label={`Next ${label}`}
        className="grid h-10 w-10 place-items-center border border-navy/15 bg-white text-navy transition-all duration-300 hover:border-gold-dark hover:bg-gold hover:text-navy active:scale-95"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function HomeClient({
  featured = [],
  allProperties = [],
  testimonials = [],
}: {
  featured?: FeaturedProperty[]
  allProperties?: ComboboxProperty[]
  testimonials?: TestimonialItem[]
  guestReviews?: GuestReviewItem[]
}) {
  const propertyCarouselRef = useRef<HTMLDivElement>(null)
  const propertiesToDisplay = featured.length > 0 ? featured : (allProperties as unknown as FeaturedProperty[])

  const diplomatic = useMemo(
    () => testimonials.filter((t) => t.kind === "DIPLOMATIC"),
    [testimonials],
  )
  return (
    <div className="overflow-hidden bg-background text-navy">
      {/* ─── 1. CINEMATIC VIDEO HERO ─── */}
      <section className="relative flex min-h-[660px] items-end overflow-hidden sm:min-h-[760px] lg:min-h-[880px]">
        <HeroMedia />

        <CompactContainer className="relative z-10 w-full pb-16 sm:pb-20 lg:pb-28">
          <div className="max-w-3xl text-cream">
            <RevealText
              as="h1"
              lines={["Stay close to", "the real Nepal."]}
              className="font-display text-[clamp(2.75rem,6.5vw,6rem)] leading-[0.98] tracking-[-0.02em]"
              clipPad="0.12em"
            />

            <Reveal delay={0.15} y={20}>
              <p className="mt-7 max-w-2xl font-sans text-base font-light leading-relaxed text-cream/90 sm:text-lg">
                Private homes, warm hosts, and journeys built around Nepal&rsquo;s mountains,
                villages, and living culture.
              </p>
            </Reveal>

            <Reveal delay={0.25} y={20}>
              <div className="mt-10 flex flex-wrap items-center gap-5">
                <CompactButton href="/properties" className="min-h-12 px-8">
                  Browse Our Homes
                </CompactButton>
                <CompactButton
                  href="/services"
                  tone="text"
                  className="text-xs uppercase tracking-[0.16em] text-cream hover:text-gold"
                >
                  Plan Your Journey →
                </CompactButton>
              </div>
            </Reveal>
          </div>
        </CompactContainer>

        {/* Scroll cue */}
        <div className="absolute bottom-6 right-5 z-10 hidden items-center gap-3 text-cream/60 lg:flex">
          <span className="font-sans text-[10px] uppercase tracking-[0.24em]">Scroll</span>
          <span className="block h-10 w-px bg-gradient-to-b from-cream/60 to-transparent" />
        </div>
      </section>

      {/* ─── 2. DOCKED STAY SEARCH ─── */}
      <CompactContainer className="relative z-20 -mt-12 sm:-mt-16">
        <Reveal y={16}>
          <StaySearch properties={allProperties} />
        </Reveal>
      </CompactContainer>

      {/* ─── TRUSTED BY ─── */}
      <section className="border-y border-navy/6 bg-white">
        <CompactContainer className="py-12 lg:py-16">
          <Reveal>
            <p className="text-center font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-navy/45">
              Trusted By
            </p>
            <ul className="mt-8 grid grid-cols-2 items-center gap-x-10 gap-y-8 sm:grid-cols-4">
              {trustedBy.map((partner) => (
                <li key={partner.name} className="relative flex h-12 w-full max-w-[180px] items-center justify-center">
                  <Image
                    src={partner.src}
                    alt={partner.name}
                    fill
                    sizes="(max-width: 640px) 40vw, 180px"
                    className="max-h-12 w-auto object-contain opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
                  />
                </li>
              ))}
            </ul>
          </Reveal>
        </CompactContainer>
      </section>

      {/* ─── 3. MANIFESTO ─── */}
      <CompactSection className="pb-8 pt-20 lg:pt-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="mb-4 font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-dark">
                The Salt Route
              </p>
            </Reveal>
            <RevealText
              as="h2"
              lines={[
                "We do not simply",
                "open doors.",
                "We open places.",
              ]}
              className="font-display text-[clamp(2rem,4vw,3.6rem)] leading-[1.08] tracking-[-0.015em] text-navy"
              clipPad="0.1em"
            />
            <Reveal delay={0.1} y={20}>
              <div className="mt-8 max-w-2xl space-y-5 font-sans text-base font-light leading-8 text-navy/75">
                <p>
                  For centuries the salt route carried more than trade across these mountains — it
                  carried language, ritual, and the quiet exchange between strangers who became
                  guests. We named our collection after that inheritance, because the way you arrive
                  somewhere still matters.
                </p>
                <p>
                  Every residence in our portfolio is personally walked, photographed, and stayed in
                  before it is ever offered. We look for the qualities a photograph cannot confirm:
                  the stillness at dawn, the warmth of the kitchen, the neighbour who will show you
                  the path up the ridge.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={0.12}>
              <ParallaxImage className="aspect-[4/5] w-full" speed={0.08}>
                <Image
                  src={imgVillaMain}
                  alt="A Salt Route residence framed by Himalayan tea gardens"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </ParallaxImage>
            </Reveal>
          </div>
        </div>
      </CompactSection>

      {/* ─── 4. SELECTED SANCTUARIES ─── */}
      <CompactSection className="py-20 lg:py-28">
        <Reveal className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <CompactHeading
            eyebrow="Curated Portfolio"
            title="Sanctuaries with a profound sense of place."
            copy="A rare collection of private residences and boutique retreats chosen for architectural character, uncompromised comfort, and an honest connection to the landscape around them."
          />
          <div className="flex items-center gap-4 shrink-0">
            <CompactButton
              href="/properties"
              tone="text"
              className="hidden sm:inline-flex font-medium tracking-[0.16em]"
            >
              View all ({propertiesToDisplay.length || allProperties.length}) →
            </CompactButton>
            <CarouselControls target={propertyCarouselRef} label="sanctuaries" />
          </div>
        </Reveal>

        {propertiesToDisplay.length ? (
          <div
            ref={propertyCarouselRef}
            className="flex snap-x snap-mandatory gap-7 overflow-x-auto pb-8 pt-1 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {propertiesToDisplay.map((property, index) => {
              const image = getPrimaryImageUrl(property.images) || imgRetreatExterior
              return (
                <article
                  key={property.id}
                  className="group flex min-w-[88%] snap-start sm:min-w-[48%] lg:min-w-[31.8%] flex-col border border-navy/10 bg-white shadow-xs transition-all duration-500 hover:border-gold/50 hover:shadow-xl hover:-translate-y-1"
                >
                  <Link
                    href={`/properties/${property.slug}`}
                    className="relative block aspect-[16/10] overflow-hidden bg-sand-dark"
                  >
                    <Image
                      src={image}
                      alt={property.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute left-3 top-3 bg-navy/85 px-2.5 py-1 font-sans text-[9px] font-medium uppercase tracking-[0.18em] text-cream backdrop-blur-xs">
                      {property.propertyType || "Sanctuary"}
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <p className="flex items-center gap-1.5 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-navy/55">
                      <MapPin className="h-3 w-3 text-gold-dark" />
                      {property.location}
                    </p>
                    <h3 className="mt-3 font-display text-2xl leading-tight text-navy transition-colors group-hover:text-gold-dark">
                      <Link href={`/properties/${property.slug}`}>{property.title}</Link>
                    </h3>
                    {property.description && (
                      <p className="mt-3 line-clamp-2 font-sans text-sm font-light leading-relaxed text-navy/70">
                        {property.description}
                      </p>
                    )}
                    {property.reviewCount ? (
                      <div className="mt-4 flex items-center gap-2">
                        <Stars rating={Math.round(property.rating ?? 5)} />
                        <span className="font-sans text-[11px] text-navy/50">
                          {(property.rating ?? 5).toFixed(1)} · {property.reviewCount} review
                          {property.reviewCount === 1 ? "" : "s"}
                        </span>
                      </div>
                    ) : null}
                    <div className="mt-auto flex items-center justify-between gap-4 border-t border-navy/8 pt-5 font-sans text-xs text-navy/70">
                      <span>
                        {property.maxGuests ? `Up to ${property.maxGuests} guests` : "Private stay"}
                      </span>
                      {property.hidePrice ? (
                        <span className="font-medium text-gold-dark tracking-wide">
                          Request a Quote
                        </span>
                      ) : formatPrice(property.pricePerNight) ? (
                        <span className="font-semibold text-navy">
                          From {formatPrice(property.pricePerNight)}{" "}
                          <span className="font-light text-navy/50">/ night</span>
                        </span>
                      ) : null}
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
            copy="Speak with our private concierge for exclusive sanctuaries and tailored journeys currently available across Nepal."
            href="/contact"
            action="Contact our team"
          />
        )}
      </CompactSection>

      {/* ─── 5. BESPOKE EXPERIENCES ─── */}
      <CompactSection className="border-y border-navy/6 bg-beige py-20 lg:py-28">
        <Reveal>
          <CompactHeading
            eyebrow="Curated Journeys"
            title="Simple moments, thoughtfully arranged."
            copy="Every stay is enriched with bespoke culinary offerings, cultural heritage encounters, wellbeing, and unhurried outdoor adventures — each one rooted in its distinct destination rather than lifted from a template."
          />
        </Reveal>
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {experiences.map((experience, index) => (
            <Reveal key={experience.title} delay={index * 0.1}>
              <CompactMediaCard {...experience} alt={experience.title} action="Explore Experience" />
            </Reveal>
          ))}
        </div>
      </CompactSection>

      {/* ─── 6. THE PHILOSOPHY OF SLOW TRAVEL ─── */}
      <CompactSection id="wellbeing" className="py-20 lg:py-28">
        <Reveal>
          <CompactImageText
            image={imgInteriorDetail}
            alt="A quiet, crafted Salt Route interior"
            eyebrow="The Art of Slow Living"
            title="Space for quiet reflection, renewal, and genuine connection."
            copy="Our journeys favour unhurried days, rare local insights, and experiences that feel natural rather than programmed. From dawn tea rituals overlooking the Annapurnas to fireside conversations in historic courtyards, we create sanctuaries where time genuinely slows down."
            href="/services"
            action="Explore our approach"
          />
        </Reveal>
      </CompactSection>

      {/* ─── 7. GUESTBOOK ─── */}
      {diplomatic.length > 0 ? (
        <section id="vip-guestbook" className="border-y border-navy/8 bg-white py-14 lg:py-18">
          <CompactContainer>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-sans text-[9px] font-semibold uppercase tracking-[0.22em] text-gold-dark">The guestbook</p>
                <h2 className="mt-2 font-display text-[clamp(1.8rem,3vw,2.6rem)] leading-tight text-navy">Notes left behind.</h2>
              </div>
              <p className="max-w-sm font-sans text-xs font-light leading-6 text-navy/52">A few words shared after staying with Salt Route.</p>
            </div>
            <div className="mt-9 grid border-y border-navy/10 md:grid-cols-3">
              {diplomatic.slice(0, 3).map((guest, index) => (
                <figure key={guest.id} className={`py-7 md:px-7 ${index > 0 ? "border-t border-navy/10 md:border-l md:border-t-0" : "md:pl-0"}`}>
                  <Quote className="h-4 w-4 text-gold-dark/55" />
                  <blockquote className="mt-4 font-display text-lg italic leading-7 text-navy/78">“{guest.quote}”</blockquote>
                  <figcaption className="mt-5 text-[10px] leading-5 text-navy/48"><span className="font-semibold text-navy">{guest.name}</span>{guest.role ? <span className="block">{guest.role}</span> : null}</figcaption>
                </figure>
              ))}
            </div>
          </CompactContainer>
        </section>
      ) : null}

      {/* ─── 9. FOR PROPERTY OWNERS PARTNERSHIP TEASER ─── */}
      <CompactSection className="py-20 lg:py-28">
        <Reveal>
          <CompactImageText
            image={imgOffice}
            alt="The Salt Route hospitality team"
            eyebrow="For Estate &amp; Boutique Property Owners"
            title="Hospitality shaped with care and commercial clarity."
            copy="We partner with distinctive property owners to elevate architectural positioning, guest care standards, direct distribution, and long-term asset appreciation. Our full-spectrum management ensures your estate is represented with prestige and sustained profitability."
            href="/for-owners"
            action="Explore Owner Partnership"
            imageSide="right"
          />
        </Reveal>
      </CompactSection>

      {/* ─── 10. BESPOKE TRIP PLANNING / CTA ─── */}
      <CompactSection className="bg-navy py-24 text-cream lg:py-32">
        <Reveal className="mx-auto max-w-4xl text-center">
          <span className="flex items-center justify-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">
            <Compass className="h-3.5 w-3.5" />
            Begin Your Journey
          </span>
          <h2 className="mt-5 font-display text-[clamp(2.5rem,4.5vw,4.5rem)] leading-tight text-cream">
            Tell us where you want to begin.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl font-sans text-base font-light leading-relaxed text-cream/80 sm:text-lg">
            Browse our hand-picked collection of Himalayan sanctuaries, or speak directly with our
            private concierge to curate an itinerary tailored entirely to your pace.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
            <CompactButton href="/contact" className="min-h-12 bg-gold px-8 text-white hover:bg-gold-dark">
              Start a Conversation
            </CompactButton>
            <CompactButton
              href="/properties"
              tone="text"
              className="text-xs uppercase tracking-[0.16em] text-cream hover:text-gold"
            >
              Browse All Stays →
            </CompactButton>
          </div>
        </Reveal>
      </CompactSection>
    </div>
  )
}
