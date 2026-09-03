"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { BookingRequestForm, type BookingRoomType } from "./booking-request-form"
import { formatNpr } from "@/lib/currency"
import { CompactContainer } from "@/components/public/Compact"
import { Reveal, ParallaxImage } from "@/components/public/motion"

interface Props {
  property: {
    id: string
    title: string
    slug: string
    location: string
    description: string
    bedrooms: number
    bathrooms: number
    maxGuests: number
    pricePerNight: number
    hidePrice?: boolean
    images: { url: string; alt?: string | null }[]
  }
  roomTypes: BookingRoomType[]
  heroImage: string | null
  currentUserPhone: string | null
  requestedRoomTypeId: string | null
  requestedCheckIn: string | null
  requestedCheckOut: string | null
  requestedGuests: number | null
  requestedPhone: string | null
  isAuthenticated: boolean
}

const NEXT_STEPS = [
  "Your request is reviewed by the Salt Route concierge team.",
  "Property and room availability are verified.",
  "You receive confirmation and the next steps by email.",
  "No charge is applied through this request form.",
]

export function BookingPageClient({
  property,
  roomTypes,
  heroImage,
  currentUserPhone,
  requestedRoomTypeId,
  requestedCheckIn,
  requestedCheckOut,
  requestedGuests,
  requestedPhone,
  isAuthenticated,
}: Props) {
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | null>(requestedRoomTypeId)
  const selectedRoom = useMemo(
    () => roomTypes.find((room) => room.id === selectedRoomTypeId),
    [roomTypes, selectedRoomTypeId],
  )
  const roomImage = selectedRoom?.images?.[0] || selectedRoom?.imageUrl
  const displayImage = roomImage || property.images[0]?.url || heroImage

  return (
    <div className="bg-background text-navy">
      {/* ─── Cinematic parallax hero ─── */}
      <section className="relative flex min-h-[440px] items-center justify-center overflow-hidden sm:min-h-[560px]">
        {displayImage ? (
          <ParallaxImage className="absolute inset-0 z-0" speed={0.12}>
            <Image
              src={displayImage}
              alt={selectedRoom?.name || property.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </ParallaxImage>
        ) : null}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/55 via-black/35 to-black/70" />
        <div className="relative z-10 px-5 text-center">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-cream/85">
            {property.location}
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.25rem,5.5vw,4.5rem)] uppercase leading-[1.05] tracking-wide text-cream">
            {property.title}
          </h1>
          <p className="mt-4 font-sans text-[13px] font-light uppercase tracking-[0.25em] text-cream/80">
            Request your stay
          </p>
        </div>
      </section>

      {/* ─── Light content section ─── */}
      <CompactContainer className="py-12 sm:py-16">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-12">
          {/* Left: property details */}
          <div>
            <Link
              href={`/properties/${property.slug}`}
              className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-navy/55 transition-colors hover:text-navy"
            >
              Back to property
            </Link>

            <Reveal as="div" className="mt-5">
              <h2 className="font-display text-2xl uppercase tracking-wide text-navy sm:text-3xl">
                Your stay
              </h2>
              <p className="mt-4 max-w-2xl font-sans text-base font-light leading-7 text-navy/72">
                {property.description}
              </p>
            </Reveal>

            <Reveal as="div" className="mt-8 grid grid-cols-3 gap-4 border-y border-navy/10 py-5" delay={0.08}>
              <div>
                <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/50">
                  Bedrooms
                </p>
                <p className="mt-1.5 font-display text-xl text-navy">{property.bedrooms}</p>
              </div>
              <div>
                <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/50">
                  Bathrooms
                </p>
                <p className="mt-1.5 font-display text-xl text-navy">{property.bathrooms}</p>
              </div>
              <div>
                <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/50">
                  Max guests
                </p>
                <p className="mt-1.5 font-display text-xl text-navy">{property.maxGuests}</p>
              </div>
            </Reveal>

            {selectedRoom ? (
              <Reveal as="div" className="mt-8 border border-navy/10 bg-sand p-5" delay={0.1}>
                <p className="font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-gold-dark">
                  Selected room
                </p>
                <p className="mt-1.5 font-display text-2xl text-navy">{selectedRoom.name}</p>
                {property.hidePrice || selectedRoom.hidePrice ? (
                  <p className="mt-1 font-sans text-sm font-semibold uppercase tracking-wider text-gold-dark">
                    Quote on Request
                  </p>
                ) : (
                  <p className="mt-1 font-sans text-sm text-navy/65">
                    {formatNpr(selectedRoom.pricePerNight)} per night
                  </p>
                )}
              </Reveal>
            ) : null}

            <Reveal as="div" className="mt-10" delay={0.12}>
              <h3 className="font-display text-xl uppercase tracking-wide text-navy sm:text-2xl">
                What happens next
              </h3>
            </Reveal>
            <ol className="mt-4 border-t border-navy/10">
              {NEXT_STEPS.map((step, index) => (
                <Reveal
                  key={step}
                  as="li"
                  delay={0.14 + index * 0.07}
                  className="flex items-start gap-4 border-b border-navy/10 py-4"
                >
                  <span className="font-sans text-[11px] font-semibold tabular-nums text-gold-dark">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-sans text-sm font-light leading-6 text-navy/72">{step}</span>
                </Reveal>
              ))}
            </ol>
          </div>

          {/* Keep the complete request form in the normal page flow so every
              field remains reachable on shorter laptop screens. */}
          <aside className="lg:self-start">
            <Reveal as="div" delay={0.1}>
              <BookingRequestForm
                propertyId={property.id}
                pricePerNight={Number(property.pricePerNight)}
                hidePrice={property.hidePrice}
                maxGuests={property.maxGuests}
                roomTypes={roomTypes}
                initialRoomTypeId={requestedRoomTypeId}
                initialCheckIn={requestedCheckIn}
                initialCheckOut={requestedCheckOut}
                initialGuests={Number.isFinite(requestedGuests ?? NaN) && requestedGuests ? requestedGuests : undefined}
                isAuthenticated={isAuthenticated}
                initialPhone={currentUserPhone || requestedPhone}
                onRoomTypeChange={setSelectedRoomTypeId}
              />
            </Reveal>
          </aside>
        </div>
      </CompactContainer>
      <div className="h-10 sm:h-12" />
    </div>
  )
}
