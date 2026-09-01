"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { BookingRequestForm, type BookingRoomType } from "./booking-request-form"
import { formatNpr } from "@/lib/currency"
import { CompactContainer, CompactHeading, CompactSection } from "@/components/public/Compact"

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
    <div className="min-h-screen bg-background text-navy">
      <CompactSection className="pb-7 sm:pb-8">
        <Link href={`/properties/${property.slug}`} className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-navy/58 hover:text-navy">
          Back to property
        </Link>
        <CompactHeading
          eyebrow={property.location}
          title={`Request ${property.title}`}
          copy="Choose your room, dates, and guest details. The request is reviewed by our team before anything is confirmed."
          className="mt-5"
        />
      </CompactSection>

      <CompactContainer>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-10">
          <div>
            {displayImage ? (
              <div className="relative aspect-[4/3] overflow-hidden bg-sand-dark">
                <Image
                  src={displayImage}
                  alt={selectedRoom?.name || property.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              </div>
            ) : null}

            <div className="py-6">
              {selectedRoom ? (
                <div className="mb-4">
                  <p className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-navy/50">Selected room</p>
                  <p className="mt-1 font-display text-2xl text-navy">{selectedRoom.name}</p>
                  <p className="mt-1 font-sans text-sm text-navy/64">{formatNpr(selectedRoom.pricePerNight)} per night</p>
                </div>
              ) : null}
              <p className="font-sans text-base font-light leading-7 text-navy/70">{property.description}</p>
              <p className="mt-4 font-sans text-sm text-navy/60">
                {property.bedrooms} bedrooms · {property.bathrooms} bathrooms · up to {property.maxGuests} guests
              </p>
              <div className="mt-6 bg-sand p-5">
                <h2 className="font-display text-2xl text-navy">What happens next</h2>
                <ol className="mt-3 space-y-2 font-sans text-sm font-light leading-6 text-navy/68">
                  <li>1. Your request is reviewed by the Salt Route concierge team.</li>
                  <li>2. Property and room availability are verified.</li>
                  <li>3. You receive confirmation and the next steps by email.</li>
                  <li>4. No charge is applied through this request form.</li>
                </ol>
              </div>
            </div>
          </div>

          <aside className="bg-beige p-5 sm:p-6 lg:sticky lg:top-24">
            <BookingRequestForm
              propertyId={property.id}
              pricePerNight={Number(property.pricePerNight)}
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
          </aside>
        </div>
      </CompactContainer>
      <div className="h-10 sm:h-12" />
    </div>
  )
}
