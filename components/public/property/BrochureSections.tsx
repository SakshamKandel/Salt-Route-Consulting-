"use client"

// ── Brochure spine ──────────────────────────────────────────────────────────
// Alternating editorial image+text spreads — the heart of the brochure page.
// Flat, image-forward, no cards/borders/shadows. The section image is OPTIONAL:
// with an image it's an alternating image/text spread; without one it renders as
// a single centered prose column. Bodies are rendered as real paragraphs.

import { RevealImage, FadeUp, Eyebrow, GoldRule, Prose } from "@/components/public/property/primitives"
import type { SectionData } from "@/components/public/property/types"

export function BrochureSections({
  sections,
  startIndex,
}: {
  sections: SectionData[]
  startIndex?: number
}) {
  if (!sections || sections.length === 0) return null
  const start = startIndex ?? 0

  return (
    <>
      {sections.map((section, idx) => {
        const eyebrow = section.subtitle || `Chapter ${String(start + idx + 1).padStart(2, "0")}`
        const hasImage = Boolean(section.imageUrl)

        return (
          <section
            key={section.id}
            className={`py-20 md:py-28 ${idx % 2 === 0 ? "bg-white" : "bg-[#FBF9F4]"}`}
          >
            <div className="max-w-screen-xl mx-auto px-6 md:px-12">
              {hasImage ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                  <div
                    className={`order-1 lg:col-span-6 ${idx % 2 === 0 ? "lg:order-1" : "lg:order-2"}`}
                  >
                    <RevealImage
                      src={section.imageUrl as string}
                      alt={section.title}
                      className="aspect-[4/5]"
                      sizes="(max-width:1024px) 100vw, 50vw"
                    />
                  </div>
                  <div
                    className={`order-2 lg:col-span-6 ${idx % 2 === 0 ? "lg:order-2" : "lg:order-1"}`}
                  >
                    <FadeUp>
                      <Eyebrow>{eyebrow}</Eyebrow>
                      <h2 className="font-display text-3xl md:text-5xl uppercase tracking-wide leading-tight text-charcoal mt-3">
                        {section.title}
                      </h2>
                      <GoldRule className="mt-6" />
                      <Prose
                        text={section.body}
                        className="font-sans text-[15px] leading-loose font-light text-charcoal/60 mt-6"
                      />
                    </FadeUp>
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto text-center">
                  <FadeUp>
                    <Eyebrow>{eyebrow}</Eyebrow>
                    <h2 className="font-display text-3xl md:text-5xl uppercase tracking-wide leading-tight text-charcoal mt-3">
                      {section.title}
                    </h2>
                    <GoldRule center className="mt-6" />
                    <Prose
                      text={section.body}
                      className="font-sans text-[15px] leading-loose font-light text-charcoal/60 mt-6 text-left"
                    />
                  </FadeUp>
                </div>
              )}
            </div>
          </section>
        )
      })}
    </>
  )
}
