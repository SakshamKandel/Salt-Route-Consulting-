"use client"

import { useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLenis } from "lenis/react"
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Bath,
  BedDouble,
  ChevronDown,
  Clock3,
  Eye,
  MapPin,
  Maximize2,
  Play,
  Star,
  Users,
} from "lucide-react"
import { ParallaxImage } from "./motion"
import { WishlistButton } from "@/app/(public)/properties/[slug]/WishlistButton"
import { PropertyDetailMap } from "./PropertyDetailMap"
import { RoomGalleryLightbox } from "./property/RoomGalleryLightbox"
import { BrochureReservation } from "./property/BrochureReservation"
import { BrochureSections } from "./property/BrochureSections"
import { BrochureVideoBand } from "./property/BrochureVideoBand"
import type { PropertyDetail, RoomGalleryState } from "./property/types"
import {
  getBannerImageUrl,
  getImageMedia,
  getOptimizedVideoUrl,
  getVideoPosterUrl,
  isVideoUrl,
} from "@/lib/property-media"
import { toDateOnlyString } from "@/lib/booking-dates"
import { formatNpr } from "@/lib/currency"
import fallbackImage from "@/public/images/marketing/nepal-residence.jpg"

export type RelatedProperty = {
  id: string
  title: string
  slug: string
  location: string
  pricePerNight: number
  hidePrice?: boolean
  image: string | null
}

