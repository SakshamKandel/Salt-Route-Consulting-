"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { PropertyDetail } from "./property/types"
import { WishlistButton } from "@/app/(public)/properties/[slug]/WishlistButton"
import { PropertyDetailMap } from "@/components/public/PropertyDetailMap"
import { PropertyReviewForm } from "@/components/public/PropertyReviewForm"
import {
  getBannerImageUrl,
  getImageMedia,
  getOptimizedVideoUrl,
  getVideoPosterUrl,
  isVideoUrl,
} from "@/lib/property-media"
import { toDateOnlyString } from "@/lib/booking-dates"
import { formatNpr } from "@/lib/currency"
import {
  CompactButton,
  CompactContainer,
  CompactHeading,
  CompactImageText,
  CompactSection,
} from "@/components/public/Compact"
import fallbackImage from "@/public/images/marketing/himalayan-retreat-exterior.png"

export type { PropertyDetail } from "./property/types"

export default function PropertyDetailClient({
  property,
  wishlistItem,
  isOwnerView = false,
  isAuthenticated = false,
  eligibleBookingId = null,
  previewMode = false,
  initialPhone = null,
}: {
  property: PropertyDetail
  wishlistItem: boolean
  isOwnerView?: boolean
  isAuthenticated?: boolean
  eligibleBookingId?: string | null
  previewMode?: boolean
  initialPhone?: string | null
}) {
  const router = useRouter()
  const images = getImageMedia(property.images)
  const heroImage = getBannerImageUrl(property.images) || images[0]?.url || fallbackImage
  const videoMedia = property.images.find((item) => isVideoUrl(item.url))
  const videoUrl = videoMedia ? getOptimizedVideoUrl(videoMedia.url) : undefined
  const videoPoster = videoMedia ? getVideoPosterUrl(videoMedia.url) : null
  const roomTypes = property.roomTypes ?? []
  const sections = property.sections ?? []
  const reviews = property.reviews ?? []
  const today = useMemo(() => toDateOnlyString(new Date()), [])
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(2)
  const [roomTypeId, setRoomTypeId] = useState(roomTypes[0]?.id ?? "")
  const [phone, setPhone] = useState(initialPhone ?? "")
  const startingPrice = roomTypes.length
    ? Math.min(...roomTypes.map((room) => room.pricePerNight))
    : property.pricePerNight
  const averageRating = reviews.length
    ? (reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1)
    : null

  function goToBooking() {
    if (previewMode) return
    const query = new URLSearchParams({ property: property.id })
    if (roomTypeId) query.set("room", roomTypeId)
    if (checkIn) query.set("checkIn", checkIn)
    if (checkOut) query.set("checkOut", checkOut)
    if (guests > 0) query.set("guests", String(guests))
    if (phone.trim()) query.set("phone", phone.trim())
    router.push(`/booking-request?${query.toString()}`)
  }

  const facts = property.stayDetails?.length
    ? property.stayDetails
    : [
        { label: "Bedrooms", value: String(property.bedrooms) },
        { label: "Bathrooms", value: String(property.bathrooms) },
        { label: "Guests", value: `Up to ${property.maxGuests}` },
        { label: "Stay", value: property.propertyType || "Private property" },
      ]

  const storyImage = images.find((image) => image.url !== heroImage)?.url || heroImage
  const gallery = images.filter((image) => image.url !== heroImage).slice(0, 6)
  const facilityGroups: { title: string; values: string[] }[] = [
    { title: "Highlights", values: property.whatToExpect ?? [] },
    { title: "Services", values: property.services ?? [] },
    { title: "Amenities", values: property.amenities },
  ].filter((group) => group.values.length > 0)
  const fieldClass =
    "mt-2 min-h-11 w-full border border-navy/14 bg-white px-3 py-2.5 font-sans text-sm text-navy outline-none focus:border-navy"

  return (
    <div className={`bg-background text-navy ${previewMode ? "" : "min-h-screen"}`}>
      <section className="relative min-h-[520px] overflow-hidden sm:min-h-[640px]">
        <Image src={heroImage} alt={property.title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/38" />
        <CompactContainer className="relative flex min-h-[520px] items-end pb-8 text-cream sm:min-h-[640px] sm:pb-11">
          <div className="w-full max-w-3xl">
            <p className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-cream/80">
              {property.propertyType || "Salt Route stay"} · {property.location}
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.75rem,5.5vw,5.5rem)] leading-[.98] tracking-[-0.02em]">{property.title}</h1>
            {property.tagline ? <p className="mt-4 max-w-xl font-sans text-base font-light leading-7 text-cream/88 sm:text-lg">{property.tagline}</p> : null}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {isOwnerView ? (
                <CompactButton href={`/owner/properties/${property.id}`}>Manage property</CompactButton>
              ) : (
                <button type="button" onClick={() => document.getElementById("reservation")?.scrollIntoView({ behavior: "smooth" })} className="min-h-11 bg-camel px-6 font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-white hover:bg-camel-dark">
                  Request this stay
                </button>
              )}
              {!previewMode && !isOwnerView ? <WishlistButton propertyId={property.id} initialWishlisted={wishlistItem} /> : null}
            </div>
          </div>
        </CompactContainer>
      </section>

      {!isOwnerView ? (
        <CompactContainer className="py-5">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              goToBooking()
            }}
            className="grid gap-4 bg-sand px-5 py-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_.7fr_auto] lg:items-end"
          >
            <label className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-navy/55">Check in<input type="date" min={today} value={checkIn} onChange={(event) => setCheckIn(event.target.value)} className={fieldClass} /></label>
            <label className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-navy/55">Check out<input type="date" min={checkIn || today} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} className={fieldClass} /></label>
            <label className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-navy/55">Guests<input type="number" min={1} max={property.maxGuests} value={guests} onChange={(event) => setGuests(Math.max(1, Math.min(property.maxGuests, Number(event.target.value) || 1)))} className={fieldClass} /></label>
            <button type="submit" className="min-h-11 bg-navy px-6 font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-cream hover:bg-navy-dark">Check stay</button>
          </form>
        </CompactContainer>
      ) : null}

      <CompactSection className="pt-5 sm:pt-7">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {facts.slice(0, 4).map((fact) => (
            <div key={fact.label} className="bg-beige p-5">
              <p className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-navy/50">{fact.label}</p>
              <p className="mt-1 font-display text-2xl text-navy">{fact.value}</p>
            </div>
          ))}
        </div>
      </CompactSection>

      <CompactSection className="bg-beige">
        <CompactImageText
          image={storyImage}
          alt={`${property.title} story`}
          eyebrow="The property"
          title={property.highlightsTitle || "A stay shaped by its setting."}
          copy={property.story || property.description}
        >
          {property.highlights.length ? (
            <ul className="mt-5 grid gap-2 font-sans text-sm font-light leading-6 text-navy/68 sm:grid-cols-2">
              {property.highlights.slice(0, 6).map((item) => <li key={item}>{item}</li>)}
            </ul>
          ) : null}
        </CompactImageText>
      </CompactSection>

      {sections.map((section, index) => (
        <CompactSection key={section.id}>
          {section.imageUrl ? (
            <CompactImageText
              image={section.imageUrl}
              alt={section.title}
              eyebrow={section.subtitle || undefined}
              title={section.title}
              copy={section.body}
              imageSide={index % 2 === 0 ? "left" : "right"}
            />
          ) : (
            <div className="max-w-3xl">
              {section.subtitle ? <p className="font-sans text-[11px] uppercase tracking-[0.14em] text-navy/52">{section.subtitle}</p> : null}
              <h2 className="mt-2 font-display text-3xl text-navy">{section.title}</h2>
              <p className="mt-3 font-sans text-base font-light leading-7 text-navy/70">{section.body}</p>
            </div>
          )}
        </CompactSection>
      ))}

      {gallery.length ? (
        <CompactSection>
          <CompactHeading eyebrow="Gallery" title="A closer look at the stay." />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((image) => (
              <div key={image.id} className="relative aspect-[4/3] overflow-hidden bg-sand-dark">
                <Image src={image.url} alt={image.alt || property.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              </div>
            ))}
          </div>
        </CompactSection>
      ) : null}

      {roomTypes.length ? (
        <CompactSection className="bg-sand" id="rooms">
          <CompactHeading
            eyebrow="Rooms and residences"
            title="Choose the space that suits your stay."
            copy={`Rates start from ${formatNpr(startingPrice)} per night.`}
          />
          <div className="mt-7 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {roomTypes.map((room) => {
              const image = room.images?.[0] || room.imageUrl || heroImage
              return (
                <article key={room.id}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-sand-dark"><Image src={image} alt={room.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /></div>
                  <p className="mt-4 font-sans text-[10px] uppercase tracking-[0.14em] text-navy/52">{room.classType}</p>
                  <h3 className="mt-1 font-display text-2xl text-navy">{room.name}</h3>
                  {room.description ? <p className="mt-2 font-sans text-[15px] font-light leading-6 text-navy/68">{room.description}</p> : null}
                  <p className="mt-3 font-sans text-sm text-navy/62">{formatNpr(room.pricePerNight)} per night · up to {room.maxGuests} guests</p>
                  {!isOwnerView ? (
                    <button type="button" onClick={() => { setRoomTypeId(room.id); document.getElementById("reservation")?.scrollIntoView({ behavior: "smooth" }) }} className="mt-4 bg-camel px-5 py-3 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-white hover:bg-camel-dark">Choose room</button>
                  ) : null}
                </article>
              )
            })}
          </div>
        </CompactSection>
      ) : null}

      {(property.whatToExpect?.length || property.services?.length || property.amenities.length) ? (
        <CompactSection>
          <CompactHeading eyebrow="At the property" title={property.amenitiesTitle || "What to expect during your stay."} />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {facilityGroups.map((group) => (
              <div key={group.title} className="bg-beige p-5">
                <h3 className="font-display text-2xl text-navy">{group.title}</h3>
                <ul className="mt-3 space-y-1.5 font-sans text-sm font-light leading-6 text-navy/68">
                  {group.values.slice(0, 12).map((value) => <li key={value}>{value}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </CompactSection>
      ) : null}

      {videoUrl ? (
        <CompactSection className="bg-beige" id="virtual-tour">
          <CompactHeading eyebrow="Film" title={`Experience ${property.title}.`} />
          <video controls playsInline poster={videoPoster || undefined} className="mt-6 aspect-video w-full bg-navy object-cover">
            <source src={videoUrl} />
          </video>
        </CompactSection>
      ) : null}

      <CompactSection>
        <div className="grid gap-7 lg:grid-cols-12 lg:gap-10">
          <div className="h-[340px] overflow-hidden bg-sand-dark lg:col-span-7 sm:h-[420px]">
            <PropertyDetailMap location={property.location} address={property.address} title={property.title} />
          </div>
          <div className="lg:col-span-5 lg:px-4">
            <p className="font-sans text-[11px] uppercase tracking-[0.14em] text-navy/52">Location</p>
            <h2 className="mt-2 font-display text-3xl text-navy">{property.location}</h2>
            {property.address ? <p className="mt-3 font-sans text-base font-light leading-7 text-navy/70">{property.address}</p> : null}
            {property.neighborhood ? <p className="mt-3 font-sans text-base font-light leading-7 text-navy/70">{property.neighborhood}</p> : null}
            {property.gettingHere?.length ? (
              <ul className="mt-5 space-y-2 font-sans text-sm text-navy/65">{property.gettingHere.map((row) => <li key={`${row.time}-${row.from}`}>{row.time} from {row.from}{row.distance ? ` · ${row.distance}` : ""}</li>)}</ul>
            ) : null}
          </div>
        </div>
      </CompactSection>

      <CompactSection className="bg-sand">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <CompactHeading eyebrow="Guest reviews" title={averageRating ? `${averageRating} from recent guests.` : "Reflections from recent guests."} />
          <p className="font-sans text-sm text-navy/55">{property._count?.reviews ?? reviews.length} reviews</p>
        </div>
        {reviews.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {reviews.slice(0, 6).map((review) => (
              <figure key={review.id} className="bg-white p-5">
                <p className="font-sans text-sm text-gold-dark">{review.rating} / 5</p>
                <blockquote className="mt-2 font-display text-xl leading-7 text-navy">“{review.comment}”</blockquote>
                <figcaption className="mt-3 font-sans text-xs text-navy/54">{review.guest.name || "Salt Route guest"}</figcaption>
              </figure>
            ))}
          </div>
        ) : null}
        {!isOwnerView ? (
          <div className="mt-7 bg-beige p-5 sm:p-6"><PropertyReviewForm eligibleBookingId={eligibleBookingId} isAuthenticated={isAuthenticated} propertySlug={property.slug} /></div>
        ) : null}
      </CompactSection>

      {!isOwnerView ? (
        <CompactSection id="reservation">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-12">
            <CompactHeading
              eyebrow="Request the stay"
              title="Choose the details and continue."
              copy={`Rates start from ${formatNpr(startingPrice)} per night. The next page confirms availability and collects the full request.`}
            />
            <form
              onSubmit={(event) => { event.preventDefault(); goToBooking() }}
              className="grid gap-5 bg-beige p-5 sm:grid-cols-2 sm:p-6"
            >
              {roomTypes.length ? (
                <label className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-navy/55 sm:col-span-2">Room or residence<select value={roomTypeId} onChange={(event) => setRoomTypeId(event.target.value)} className={fieldClass}>{roomTypes.map((room) => <option key={room.id} value={room.id}>{room.name} · {formatNpr(room.pricePerNight)}</option>)}</select></label>
              ) : null}
              <label className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-navy/55">Check in<input type="date" min={today} value={checkIn} onChange={(event) => setCheckIn(event.target.value)} className={fieldClass} /></label>
              <label className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-navy/55">Check out<input type="date" min={checkIn || today} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} className={fieldClass} /></label>
              <label className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-navy/55">Guests<input type="number" min={1} max={property.maxGuests} value={guests} onChange={(event) => setGuests(Math.max(1, Math.min(property.maxGuests, Number(event.target.value) || 1)))} className={fieldClass} /></label>
              <label className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-navy/55">Phone<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className={fieldClass} /></label>
              <button type="submit" disabled={previewMode} className="min-h-12 bg-navy px-6 font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-cream hover:bg-navy-dark disabled:opacity-50 sm:col-span-2">Continue to booking request</button>
            </form>
          </div>
        </CompactSection>
      ) : null}
    </div>
  )
}
