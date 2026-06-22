"use client"

// ── Brochure: Stay Details ──────────────────────────────────────────────────
// Editorial "good to know" block: an icon-led row of key facts (no boxes, no
// borders) over an optional centered House Notes list. Custom admin facts get
// an auto-resolved icon; the auto fallback facts use fixed, meaningful icons.

import { FadeUp, SectionHeading, Eyebrow } from "@/components/public/property/primitives"
import { resolveFeatureIcon } from "@/lib/feature-icons"
import { BedDouble, Bath, Users, Building2, Clock, type LucideIcon } from "lucide-react"

export function BrochureStayDetails({
  stayDetails,
  bedrooms,
  bathrooms,
  maxGuests,
  totalUnitsDisplay,
  checkInTime,
  checkOutTime,
  rules,
}: {
  stayDetails?: { label: string; value: string }[] | null
  bedrooms: number
  bathrooms: number
  maxGuests: number
  totalUnitsDisplay: number
  checkInTime?: string | null
  checkOutTime?: string | null
  rules: string[]
}) {
  const autoFacts: { label: string; value: string; Icon: LucideIcon }[] = [
    { label: "Bedrooms", value: String(bedrooms), Icon: BedDouble },
    { label: "Bathrooms", value: String(bathrooms), Icon: Bath },
    { label: "Sleeps", value: `${maxGuests} Guests`, Icon: Users },
    { label: "Bookable Units", value: String(totalUnitsDisplay), Icon: Building2 },
    ...(checkInTime ? [{ label: "Check In", value: checkInTime, Icon: Clock }] : []),
    ...(checkOutTime ? [{ label: "Check Out", value: checkOutTime, Icon: Clock }] : []),
  ]

  const facts: { label: string; value: string; Icon: LucideIcon }[] =
    stayDetails && stayDetails.length > 0
      ? stayDetails.map((d) => ({ label: d.label, value: d.value, Icon: resolveFeatureIcon(d.label) }))
      : autoFacts

  const houseNotes = rules ?? []

  if (facts.length === 0 && houseNotes.length === 0) return null

  return (
    <section id="stay-details" className="py-20 md:py-28 bg-cream">
      <SectionHeading eyebrow="Good To Know" title="Stay Details" />

      <div className="max-w-screen-xl mx-auto px-6 md:px-12">
        {facts.length > 0 && (
          <FadeUp>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12 text-center">
              {facts.map((fact) => (
                <div key={fact.label} className="flex flex-col items-center">
                  <fact.Icon className="w-6 h-6 text-gold stroke-[1.25]" />
                  <p className="mt-4 font-display text-2xl text-charcoal leading-tight">{fact.value}</p>
                  <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.25em] text-charcoal/45">
                    {fact.label}
                  </p>
                </div>
              ))}
            </div>
          </FadeUp>
        )}

        {houseNotes.length > 0 && (
          <FadeUp delay={0.1} className="mt-20 max-w-3xl mx-auto text-center">
            <Eyebrow>House Notes</Eyebrow>
            <ul className="mt-6 space-y-3">
              {houseNotes.map((note, i) => (
                <li
                  key={i}
                  className="font-sans text-[14px] leading-relaxed text-charcoal/65 whitespace-pre-line"
                >
                  {note}
                </li>
              ))}
            </ul>
          </FadeUp>
        )}
      </div>
    </section>
  )
}
