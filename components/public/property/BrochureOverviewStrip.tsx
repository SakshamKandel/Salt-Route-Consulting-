"use client"

// ── Brochure: Overview facts strip ──────────────────────────────────────────
// Compact hairline ledger directly below the booking bar (mirrors the home
// page "In Numbers" band): ONE divided row of serif values over tiny kicker
// labels — Guests · Bedrooms · Bathrooms · Units (if >1) · Check In/Out ·
// Property Type. The admin `stayDetails` JSON override still wins over the
// auto facts (same precedence the old Stay Details section used). House Notes
// (rules) render as a slim hairline row underneath. Replaces the tall
// big-number BrochureStayDetails section and keeps its #stay-details anchor.
// Motion is FadeUp only, which is preview-gated in primitives.

import type { CSSProperties } from "react"
import { FadeUp } from "@/components/public/property/primitives"

export function BrochureOverviewStrip({
  stayDetails,
  bedrooms,
  bathrooms,
  maxGuests,
  totalUnitsDisplay,
  checkInTime,
  checkOutTime,
  propertyType,
  rules,
}: {
  stayDetails?: { label: string; value: string }[] | null
  bedrooms: number
  bathrooms: number
  maxGuests: number
  totalUnitsDisplay: number
  checkInTime?: string | null
  checkOutTime?: string | null
  propertyType?: string | null
  rules: string[]
}) {
  // Auto facts — the admin stayDetails override takes precedence (unchanged
  // logic from the former BrochureStayDetails, relocated here).
  const autoFacts: { label: string; value: string }[] = [
    { label: "Guests", value: String(maxGuests) },
    { label: "Bedrooms", value: String(bedrooms) },
    { label: "Bathrooms", value: String(bathrooms) },
    ...(totalUnitsDisplay > 1 ? [{ label: "Units", value: String(totalUnitsDisplay) }] : []),
    ...(checkInTime ? [{ label: "Check In", value: checkInTime }] : []),
    ...(checkOutTime ? [{ label: "Check Out", value: checkOutTime }] : []),
    ...(propertyType ? [{ label: "Property Type", value: propertyType }] : []),
  ]

  const facts: { label: string; value: string }[] =
    stayDetails && stayDetails.length > 0
      ? stayDetails.map((d) => ({ label: d.label, value: d.value }))
      : autoFacts

  const houseNotes = rules ?? []

  if (facts.length === 0 && houseNotes.length === 0) return null

  return (
    <section id="stay-details" className="bg-white border-b border-navy/10">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-10">
        {facts.length > 0 && (
          <FadeUp>
            <div
              className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-[repeat(var(--facts),minmax(0,1fr))] lg:gap-x-0"
              style={{ "--facts": String(facts.length) } as CSSProperties}
            >
              {facts.map((fact) => (
                <div key={fact.label} className="min-w-0 lg:px-6 lg:first:pl-0 lg:last:pr-0">
                  <p className="font-display font-normal text-2xl md:text-3xl leading-none text-navy">
                    {fact.value}
                  </p>
                  <p className="mt-2 font-sans text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">
                    {fact.label}
                  </p>
                </div>
              ))}
            </div>
          </FadeUp>
        )}

        {/* House Notes — a slim note row under the facts. */}
        {houseNotes.length > 0 && (
          <FadeUp
            delay={0.08}
            className={`flex flex-wrap items-baseline gap-y-2 ${
              facts.length > 0 ? "mt-8 border-t border-navy/10 pt-6" : ""
            }`}
          >
            <span className="mr-6 font-sans text-[10px] uppercase tracking-[0.24em] font-semibold text-navy/50">
              House Notes
            </span>
            {houseNotes.map((note, i) => (
              <span key={i} className="flex items-baseline">
                {i > 0 && <span className="mx-4 h-3 w-px self-center bg-navy/15" aria-hidden />}
                <span className="font-sans text-xs sm:text-sm leading-relaxed font-light text-navy/70 whitespace-pre-line">
                  {note}
                </span>
              </span>
            ))}
          </FadeUp>
        )}
      </div>
    </section>
  )
}
