"use client"

import { type FormEvent, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

import { formatNpr } from "@/lib/currency"
import { getPrimaryImageUrl, type PropertyMediaLike } from "@/lib/property-media"
import { Calendar, Users, MapPin, ChevronLeft, ChevronRight, Star, Search, X } from "lucide-react"
import { LocationCombobox, type ComboboxProperty } from "@/components/public/LocationCombobox"
import { PropertyMap, type MapProperty } from "@/components/public/PropertyMap"

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
  const [mapSearch, setMapSearch] = useState("")

  const filteredMapProperties = useMemo(() => {
    if (!mapSearch.trim()) return mapProperties
    const q = mapSearch.toLowerCase()
    return mapProperties.filter(
      (p) => p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
    )
  }, [mapProperties, mapSearch])

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
      <section className="relative flex min-h-[420px] h-[58vh] flex-col justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop"
            alt="Properties collection"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center px-8 text-center mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
          >
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/80 font-sans mb-6 font-light">
              Boutique Stays Across Nepal
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-[7.5rem] text-white tracking-wide leading-[1.05] mb-10 font-normal">
              The Collection
            </h1>
            <div className="w-16 h-[1px] bg-white/40 mx-auto" />
          </motion.div>
        </div>
      </section>

      <div className="bg-white/80 backdrop-blur-xl border-b border-charcoal/5 lg:sticky lg:top-[80px] z-40">
        <form
          onSubmit={submitSearch}
          className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-12 py-5 flex flex-col xl:flex-row items-stretch xl:items-center gap-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
            <label className="flex items-center gap-4 border border-charcoal/10 px-5 py-4 bg-white/50 hover:bg-white transition-colors duration-300">
              <MapPin className="w-4 h-4 text-charcoal/40 shrink-0" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/40 font-semibold mb-1">Location</p>
                <LocationCombobox
                  value={locationInput}
                  onChange={setLocationInput}
                  properties={knownProperties}
                  placeholder="Anywhere"
                />
              </div>
            </label>

            <label className="flex items-center gap-4 border border-charcoal/10 px-5 py-4 bg-white/50 hover:bg-white transition-colors duration-300">
              <Calendar className="w-4 h-4 text-charcoal/40 shrink-0" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/40 font-semibold mb-1">Check In</p>
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

            <label className="flex items-center gap-4 border border-charcoal/10 px-5 py-4 bg-white/50 hover:bg-white transition-colors duration-300">
              <Calendar className="w-4 h-4 text-charcoal/40 shrink-0" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/40 font-semibold mb-1">Check Out</p>
                <input
                  type="date"
                  value={checkOutInput}
                  min={checkInInput || today}
                  onChange={(event) => setCheckOutInput(event.target.value)}
                  className="w-full bg-transparent border-0 outline-none text-sm text-charcoal font-light"
                />
              </div>
            </label>

            <label className="flex items-center gap-4 border border-charcoal/10 px-5 py-4 bg-white/50 hover:bg-white transition-colors duration-300">
              <Users className="w-4 h-4 text-charcoal/40 shrink-0" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/40 font-semibold mb-1">Guests</p>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={guestsInput}
                  onChange={(event) => setGuestsInput(Math.max(1, Math.min(20, Number(event.target.value) || 1)))}
                  className="w-full bg-transparent border-0 outline-none text-sm text-charcoal font-light"
                />
              </div>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="submit"
              className="bg-charcoal text-white px-8 py-5 text-[10px] uppercase tracking-[0.2em] hover:bg-charcoal/90 transition-colors duration-500 inline-flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" strokeWidth={1.5} /> Search
            </button>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hover:text-charcoal inline-flex items-center justify-center gap-1 font-medium py-3"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
            <div className="hidden lg:flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-medium ml-auto pl-4 border-l border-charcoal/10">
              <Star className="w-3 h-3 text-gold/80" strokeWidth={1.5} />
              <span>{totalProperties} Stays</span>
            </div>
          </div>
        </form>
      </div>

      {/* â”€â”€â”€ MAP SECTION â”€â”€â”€ */}
      {mapProperties.length > 0 && (
        <section className="bg-[#0C1F33]">
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-[360px_1fr]">
            {/* Left panel */}
            <div className="px-10 py-14 lg:py-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/[0.05]">
              <p className="text-[8px] uppercase tracking-[0.45em] text-gold/60 font-bold mb-5">
                Our Locations
              </p>
              <h2 className="font-display text-3xl xl:text-4xl text-white leading-[1.15] tracking-tight mb-5">
                Explore Our<br />
                Properties<br />
                Across Nepal
              </h2>
              <div className="w-8 h-[1px] bg-gold mb-10" />

              <div className="space-y-6">
                {mapProperties.map((p, i) => (
                  <Link
                    key={p.id}
                    href={`/properties/${p.slug}`}
                    className="flex items-center gap-5 group"
                  >
                    <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center shrink-0 group-hover:bg-gold group-hover:border-gold transition-all duration-300">
                      <span className="text-[12px] font-bold text-gold group-hover:text-[#0C1F33] transition-colors duration-300">
                        {i + 1}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white/90 group-hover:text-gold transition-colors duration-300 leading-tight truncate">
                        {p.title}
                      </p>
                      <p className="text-[11px] text-white/35 mt-0.5">{p.location}</p>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-white/[0.06]">
                <p className="text-[10px] text-white/20 leading-relaxed">
                  Click any pin on the map to view property details.
                </p>
              </div>
            </div>

            {/* Right: Map */}
            <div className="h-[400px] lg:h-[560px]">
              <PropertyMap properties={mapProperties} />
            </div>
          </div>
        </section>
      )}

      <section className="py-20 md:py-28 bg-[#FBF9F4]">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          {totalProperties > 0 && (
            <div className="mb-12 flex flex-col gap-3 border-b border-charcoal/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-charcoal/40 font-semibold">
                  Available Stays
                </p>
                <p className="mt-2 text-sm text-charcoal/60">
                  Showing {resultStart}-{resultEnd} of {totalProperties} properties
                </p>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-medium">
                Page {page} of {totalPages}
              </p>
            </div>
          )}

          {properties.length === 0 ? (
            <div className="py-48 text-center border border-charcoal/5 bg-white">
              <p className="font-display text-3xl tracking-wide text-charcoal/40 mb-8">
                {location ? `No Properties Found in ${location}` : "No Properties Match Your Search"}
              </p>
              <Link
                href="/properties"
                className="border border-charcoal text-charcoal px-12 py-4 text-[10px] uppercase tracking-[0.3em] font-sans hover:bg-charcoal hover:text-white transition-all duration-700"
              >
                Reset Search
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 xl:grid-cols-3">
              {properties.map((property, idx) => {
                const previewFeatures = [...property.highlights, ...property.amenities].slice(0, 3)

                return (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: (idx % 3) * 0.04 }}
                  >
                    <Link href={`/properties/${property.slug}`} className="group block">
                      <div className="relative aspect-[4/3] overflow-hidden mb-6 bg-charcoal/5">
                        <Image
                          src={
                            getPrimaryImageUrl(property.images) ||
                            "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1925&auto=format&fit=crop"
                          }
                          alt={property.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 text-[9px] uppercase tracking-[0.2em] font-medium text-charcoal shadow-sm">
                          From {formatNpr(property.pricePerNight)}
                        </div>
                      </div>

                      <div className="flex justify-between gap-4 items-start px-1">
                        <div className="min-w-0 flex-1">
                          <div className="mb-4">
                            <p className="truncate text-[9px] uppercase tracking-[0.2em] text-charcoal/50">
                              {property.location}
                            </p>
                          </div>
                          <h3 className="font-display text-3xl text-charcoal tracking-wide mb-6 group-hover:text-gold transition-colors duration-700 [overflow-wrap:anywhere]">
                            {property.title}
                          </h3>

                          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] uppercase tracking-[0.2em] text-charcoal/40 font-semibold">
                                Bedrooms
                              </span>
                              <span className="text-[14px] text-charcoal font-light font-sans">{property.bedrooms}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] uppercase tracking-[0.2em] text-charcoal/40 font-semibold">
                                Max Guests
                              </span>
                              <span className="text-[14px] text-charcoal font-light font-sans">{property.maxGuests}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] uppercase tracking-[0.2em] text-charcoal/40 font-semibold">
                                Baths
                              </span>
                              <span className="text-[14px] text-charcoal font-light font-sans">{property.bathrooms}</span>
                            </div>
                          </div>

                          {previewFeatures.length > 0 && (
                            <div className="mt-6 flex flex-wrap gap-2">
                              {previewFeatures.map((feature, featureIndex) => (
                                <span
                                  key={`${feature}-${featureIndex}`}
                                  className="max-w-full truncate border border-charcoal/10 px-3 py-1.5 text-[9px] uppercase tracking-[0.16em] text-charcoal/50"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="w-11 h-11 shrink-0 rounded-full border border-charcoal/10 flex items-center justify-center group-hover:border-charcoal/30 group-hover:bg-charcoal/5 transition-all duration-700 mt-1">
                          <ChevronRight
                            className="w-5 h-5 text-charcoal/30 group-hover:text-charcoal transition-colors"
                            strokeWidth={1}
                          />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}

          {totalPages > 1 && (
            <nav
              className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-charcoal/10 pt-8 sm:flex-row"
              aria-label="Property pages"
            >
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="inline-flex w-full items-center justify-center gap-2 border border-charcoal/15 px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-charcoal/60 transition-colors hover:border-charcoal/40 hover:text-charcoal disabled:pointer-events-none disabled:opacity-30 sm:w-auto"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {pageNumbers.map((pageNumber, index) => {
                  const previous = pageNumbers[index - 1]
                  const showGap = typeof previous === "number" && pageNumber - previous > 1

                  return (
                    <div key={pageNumber} className="flex items-center gap-2">
                      {showGap && <span className="text-charcoal/30">...</span>}
                      <button
                        type="button"
                        onClick={() => goToPage(pageNumber)}
                        aria-current={pageNumber === page ? "page" : undefined}
                        className={`h-10 min-w-10 border px-3 text-sm transition-colors ${
                          pageNumber === page
                            ? "border-charcoal bg-charcoal text-white"
                            : "border-charcoal/10 text-charcoal/60 hover:border-charcoal/40 hover:text-charcoal"
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
                className="inline-flex w-full items-center justify-center gap-2 border border-charcoal/15 px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-charcoal/60 transition-colors hover:border-charcoal/40 hover:text-charcoal disabled:pointer-events-none disabled:opacity-30 sm:w-auto"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}
        </div>
      </section>
    </div>
  )
}

