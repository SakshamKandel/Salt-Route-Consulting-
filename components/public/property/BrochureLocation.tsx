"use client"

// ── Brochure: Location ───────────────────────────────────────────────────────
// Asymmetric editorial location block: the map is the dominant panel (≈60/40),
// bleeding to the left viewport edge, with the address, neighbourhood prose,
// "getting here" travel legs, and optional host note set in the right column.
// No boxes/borders; the only ornament is the gold hairline. Motion is
// preview-gated through the shared primitives.

import { MapPin, Plane, Quote } from "lucide-react"
import { PropertyDetailMap } from "@/components/public/PropertyDetailMap"
import { FadeUp, Eyebrow, SectionHeading } from "@/components/public/property/primitives"

type GettingHereLeg = { time: string; from: string; distance?: string }

export function BrochureLocation({
  location,
  address,
  neighborhood,
  gettingHere,
  hostNote,
  owner,
}: {
  location: string
  address?: string | null
  neighborhood?: string | null
  gettingHere?: GettingHereLeg[] | null
  hostNote?: string | null
  owner?: { name: string | null; image: string | null }
}) {
  if (!location) return null

  const legs = gettingHere ?? []
  const ownerName = owner?.name?.trim() ?? ""
  const ownerInitials = ownerName
    ? ownerName
        .split(/\s+/)
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : ""

  return (
    <section id="location" className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-5 sm:px-6 md:px-12 mb-12">
        <p className="text-[10px] uppercase tracking-[0.26em] text-gold font-semibold mb-2">
          Sanctuary Geography
        </p>
        <h2 className="font-display uppercase tracking-[0.16em] text-navy text-2xl sm:text-3xl md:text-4xl font-normal">
          Location and Access
        </h2>
      </div>

      <div className="max-w-screen-xl mx-auto px-5 sm:px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left — Map Card */}
        <div className="lg:col-span-7">
          <div className="relative w-full h-[360px] sm:h-[420px] md:h-[460px] overflow-hidden shadow-lg bg-sand">
            <PropertyDetailMap location={location} address={address} title={location} />
          </div>
        </div>

        {/* Right — address, neighbourhood, getting here, host note. */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-start gap-4">
            <MapPin className="w-5 h-5 text-gold-dark shrink-0 mt-1" strokeWidth={1.5} />
            <div className="space-y-1">
              <p className="font-display text-xl text-navy">{location}</p>
              {address ? (
                <p className="font-sans text-xs sm:text-sm text-navy/60 font-light">{address}</p>
              ) : null}
            </div>
          </div>

          {/* Neighbourhood */}
          {neighborhood ? (
            <div className="pt-2">
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] font-semibold text-gold mb-2">
                The Neighbourhood
              </p>
              <p className="font-sans text-xs sm:text-sm leading-relaxed font-light text-navy/75 whitespace-pre-line">
                {neighborhood}
              </p>
            </div>
          ) : null}

          {/* Getting here */}
          {legs.length > 0 ? (
            <div id="getting-here" className="pt-2">
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] font-semibold text-gold mb-2">
                Getting Here
              </p>
              <ul className="space-y-2.5">
                {legs.map((leg, i) => (
                  <li
                    key={`${leg.time}-${leg.from}-${i}`}
                    className="flex items-baseline gap-3 py-1 text-xs sm:text-sm"
                  >
                    <Plane className="w-3.5 h-3.5 text-gold-dark shrink-0" strokeWidth={1.5} />
                    <span className="font-display text-navy font-medium">
                      {leg.time}
                    </span>
                    <span className="font-sans text-navy/65 font-light">
                      {leg.from}
                      {leg.distance ? ` · ${leg.distance}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Host Note */}
          {hostNote ? (
            <figure className="bg-sand p-6 space-y-4 shadow-sm">
              <div className="flex items-start gap-3">
                <Quote className="w-4 h-4 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                <blockquote className="italic font-serif text-xs sm:text-sm leading-relaxed text-navy/80 whitespace-pre-line">
                  &ldquo;{hostNote}&rdquo;
                </blockquote>
              </div>
              {owner ? (
                <figcaption className="flex items-center gap-3 pl-7">
                  {owner.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={owner.image}
                      alt={ownerName || "Host"}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center font-display text-xs text-navy font-semibold">
                      {ownerInitials || "SR"}
                    </span>
                  )}
                  {ownerName ? (
                    <span className="font-sans text-xs uppercase tracking-wide text-navy/70 font-semibold">
                      {ownerName}
                    </span>
                  ) : null}
                </figcaption>
              ) : null}
            </figure>
          ) : null}
        </div>
      </div>
    </section>
  )
}
