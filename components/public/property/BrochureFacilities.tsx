"use client"

// ── BrochureFacilities ───────────────────────────────────────────────────────
// An icon-forward showcase of comfort/amenity items: each is a gold icon above
// its label, laid out on a calm multi-column grid. No boxes, borders, or
// gridlines — the icons (auto-resolved from the text, or AI-assigned) carry it.

import { FadeUp, SectionHeading } from "@/components/public/property/primitives"
import { resolveFeatureIcon } from "@/lib/feature-icons"

export function BrochureFacilities({
  services,
  amenities,
  amenitiesTitle,
  featureIcons,
}: {
  services?: string[]
  amenities: string[]
  amenitiesTitle?: string | null
  featureIcons?: Record<string, string> | null
}) {
  const items = services && services.length > 0 ? services : (amenities ?? [])
  if (items.length === 0) return null

  return (
    <section className="py-16 md:py-28 bg-white">
      <SectionHeading eyebrow="Comfort" title={amenitiesTitle || "Facilities & Services"} />

      <FadeUp className="max-w-5xl mx-auto px-5 sm:px-6">
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 sm:gap-x-8 gap-y-10 md:gap-y-12">
          {items.map((item) => {
            const Icon = resolveFeatureIcon(item, featureIcons)
            return (
              <li key={item} className="flex flex-col items-center text-center gap-3">
                <Icon className="w-8 h-8 text-gold stroke-[1.1] shrink-0" />
                <span className="font-sans text-[13px] text-charcoal/70 leading-snug">{item}</span>
              </li>
            )
          })}
        </ul>
      </FadeUp>
    </section>
  )
}
