"use client"

import { type FormEvent, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatNpr } from "@/lib/currency"
import { getPrimaryImageUrl, type PropertyMediaLike } from "@/lib/property-media"
import { LocationCombobox, type ComboboxProperty } from "@/components/public/LocationCombobox"
import { PropertyMap, type MapProperty } from "@/components/public/PropertyMap"
import { CompactButton, CompactContainer, CompactHeading, CompactSection } from "@/components/public/Compact"
import fallbackImage from "@/public/images/marketing/himalayan-retreat-exterior.png"

type PropertyListItem = {
  id: string
  title: string
  slug: string
  description: string
  location: string
  bedrooms: number
  bathrooms: number
  maxGuests: number
  pricePerNight?: number
  highlights: string[]
  amenities: string[]
  images: PropertyMediaLike[]
}

export default function PropertiesClient({
  properties,
  location,
  checkIn,
  checkOut,
  guests,
  page,
  pageSize,
  totalProperties,
  totalPages,
  knownLocations,
  knownProperties = [],
  mapProperties = [],
}: {
  properties: PropertyListItem[]
  location?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  page: number
  pageSize: number
  totalProperties: number
  totalPages: number
  knownLocations: string[]
  knownProperties?: ComboboxProperty[]
  mapProperties?: MapProperty[]
}) {
  const router = useRouter()
  const [locationInput, setLocationInput] = useState(location ?? "")
  const [checkInInput, setCheckInInput] = useState(checkIn ?? "")
  const [checkOutInput, setCheckOutInput] = useState(checkOut ?? "")
  const [guestsInput, setGuestsInput] = useState(guests ?? 1)
  const today = new Date().toISOString().slice(0, 10)
  const hasFilters = Boolean(location || checkIn || checkOut || (guests && guests > 1))
  const resultStart = totalProperties === 0 ? 0 : (page - 1) * pageSize + 1
  const resultEnd = Math.min(totalProperties, resultStart + properties.length - 1)

  const pageNumbers = useMemo(() => {
    const values = new Set([1, totalPages, page - 1, page, page + 1])
    return [...values].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b)
  }, [page, totalPages])

  function buildQuery(nextPage = 1, nextLocation = locationInput) {
    const params = new URLSearchParams()
    if (nextLocation && nextLocation !== "all") params.set("location", nextLocation)
    if (checkInInput) params.set("checkIn", checkInInput)
    if (checkOutInput) params.set("checkOut", checkOutInput)
    if (guestsInput > 1) params.set("guests", String(guestsInput))
    if (nextPage > 1) params.set("page", String(nextPage))
    return params.size ? `/properties?${params.toString()}` : "/properties"
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    router.push(buildQuery())
  }

  function chooseLocation(value: string) {
    const next = value === "all" ? "" : value
    setLocationInput(next)
    router.push(buildQuery(1, next))
  }

  const fieldClass =
    "h-11 w-full bg-transparent px-0 font-sans text-sm text-navy outline-none placeholder:text-navy/45"

  return (
    <div className="min-h-screen bg-background text-navy">
      <CompactSection className="pb-7 sm:pb-8">
        <CompactHeading
          eyebrow="Salt Route stays"
          title="Find your place in Nepal."
          copy="Private residences, retreats, and distinctive stays selected for character, comfort, and connection to their surroundings."
        />
      </CompactSection>

      <CompactContainer>
        <form
          onSubmit={submit}
          className="grid gap-4 bg-sand px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.35fr_1fr_1fr_.65fr_auto] lg:items-end"
        >
          <label>
            <span className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-navy/55">Destination</span>
            <LocationCombobox
              value={locationInput}
              onChange={setLocationInput}
              properties={knownProperties}
              placeholder="Anywhere in Nepal"
              inputClassName={fieldClass}
            />
          </label>
          <label>
            <span className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-navy/55">Check in</span>
            <input
              type="date"
              min={today}
              value={checkInInput}
              onChange={(event) => {
                const value = event.target.value
                setCheckInInput(value)
                if (checkOutInput && checkOutInput <= value) setCheckOutInput("")
              }}
              className={fieldClass}
            />
          </label>
          <label>
            <span className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-navy/55">Check out</span>
            <input
              type="date"
              min={checkInInput || today}
              value={checkOutInput}
              onChange={(event) => setCheckOutInput(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label>
            <span className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-navy/55">Guests</span>
            <input
              type="number"
              min={1}
              max={20}
              value={guestsInput}
              onChange={(event) => setGuestsInput(Math.max(1, Math.min(20, Number(event.target.value) || 1)))}
              className={fieldClass}
            />
          </label>
          <button type="submit" className="min-h-11 bg-navy px-6 font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-cream hover:bg-navy-dark">
            Search
          </button>
        </form>

        {knownLocations.length ? (
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
            <button
              type="button"
              onClick={() => chooseLocation("all")}
              className={`font-sans text-sm ${!location ? "font-medium text-navy" : "text-navy/55 hover:text-navy"}`}
            >
              All destinations
            </button>
            {knownLocations.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => chooseLocation(value)}
                className={`font-sans text-sm ${location === value ? "font-medium text-navy" : "text-navy/55 hover:text-navy"}`}
              >
                {value}
              </button>
            ))}
            {hasFilters ? (
              <button type="button" onClick={() => router.push("/properties")} className="font-sans text-sm text-gold-dark hover:text-navy">
                Clear filters
              </button>
            ) : null}
          </div>
        ) : null}
      </CompactContainer>

      <CompactSection>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-3xl text-navy">Available stays</h2>
          <p className="font-sans text-sm text-navy/58">
            {totalProperties ? `${resultStart}–${resultEnd} of ${totalProperties}` : "No stays found"}
          </p>
        </div>

        {properties.length ? (
          <div className="mt-6 grid gap-x-7 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => {
              const image = getPrimaryImageUrl(property.images) || fallbackImage
              return (
                <article key={property.id}>
                  <Link href={`/properties/${property.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-sand-dark">
                    <Image
                      src={image}
                      alt={property.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 hover:scale-[1.02]"
                    />
                  </Link>
                  <div className="pt-4">
                    <p className="font-sans text-[10px] uppercase tracking-[0.14em] text-navy/52">{property.location}</p>
                    <h3 className="mt-1 font-display text-2xl leading-tight text-navy">{property.title}</h3>
                    <p className="mt-2 line-clamp-2 font-sans text-[15px] font-light leading-6 text-navy/68">{property.description}</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 font-sans text-sm text-navy/64">
                      <span>{property.bedrooms} bedrooms · up to {property.maxGuests} guests</span>
                      {property.pricePerNight ? <span>From {formatNpr(property.pricePerNight)}</span> : null}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="bg-sand px-6 py-10 sm:px-8">
            <h3 className="font-display text-2xl text-navy">No stays match those details.</h3>
            <p className="mt-2 max-w-xl font-sans text-base font-light leading-7 text-navy/68">
              Try a different destination or adjust the dates and number of guests.
            </p>
            <CompactButton href="/properties" className="mt-5">View all stays</CompactButton>
          </div>
        )}

        {totalPages > 1 ? (
          <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Property pages">
            <button
              type="button"
              onClick={() => router.push(buildQuery(page - 1))}
              disabled={page <= 1}
              className="min-h-10 px-4 font-sans text-sm text-navy disabled:opacity-30"
            >
              Previous
            </button>
            {pageNumbers.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => router.push(buildQuery(value))}
                aria-current={value === page ? "page" : undefined}
                className={`h-10 min-w-10 px-3 font-sans text-sm ${value === page ? "bg-navy text-cream" : "text-navy hover:bg-sand"}`}
              >
                {value}
              </button>
            ))}
            <button
              type="button"
              onClick={() => router.push(buildQuery(page + 1))}
              disabled={page >= totalPages}
              className="min-h-10 px-4 font-sans text-sm text-navy disabled:opacity-30"
            >
              Next
            </button>
          </nav>
        ) : null}
      </CompactSection>

      {mapProperties.length ? (
        <CompactSection className="bg-beige">
          <CompactHeading
            eyebrow="Map"
            title="See the collection across Nepal."
            copy="Use the map to understand each stay in relation to its destination and surrounding landscape."
          />
          <div className="mt-6 h-[360px] overflow-hidden bg-sand-dark sm:h-[440px]">
            <PropertyMap properties={mapProperties} />
          </div>
        </CompactSection>
      ) : null}
    </div>
  )
}
