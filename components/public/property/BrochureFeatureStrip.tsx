"use client"

// ── Brochure feature strip ──────────────────────────────────────────────────
// Editorial, image-forward feature/highlight band for the property brochure.
// "What to expect" renders as a flat centered icon row; "highlights" render as
// a flat centered grid. No cards, borders, or shadows — only icon + text.

import { FadeUp, SectionHeading } from "@/components/public/property/primitives"
import { resolveFeatureIcon } from "@/lib/feature-icons"

export function BrochureFeatureStrip({
  whatToExpect,
  highlights,
  highlightsTitle,
  featureIcons,
}: {
  whatToExpect?: string[]
  highlights: string[]
  highlightsTitle?: string | null
  featureIcons?: Record<string, string> | null
}) {
  const expect = whatToExpect ?? []
  const hi = (highlights ?? []).slice(0, 6)

  if (expect.length === 0 && hi.length === 0) return null

  return (
    <section className="py-16 md:py-28 bg-cream">
      <div className="max-w-screen-xl mx-auto px-5 sm:px-6 md:px-12">
        <SectionHeading eyebrow="The Experience" title={highlightsTitle || "Why Choose Us"} />

        {expect.length > 0 && (
          <div
            className={`flex flex-wrap justify-center gap-x-6 sm:gap-x-12 gap-y-8 ${hi.length > 0 ? "mb-16" : ""}`}
          >
            {expect.map((text) => {
              const Icon = resolveFeatureIcon(text, featureIcons)
              return (
                <div key={text} className="flex flex-col items-center gap-3 text-center">
                  <Icon className="w-6 h-6 text-gold stroke-[1.25]" />
                  <span className="font-sans text-[11px] uppercase tracking-[0.12em] sm:tracking-[0.2em] text-charcoal/60">
                    {text}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {hi.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 md:gap-x-12 gap-y-10 md:gap-y-12">
            {hi.map((text, i) => {
              const Icon = resolveFeatureIcon(text, featureIcons)
              return (
                <FadeUp key={text} delay={i * 0.05} className="flex flex-col items-center gap-4 text-center">
                  <Icon className="w-7 h-7 text-gold" />
                  <span className="font-sans text-[14px] text-charcoal/70 leading-relaxed">{text}</span>
                </FadeUp>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