export type { PropertyDetail } from "./property/types"

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-dark">
      {children}
    </p>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-3.5 w-3.5 ${index < rating ? "fill-gold text-gold" : "text-navy/15"}`}
        />
      ))}
    </div>
  )
}

function CarouselControls({ target, label }: { target: React.RefObject<HTMLDivElement | null>; label: string }) {
  function move(direction: -1 | 1) {
    target.current?.scrollBy({ left: direction * Math.min(target.current.clientWidth * 0.82, 760), behavior: "smooth" })
  }
  return (
    <div className="flex items-center gap-2" aria-label={`${label} carousel controls`}>
      <button type="button" onClick={() => move(-1)} aria-label={`Previous ${label}`} className="grid h-10 w-10 place-items-center border border-navy/15 transition-colors hover:border-gold-dark hover:text-gold-dark"><ArrowLeft className="h-4 w-4" /></button>
      <button type="button" onClick={() => move(1)} aria-label={`Next ${label}`} className="grid h-10 w-10 place-items-center border border-navy/15 transition-colors hover:border-gold-dark hover:text-gold-dark"><ArrowRight className="h-4 w-4" /></button>
    </div>
  )
}

export default function PropertyDetailClient({
  property,
  wishlistItem,
  isOwnerView = false,
  previewMode = false,
  initialPhone = null,
  relatedProperties = [],
}: {
  property: PropertyDetail
  wishlistItem: boolean
  isOwnerView?: boolean
  isAuthenticated?: boolean
  eligibleBookingId?: string | null
  previewMode?: boolean
  initialPhone?: string | null
  relatedProperties?: RelatedProperty[]
}) {
  const router = useRouter()
  const lenis = useLenis()
  const images = getImageMedia(property.images)
  const heroImage =
    getBannerImageUrl(property.images) ||
    images[0]?.url ||
    (typeof fallbackImage === "string" ? fallbackImage : fallbackImage.src)
  const accentImage = images.find((image) => image.url !== heroImage)?.url || heroImage
  const roomTypes = property.roomTypes ?? []
  const sections = property.sections ?? []
  const reviews = property.reviews ?? []
  const videoMedia = property.images.find((item) => isVideoUrl(item.url))
  const videoUrl = videoMedia ? getOptimizedVideoUrl(videoMedia.url) : null
  const videoPoster = videoMedia ? getVideoPosterUrl(videoMedia.url) : null
  const today = useMemo(() => toDateOnlyString(new Date()), [])
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(2)
  const [phone, setPhone] = useState(initialPhone ?? "")
  const [roomTypeId, setRoomTypeId] = useState(roomTypes[0]?.id ?? "")
  const [roomGallery, setRoomGallery] = useState<RoomGalleryState | null>(null)
  const roomCarousel = useRef<HTMLDivElement>(null)
  const galleryCarousel = useRef<HTMLDivElement>(null)
  const relatedCarousel = useRef<HTMLDivElement>(null)

  const startingPrice = roomTypes.length
    ? Math.min(...roomTypes.map((room) => room.pricePerNight))
    : property.pricePerNight

  const facilityGroups = [
    { title: "Highlights", values: property.whatToExpect?.length ? property.whatToExpect : property.highlights },
    { title: "Services", values: property.services ?? [] },
    { title: "Amenities", values: property.amenities },
  ].filter((group) => group.values.length > 0)

  const faqs = [
    {
      question: "What time are check-in and check-out?",
      answer: `Check-in is from ${property.checkInTime || "2:00 PM"} and check-out is by ${property.checkOutTime || "11:00 AM"}. Tell our concierge if your journey needs different timing.`,
    },
    {
      question: `How do I get to ${property.title}?`,
      answer: property.gettingHere?.length
        ? property.gettingHere.map((leg) => `${leg.from}: approximately ${leg.time}${leg.distance ? ` (${leg.distance})` : ""}`).join(" ")
        : `Our concierge will arrange the most comfortable route to ${property.location} and can coordinate private transfers on request.`,
    },
    {
      question: "Is the property suitable for families and private groups?",
      answer: `Yes. The residence welcomes up to ${property.maxGuests} guests. We will recommend the best room arrangement after learning the ages and needs of your party.`,
    },
    {
      question: "What is included in the stay?",
      answer: (property.services?.length ? property.services : property.amenities)
        .slice(0, 6)
        .join(", ") || "A personally hosted stay with the essential comforts of the residence.",
    },
    {
      question: "How does booking confirmation work?",
      answer: "Send your preferred dates and room choice. The Salt Route concierge checks availability with the property and replies with a complete confirmation before any payment is requested.",
    },
  ]

  function handleReserve(customRoomId?: string) {
    if (previewMode) return
    const query = new URLSearchParams({ property: property.id })
    const chosenRoom = customRoomId || roomTypeId
    if (chosenRoom) query.set("room", chosenRoom)
    if (checkIn) query.set("checkIn", checkIn)
    if (checkOut) query.set("checkOut", checkOut)
    if (guests) query.set("guests", String(guests))
    if (phone.trim()) query.set("phone", phone.trim())
    router.push(`/booking-request?${query.toString()}`)
  }

  function selectRoom(roomId: string) {
    setRoomTypeId(roomId)
    requestAnimationFrame(scrollToBooking)
  }

  function scrollToBooking() {
    const target = document.getElementById("booking")
    if (!target) return
    if (lenis) {
      lenis.scrollTo(target, { offset: -72, duration: 1.05 })
    } else {
      const top = target.getBoundingClientRect().top + window.scrollY - 72
      window.scrollTo({ top, behavior: "smooth" })
    }
  }

  const mapQuery = encodeURIComponent([property.address, property.location, "Nepal"].filter(Boolean).join(", "))

  return (
    <div className="editorial-property min-h-screen bg-background text-navy selection:bg-gold selection:text-navy">
      {previewMode ? (
        <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-gold px-5 py-2.5 text-navy">
          <Eye className="h-3.5 w-3.5" />
          <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em]">
            Draft preview · not publicly visible
          </span>
        </div>
      ) : null}

      <section className="editorial-page-hero relative flex min-h-[560px] items-center justify-center overflow-hidden sm:min-h-[640px] lg:min-h-[700px]">
        <ParallaxImage className="absolute inset-0" speed={0.07}>
          <Image src={heroImage} alt={property.title} fill priority sizes="100vw" className="object-cover" />
        </ParallaxImage>
        <div className="absolute inset-0 bg-gradient-to-b from-navy-dark/35 via-navy-dark/20 to-navy-dark/70" />
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <p className="mb-5 flex items-center justify-center gap-2 font-sans text-[10px] font-semibold uppercase tracking-[0.26em] text-cream/80">
            <MapPin className="h-3.5 w-3.5 text-gold" />
            {property.location}
          </p>
          <h1 className="font-display text-[clamp(2.6rem,6vw,5.8rem)] leading-[0.98] tracking-[-0.02em] text-cream">
            {property.title}
          </h1>
          {property.tagline ? (
            <p className="mx-auto mt-6 max-w-2xl font-sans text-base font-light leading-7 text-cream/85 sm:text-lg">
              {property.tagline}
            </p>
          ) : null}
          <div className="mt-8 flex items-center justify-center gap-5">
            {videoUrl ? (
              <a href="#film" className="inline-flex items-center gap-2 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-cream">
                <Play className="h-3.5 w-3.5" /> Watch the film
              </a>
            ) : null}
            {!isOwnerView && !previewMode ? (
              <WishlistButton propertyId={property.id} initialWishlisted={wishlistItem} />
            ) : null}
            {isOwnerView ? (
              <Link href={`/owner/properties/${property.id}`} className="border border-cream/50 px-5 py-3 font-sans text-[10px] uppercase tracking-[0.18em]">
                Owner details
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {!isOwnerView ? (
        <section className="relative z-20 bg-cream text-navy">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              handleReserve()
            }}
            className="mx-auto grid max-w-[1180px] gap-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr_.65fr_auto] lg:items-end"
          >
            <div>
              <span className="font-sans text-[9px] font-semibold uppercase tracking-[0.18em] text-navy/45">
                {property.hidePrice ? "Rates" : "From"}
              </span>
              <p className="mt-1 font-display text-2xl">
                {property.hidePrice ? (
                  <span className="text-xl text-gold-dark">Request a Quote</span>
                ) : (
                  <>
                    {formatNpr(startingPrice)}{" "}
                    <span className="font-sans text-xs text-navy/45">/ night</span>
                  </>
                )}
              </p>
            </div>
            <label>
              <span className="font-sans text-[9px] font-semibold uppercase tracking-[0.18em] text-navy/45">Check in</span>
              <input type="date" min={today} value={checkIn} onChange={(event) => setCheckIn(event.target.value)} className="mt-1 h-10 w-full border-b border-navy/20 bg-transparent font-sans text-sm outline-none focus:border-gold-dark" />
            </label>
            <label>
              <span className="font-sans text-[9px] font-semibold uppercase tracking-[0.18em] text-navy/45">Check out</span>
              <input type="date" min={checkIn || today} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} className="mt-1 h-10 w-full border-b border-navy/20 bg-transparent font-sans text-sm outline-none focus:border-gold-dark" />
            </label>
            <label>
              <span className="font-sans text-[9px] font-semibold uppercase tracking-[0.18em] text-navy/45">Guests</span>
              <input type="number" min={1} max={property.maxGuests} value={guests} onChange={(event) => setGuests(Math.max(1, Math.min(property.maxGuests, Number(event.target.value) || 1)))} className="mt-1 h-10 w-full border-b border-navy/20 bg-transparent font-sans text-sm outline-none focus:border-gold-dark" />
            </label>
            <button type="submit" className="h-11 bg-gold px-7 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-navy transition-colors hover:bg-gold-light">
              Book now
            </button>
          </form>
        </section>
      ) : null}

      <section id="overview" className="bg-background py-20 sm:py-24 lg:py-32">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <Eyebrow>The residence</Eyebrow>
            <h2 className="mt-4 max-w-xl font-display text-[clamp(2rem,3.8vw,3.5rem)] leading-[1.08]">
              {property.story ? "Stay close to the character of the place." : `A private address in ${property.location}.`}
            </h2>
            <p className="mt-7 whitespace-pre-line font-sans text-[15px] font-light leading-8 text-navy/68 sm:text-base">
              {property.story || property.description}
            </p>
            <div className="mt-9 grid grid-cols-2 gap-x-8 gap-y-6  pt-7 sm:grid-cols-4">
              {[
                [property.bedrooms, "Bedrooms"],
                [property.bathrooms, "Bathrooms"],
                [property.maxGuests, "Guests"],
                [property.propertyType || "Private", "Style"],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="font-display text-2xl text-gold-dark">{value}</p>
                  <p className="mt-1 font-sans text-[9px] uppercase tracking-[0.18em] text-navy/45">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <ParallaxImage className="aspect-[4/3]" speed={0.06}>
            <Image src={accentImage} alt={property.title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </ParallaxImage>
        </div>
      </section>

      {images.length > 0 ? (
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-[1050px] px-5 sm:px-8">
            <div className="mb-10 flex items-end justify-between gap-8">
              <div>
                <Eyebrow>Visual journal</Eyebrow>
                <h2 className="mt-3 font-display text-4xl">A closer look</h2>
              </div>
              <div className="flex items-center gap-5"><span className="hidden font-sans text-[9px] uppercase tracking-[0.18em] text-navy/40 sm:inline">{images.length} photographs</span></div>
            </div>
            <div ref={galleryCarousel} className="editorial-gallery-grid flex snap-x snap-mandatory gap-4 overflow-x-auto pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {images.slice(0, 6).map((image, index) => (
                <button key={image.id} type="button" disabled={previewMode} onClick={() => setRoomGallery({ images: images.map((item) => item.url), active: index, name: property.title })} className="relative aspect-[4/3] min-w-[88%] snap-start overflow-hidden sm:min-w-[62%] lg:min-w-[52%]">
                  <Image src={image.url} alt={property.title + ", photograph " + (index + 1)} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-700 hover:scale-[1.02]" />
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {roomTypes.length > 0 ? (
        <>
          <section id="rooms" className="scroll-mt-24 bg-white py-20 lg:py-28">
            <div className="mx-auto max-w-[1050px] px-5 sm:px-8">
              <div className="mb-12 flex items-end justify-between gap-6">
                <div>
                  <Eyebrow>Rooms & suites</Eyebrow>
                  <h2 className="mt-3 font-display text-4xl">Choose your stay</h2>
                </div>

              </div>
              <div ref={roomCarousel} className="editorial-room-grid flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {roomTypes.map((room) => {
                  const roomImages = [...new Set([...(room.images ?? []), room.imageUrl].filter((url): url is string => Boolean(url)))]
                  const image = room.imageUrl || roomImages[0] || accentImage
                  return (
                    <article key={room.id} className="min-w-[88%] snap-start bg-background sm:min-w-[62%] lg:min-w-[46%]">
                      <button
                        type="button"
                        onClick={() => roomImages.length && setRoomGallery({ images: roomImages, active: 0, name: room.name })}
                        className="group relative block aspect-[16/10] w-full overflow-hidden text-left"
                        disabled={!roomImages.length || previewMode}
                        aria-label={`View ${room.name} photos`}
                      >
                        <Image src={image} alt={room.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                        {roomImages.length ? <span className="absolute bottom-4 right-4 bg-navy/85 px-3 py-2 font-sans text-[9px] uppercase tracking-[0.16em] text-cream"><Maximize2 className="mr-1.5 inline h-3 w-3" />{roomImages.length} photos</span> : null}
                      </button>
                      <div className="p-6 sm:p-7">
                        <div className="flex items-start justify-between gap-5">
                          <div>
                            <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-gold">{room.classType}</p>
                            <h3 className="mt-2 font-display text-2xl">{room.name}</h3>
                          </div>
                          {property.hidePrice || room.hidePrice ? (
                            <p className="shrink-0 font-display text-sm text-gold-dark font-medium">Request a Quote</p>
                          ) : (
                            <p className="shrink-0 font-display text-lg text-gold">{formatNpr(room.pricePerNight)}</p>
                          )}
                        </div>
                        {room.description ? <p className="mt-4 font-sans text-sm font-light leading-6 text-navy/62">{room.description}</p> : null}
                        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2  pt-5 font-sans text-[10px] uppercase tracking-[0.12em] text-navy/50">
                          <span><Users className="mr-1.5 inline h-3.5 w-3.5 text-gold" />{room.maxGuests} guests</span>
                          <span><BedDouble className="mr-1.5 inline h-3.5 w-3.5 text-gold" />{room.bedrooms} bed</span>
                          <span><Bath className="mr-1.5 inline h-3.5 w-3.5 text-gold" />{room.bathrooms} bath</span>
                        </div>
                        {!isOwnerView ? (
                          <button type="button" onClick={() => selectRoom(room.id)} className="mt-6 inline-flex items-center gap-2 px-0 py-3 font-sans text-[9px] font-semibold uppercase tracking-[0.18em] transition-colors hover:border-gold-dark hover:text-gold-dark">
                            Select room <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>
        </>
      ) : null}

      <BrochureSections sections={sections} />

      {facilityGroups.length > 0 || property.experiences?.length ? (
        <section id="experiences" className="scroll-mt-24 bg-background py-14 sm:py-20">
          <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
            <Eyebrow>At the property</Eyebrow>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">{property.amenitiesTitle || "Facilities & amenities"}</h2>
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {facilityGroups.map((group) => (
                <div key={group.title} className="p-5 sm:p-6">
                  <h3 className="font-display text-2xl">{group.title}</h3>
                  <ul className="mt-4 space-y-2 font-sans text-sm font-light leading-6 text-navy/75">
                    {group.values.slice(0, 12).map((value) => <li key={value}>{value}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            {!!property.experiences?.length && (
              <div className="mt-10 grid gap-8 md:grid-cols-2">
                {property.experiences.map((experience, index) => (
                  <article key={experience.id || `${experience.title}-${index}`}>
                    {experience.imageUrl && <div className="relative mb-5 aspect-[3/2] overflow-hidden"><Image src={experience.imageUrl} alt={experience.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div>}
                    <h3 className="font-display text-2xl">{experience.title}</h3>
                    <p className="mt-3 max-w-prose text-sm leading-7 text-navy/75">{experience.description}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}



      {videoUrl ? (
        <BrochureVideoBand videoUrl={videoUrl} videoPoster={videoPoster} title={property.title} />
      ) : null}

      <section className="border-y border-navy/8 bg-white py-20 lg:py-28">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-5 sm:px-8 lg:grid-cols-[1.25fr_.75fr] lg:items-stretch">
          <div className="min-h-[380px] overflow-hidden">
            <PropertyDetailMap location={property.location} address={property.address} title={property.title} />
          </div>
          <div className="flex flex-col justify-center p-7 sm:p-9">
            <Eyebrow>Location & access</Eyebrow>
            <h2 className="mt-4 font-display text-3xl">{property.location}</h2>
            {property.address ? <p className="mt-3 font-sans text-sm font-light leading-6 text-navy/55">{property.address}</p> : null}
            {property.gettingHere?.length ? (
              <div className="mt-7 space-y-5">
                {property.gettingHere.map((leg) => (
                  <div key={`${leg.from}-${leg.time}`} className="flex gap-3  pt-4">
                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <div>
                      <p className="font-display text-lg">{leg.time}</p>
                      <p className="mt-1 font-sans text-xs text-navy/50">{leg.from}{leg.distance ? ` · ${leg.distance}` : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
              <a href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noreferrer" className="mt-8 inline-flex w-fit items-center gap-2 border-b border-gold-dark pb-1 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-dark">
              Open directions <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {reviews.length > 0 ? (
        <section className="bg-background py-20 lg:py-28">
          <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
            <div className="mb-10">
              <Eyebrow>Guest reflections</Eyebrow>
              <h2 className="mt-3 font-display text-4xl">After the stay</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {reviews.slice(0, 3).map((review) => (
                <figure key={review.id} className="p-7 text-center">
                  <Stars rating={review.rating} />
                  <blockquote className="mt-5 font-display text-lg italic leading-7 text-navy/82">“{review.comment}”</blockquote>
                  <figcaption className="mt-6  pt-4 font-sans text-xs text-navy/50">{review.guest.name || "Verified guest"}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className=" bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-[980px] px-5 sm:px-8">
          <Eyebrow>Before you arrive</Eyebrow>
          <h2 className="mt-3 font-display text-4xl">Frequently asked questions</h2>
          <div className="mt-10 ">
            {faqs.map((faq, index) => (
              <details key={faq.question} className="group" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-sans text-sm text-navy/82">
                  {faq.question}
                  <ChevronDown className="h-4 w-4 shrink-0 text-gold transition-transform group-open:rotate-180" />
                </summary>
                <p className="max-w-3xl pb-6 pr-10 font-sans text-sm font-light leading-7 text-navy/58">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {relatedProperties.length > 0 ? (
        <section className="bg-cream py-20 text-navy lg:py-24">
          <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-dark">Continue exploring</p>
                <h2 className="mt-3 font-display text-4xl">More Salt Route stays</h2>
              </div>
              <div className="flex items-center gap-4"><Link href="/properties" className="hidden font-sans text-[10px] font-semibold uppercase tracking-[0.18em] sm:inline-flex">View all</Link><CarouselControls target={relatedCarousel} label="related properties" /></div>
            </div>
            <div ref={relatedCarousel} className="flex snap-x snap-mandatory gap-7 overflow-x-auto pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {relatedProperties.map((item) => (
                <article key={item.id} className="min-w-[84%] snap-start sm:min-w-[48%] lg:min-w-[31.5%]">
                  <Link href={`/properties/${item.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-sand">
                    <Image src={item.image || heroImage} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 hover:scale-[1.03]" />
                  </Link>
                  <p className="mt-5 font-sans text-[9px] uppercase tracking-[0.18em] text-gold-dark">{item.location}</p>
                  <h3 className="mt-2 font-display text-2xl"><Link href={`/properties/${item.slug}`}>{item.title}</Link></h3>
                  {item.hidePrice ? (
                    <p className="mt-2 font-sans text-xs text-gold-dark font-medium">Request a Quote</p>
                  ) : (
                    <p className="mt-2 font-sans text-xs text-navy/50">From {formatNpr(item.pricePerNight)} / night</p>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {!isOwnerView ? (
        <BrochureReservation
          image={accentImage}
          startingPrice={startingPrice}
          roomTypes={roomTypes}
          maxGuests={property.maxGuests}
          today={today}
          resPhone={phone}
          setResPhone={setPhone}
          guests={guests}
          setGuests={setGuests}
          checkIn={checkIn}
          setCheckIn={setCheckIn}
          checkOut={checkOut}
          setCheckOut={setCheckOut}
          roomTypeId={roomTypeId}
          setRoomTypeId={setRoomTypeId}
          onSubmit={() => handleReserve()}
          previewMode={previewMode}
          hidePrice={Boolean(property.hidePrice)}
        />
      ) : null}

      <RoomGalleryLightbox roomGallery={roomGallery} setRoomGallery={setRoomGallery} />
    </div>
  )
}
