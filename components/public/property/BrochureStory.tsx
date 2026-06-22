"use client"

// ── BrochureStory ───────────────────────────────────────────────────────────
// Editorial "Our Story" band: an OPTIONAL full-bleed accent image followed by a
// centered column of properly-paragraphed prose with a drop-cap. Falls back to
// the property description when no dedicated story exists; renders nothing if
// neither has content. If no accent image is provided it is simply text-only.

import { Eyebrow, GoldRule, RevealImage, FadeUp, Prose } from "@/components/public/property/primitives"

export function BrochureStory({
  story,
  description,
  accentImage,
}: {
  story?: string | null
  description: string
  accentImage?: string | null
}) {
  const text = story && story.trim() ? story : description
  if (!text || !text.trim()) return null

  return (
    <section className="py-20 md:py-28 bg-cream">
      {accentImage ? (
        <div className="mb-14 md:mb-20 px-0 md:px-6 max-w-screen-2xl mx-auto">
          <RevealImage src={accentImage} alt="Our story" className="aspect-[21/9] w-full" sizes="100vw" />
        </div>
      ) : null}

      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center">
          <Eyebrow>The Narrative</Eyebrow>
          <h2 className="font-display text-3xl md:text-5xl uppercase tracking-wide text-charcoal mt-4">
            Our Story
          </h2>
          <GoldRule center className="mt-6" />
        </div>

        <FadeUp>
          <Prose
            text={text}
            dropCap
            className="mt-10 font-sans text-[15px] md:text-base leading-loose font-light text-charcoal/70 text-left"
          />
        </FadeUp>
      </div>
    </section>
  )
}
