"use client"

import { type FormEvent, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { formatNpr } from "@/lib/currency"
import { getPrimaryImageUrl, type PropertyMediaLike } from "@/lib/property-media"
import { Calendar, Users, MapPin, ChevronLeft, ChevronRight, Search, X } from "lucide-react"
import { LocationCombobox, type ComboboxProperty } from "@/components/public/LocationCombobox"
import { PropertyMap, type MapProperty } from "@/components/public/PropertyMap"
import { KenBurns, Reveal } from "@/components/public/motion"

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
  const hasFilters = !!(location || checkIn || checkOut || (guests && guests > 1))
  const resultStart = totalProperties === 0 ? 0 : (page - 1) * pageSize + 1
  const resultEnd = Math.min(totalProperties, resultStart + properties.length - 1)

  const pageNumbers = useMemo(() => {
    const pages = new Set<number>([1, totalPages, page - 1, page, page + 1])
    return Array.from(pages)
      .filter((value) => value >= 1 && value <= totalPages)
      .sort((a, b) => a - b)
  }, [page, totalPages])

  const buildQuery = (nextPage?: number) => {
    const params = new URLSearchParams()
    if (location) params.set("location", location)
    if (checkIn) params.set("checkIn", checkIn)
    if (checkOut) params.set("checkOut", checkOut)
    if (guests && guests > 1) params.set("guests", String(guests))
    if (nextPage && nextPage > 1) params.set("page", String(nextPage))
    const qs = params.toString()
    return qs ? `/properties?${qs}` : "/properties"
  }

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (locationInput) params.set("location", locationInput)
    if (checkInInput) params.set("checkIn", checkInInput)
    if (checkOutInput) params.set("checkOut", checkOutInput)
    if (guestsInput && guestsInput > 1) params.set("guests", String(guestsInput))
    const qs = params.toString()
    router.push(qs ? `/properties?${qs}` : "/properties")
  }

  const clearFilters = () => {
    setLocationInput("")
    setCheckInInput("")
    setCheckOutInput("")
    setGuestsInput(1)
    router.push("/properties")
  }

  const goToPage = (nextPage: number) => {
    router.push(buildQuery(nextPage))
  }

  return (
    <div className="bg-background">
      {/* ─── HERO — owned photography, slow Ken Burns ─── */}
      <section className="relative flex min-h-[480px] h-[70svh] md:h-[76vh] flex-col justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <KenBurns className="h-full w-full">
            <Image
              src="/Sunshine Villa Main.png"
              alt="Properties collection"
              fill
              className="object-cover"
              priority
            />
          </KenBurns>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45" />

        <div className="relative z-10 flex flex-col items-center justify-center px-6 sm:px-8 text-center mt-10 md:mt-12">
          <Reveal>
            <p className="text-[11px] md:text-xs uppercase tracking-[0.28em] text-white/75 font-sans font-light mb-6">
              Tailored Stays Across Nepal
            </p>
            <h1 className="font-script text-white leading-[1.4] tracking-normal text-[clamp(3rem,8vw,7.5rem)] pb-2 mb-6 md:mb-8">
              The Collection
            </h1>
            <div className="w-16 h-px bg-white/40 mx-auto" />
          </Reveal>
        </div>
      </section>

      {/* ─── FILTER BAR — one hairline-divided row ─── */}
      <div className="bg-cream/90 backdrop-blur-md border-b border-charcoal/10 lg:sticky lg:top-[80px] z-40">
        <form
          onSubmit={submitSearch}
          className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-12 py-5 flex flex-col xl:flex-row items-stretch xl:items-center gap-5"
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 flex-1 border-y border-charcoal/10 divide-y lg:divide-y-0 lg:divide-x divide-charcoal/10">
            <label className="flex items-center gap-4 px-5 py-4 hover:bg-white/60 transition-colors duration-300">
              <MapPin className="w-4 h-4 text-charcoal/40 shrink-0" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-medium mb-1">Location</p>
                <LocationCombobox
                  value={locationInput}
                  onChange={setLocationInput}
                  properties={knownProperties}
                  placeholder="Anywhere"
                />
              </div>
            </label>

            <label className="flex items-center gap-4 px-5 py-4 hover:bg-white/60 transition-colors duration-300">
              <Calendar className="w-4 h-4 text-charcoal/40 shrink-0" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-medium mb-1">Check In</p>
                <input
                  type="date"
                  value={checkInInput}
                  min={today}
                  onChange={(event) => {
                    setCheckInInput(event.target.value)
                    if (checkOutInput && event.target.value && checkOutInput <= event.target.value) {
                      setCheckOutInput("")
                    }
                  }}
                  className="w-full bg-transparent border-0 outline-none text-sm text-charcoal font-light"
                />
              </div>
            </label>

            <label className="flex items-center gap-4 px-5 py-4 hover:bg-white/60 transition-colors duration-300">
              <Calendar className="w-4 h-4 text-charcoal/40 shrink-0" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-medium mb-1">Check Out</p>
                <input
                  type="date"
                  value={checkOutInput}
                  min={checkInInput || today}
                  onChange={(event) => setCheckOutInput(event.target.value)}
                  className="w-full bg-transparent border-0 outline-none text-sm text-charcoal font-light"
                />
              </div>
            </label>

            <label className="flex items-center gap-4 px-5 py-4 hover:bg-white/60 transition-colors duration-300">
              <Users className="w-4 h-4 text-charcoal/40 shrink-0" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-medium mb-1">Guests</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGuestsInput(Math.max(1, guestsInput - 1))}
                    disabled={guestsInput <= 1}
                    className="w-5 h-5 flex items-center justify-center border border-charcoal/20 text-charcoal/50 hover:border-charcoal/40 hover:text-charcoal disabled:opacity-30 transition-colors"
                    aria-label="Decrease guests"
                  >
                    <span className="text-xs leading-none">&minus;</span>
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={guestsInput}
                    onChange={(event) => setGuestsInput(Math.max(1, Math.min(20, Number(event.target.value) || 1)))}
                    className="w-8 bg-transparent border-0 outline-none text-sm text-charcoal font-light text-center"
                  />
                  <button
                    type="button"
                    onClick={() => setGuestsInput(Math.min(20, guestsInput + 1))}
                    disabled={guestsInput >= 20}
                    className="w-5 h-5 flex items-center justify-center border border-charcoal/20 text-charcoal/50 hover:border-charcoal/40 hover:text-charcoal disabled:opacity-30 transition-colors"
                    aria-label="Increase guests"
                  >
                    <span className="text-xs leading-none">+</span>
                  </button>
                </div>
              </div>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button type="submit" className="btn-primary w-full gap-2 sm:w-auto">
              <Search className="w-4 h-4" strokeWidth={1.5} /> Search
            </button>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hover:text-charcoal inline-flex items-center justify-center gap-1 font-medium py-3 transition-colors"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
            <div className="hidden lg:flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-medium ml-auto pl-4 border-l border-charcoal/10">
              <span>{totalProperties} Stays</span>
            </div>
          </div>
        </form>
      </div>

      {/* ─── MAP SECTION — hairline system on navy ─── */}
      {mapProperties.length > 0 && (
        <section className="bg-navy-dark">
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-[380px_1fr]">
            {/* Left panel */}
            <div className="px-6 sm:px-10 py-10 md:py-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10">
              <Reveal>
                <p className="text-[11px] uppercase tracking-[0.28em] text-gold/70 font-medium mb-6">
                  Our Locations
                </p>
                <h2 className="font-display text-3xl xl:text-4xl text-white leading-[1.15] tracking-[-0.01em] mb-6">
                  Explore Our<br />
                  Properties<br />
                  Across Nepal
                </h2>
                <div className="w-10 h-px bg-gold/60 mb-6 md:mb-8" />
              </Reveal>

              <Reveal stagger={0.06} className="border-t border-white/10">
                {mapProperties.map((p, i) => (
                  <Reveal.Item key={p.id}>
                    <Link
                      href={`/properties/${p.slug}`}
                      className="group flex items-baseline gap-5 border-b border-white/10 py-4"
                    >
                      <span className="font-display text-sm text-gold/70 w-7 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-light text-white/90 group-hover:text-gold transition-colors duration-500 leading-tight truncate">
                          {p.title}
                        </span>
                        <span className="block text-[11px] text-white/40 mt-1">{p.location}</span>
                      </span>
                    </Link>
                  </Reveal.Item>
                ))}
              </Reveal>

              <p className="mt-10 text-[10px] text-white/35 leading-relaxed">
                Click any pin on the map to view property details.
              </p>
            </div>

            {/* Right: Map */}
            <div className="h-[400px] lg:h-[560px]">
              <PropertyMap properties={mapProperties} />
            </div>
          </div>
        </section>
      )}

      {/* ─── LISTING ─── */}
      <section className="py-10 md:py-16 bg-sand">
        <div className="max-w-screen-2xl mx-auto px-5 sm:px-6 md:px-12">
          {totalProperties > 0 && (
            <div className="mb-6 md:mb-8 flex flex-col gap-3 border-b border-charcoal/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="type-eyebrow">Available Stays</p>
                <p className="mt-2 text-sm text-charcoal/60 font-light">
                  Showing {resultStart}-{resultEnd} of {totalProperties} properties
                </p>
              </div>
              <p className="type-caption">
                Page {page} of {totalPages}
              </p>
            </div>
          )}

          {properties.length === 0 ? (
            <div className="border-y border-charcoal/10 py-14 md:py-20 text-center">
              <p className="font-display text-3xl md:text-4xl tracking-[-0.01em] text-charcoal/50 mb-6 md:mb-8">
                {location ? `No Properties Found in ${location}` : "No Properties Match Your Search"}
              </p>
              <Link
                href="/properties"
                className="group inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-charcoal hover:text-gold transition-colors duration-500"
              >
                Reset Search
                <span className="block h-px w-8 bg-current transition-all duration-500 ease-[var(--ease-out-quart)] group-hover:w-14" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
              {properties.map((property, idx) => (
                <Reveal
                  key={property.id}
                  delay={(idx % 3) * 0.08}
                  y={18}
                >
                  <Link href={`/properties/${property.slug}`} className="group block">
                    <div className="relative aspect-[16/10] overflow-hidden mb-5 bg-charcoal/5">
                      <Image
                        src={
                          getPrimaryImageUrl(property.images) ||
                          "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1925&auto=format&fit=crop"
                        }
                        alt={property.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-[var(--ease-out-luxe)] group-hover:scale-[1.04]"
                      />
                    </div>

                    <p className="type-caption truncate mb-3">{property.location}</p>
                    <h3 className="font-display text-xl md:text-2xl text-charcoal tracking-[-0.01em] leading-snug mb-3 group-hover:text-gold transition-colors duration-700 [overflow-wrap:anywhere]">
                      {property.title}
                    </h3>
                    {property.pricePerNight != null && (
                      <p className="text-sm text-charcoal/70 font-light">
                        {formatNpr(property.pricePerNight)}{" "}
                        <span className="text-charcoal/40">/ night</span>
                      </p>
                    )}
                  </Link>
                </Reveal>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav
              className="mt-10 flex flex-col items-center justify-between gap-6 border-t border-charcoal/10 pt-8 sm:flex-row"
              aria-label="Property pages"
            >
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="inline-flex w-full items-center justify-center gap-2 py-3 text-[10px] uppercase tracking-[0.2em] text-charcoal/60 transition-colors hover:text-charcoal disabled:pointer-events-none disabled:opacity-30 sm:w-auto"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} /> Previous
              </button>

              <div className="flex flex-wrap items-center justify-center gap-1">
                {pageNumbers.map((pageNumber, index) => {
                  const previous = pageNumbers[index - 1]
                  const showGap = typeof previous === "number" && pageNumber - previous > 1

                  return (
                    <div key={pageNumber} className="flex items-center gap-1">
                      {showGap && <span className="px-1 text-charcoal/30">...</span>}
                      <button
                        type="button"
                        onClick={() => goToPage(pageNumber)}
                        aria-current={pageNumber === page ? "page" : undefined}
                        className={`h-10 min-w-10 border-b px-2 text-sm transition-colors ${
                          pageNumber === page
                            ? "border-charcoal text-charcoal"
                            : "border-transparent text-charcoal/45 hover:text-charcoal"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    </div>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="inline-flex w-full items-center justify-center gap-2 py-3 text-[10px] uppercase tracking-[0.2em] text-charcoal/60 transition-colors hover:text-charcoal disabled:pointer-events-none disabled:opacity-30 sm:w-auto"
              >
                Next <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </nav>
          )}
        </div>
      </section>
    </div>
  )
}
