"use client"

// ── Brochure: Location ───────────────────────────────────────────────────────
// Editorial location block — a quiet map beside an address, neighbourhood prose,
// "getting here" travel legs, and an optional host note. No boxes/borders; the
// only ornament is the gold hairline. Motion auto-disables in the admin preview.

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
    <section id="location" className="py-16 md:py-28 bg-white">
      <SectionHeading eyebrow="Find Us" title="Location" />

      <div className="max-w-screen-xl mx-auto px-5 sm:px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 lg:gap-16 items-start">
        {/* Left — map */}
        <FadeUp>
          <div className="relative w-full h-[320px] sm:h-[360px] md:h-[460px] overflow-hidden">
            <PropertyDetailMap location={location} address={address} title={location} />
          </div>
        </FadeUp>

        {/* Right — address, neighbourhood, getting here, host note */}
        <FadeUp delay={0.1} className="space-y-10">
          <div className="flex items-start gap-4">
            <MapPin className="w-5 h-5 text-gold shrink-0 mt-1" strokeWidth={1.5} />
            <div className="space-y-1">
              <p className="font-display text-xl text-charcoal">{location}</p>
              {address ? (
                <p className="font-sans text-[14px] text-charcoal/55">{address}</p>
              ) : null}
            </div>
          </div>

          {neighborhood ? (
            <p className="font-sans text-[15px] leading-loose font-light text-charcoal/60 whitespace-pre-line">
              {neighborhood}
            </p>
          ) : null}

          {legs.length > 0 ? (
            <div id="getting-here" className="space-y-5">
              <Eyebrow>Getting Here</Eyebrow>
              <ul className="space-y-4">
                {legs.map((leg, i) => (
                  <li
                    key={`${leg.time}-${leg.from}-${i}`}
                    className={`flex items-start gap-4 ${
                      i > 0 ? "pt-4 border-t border-charcoal/10" : ""
                    }`}
                  >
                    <Plane className="w-4 h-4 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                    <p className="font-sans text-[13px] text-charcoal/55">
                      <span className="font-display text-charcoal">{leg.time}</span>{" "}
                      {leg.from}
                      {leg.distance ? ` · ${leg.distance}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {hostNote ? (
            <figure className="space-y-5">
              <div className="flex items-start gap-4">
                <Quote className="w-5 h-5 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                <blockquote className="italic font-sans text-[15px] leading-loose text-charcoal/70 whitespace-pre-line">
                  {hostNote}
                </blockquote>
              </div>
              {owner ? (
                <figcaption className="flex items-center gap-3 pl-9">
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
                    <span className="w-10 h-10 rounded-full bg-charcoal/5 flex items-center justify-center font-display text-[13px] text-charcoal/60">
                      {ownerInitials || "·"}
                    </span>
                  )}
                  {ownerName ? (
                    <span className="font-sans text-[13px] tracking-wide text-charcoal/70">
                      {ownerName}
                    </span>
                  ) : null}
                </figcaption>
              ) : null}
            </figure>
          ) : null}
        </FadeUp>
      </div>
    </section>
  )
}
