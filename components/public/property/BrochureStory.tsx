"use client"

// ── BrochureStory ───────────────────────────────────────────────────────────
// Compact editorial split: drop-cap prose at reading measure with a smaller
// contained portrait accent (3:4) opposite, plus the admin "highlights" as a
// hairline-divided list under a tiny kicker (Ritz-style hotel highlights —
// relocated here from Facilities). Falls back to the description when no
// dedicated story exists; renders nothing when there is no content at all.
// Without an accent image it collapses to a quiet typographic "breath" band.

import {
  Eyebrow,
  GoldRule,
  FadeUp,
  Prose,
  SafeImage,
  BrochureCurtain,
} from "@/components/public/property/primitives"

/** Hairline-divided highlights list under a tiny kicker label. */
function HighlightsList({ highlights, title }: { highlights: string[]; title: string }) {
  if (highlights.length === 0) return null
  return (
    <FadeUp delay={0.08} className="mt-8">
      <p className="font-sans text-[10px] uppercase tracking-[0.24em] font-semibold text-gold">
        {title}
      </p>
      <ul className="mt-4 space-y-3">
        {highlights.map((text, i) => (
          <li key={text} className="flex items-start gap-4 py-1">
            <span className="font-display text-sm text-gold font-semibold shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-sans text-xs sm:text-sm font-light leading-relaxed text-navy/75">
              {text}
            </span>
          </li>
        ))}
      </ul>
    </FadeUp>
  )
}

export function BrochureStory({
  story,
  description,
  accentImage,
  highlights,
  highlightsTitle,
}: {
  story?: string | null
  description: string
  accentImage?: string | null
  highlights?: string[]
  highlightsTitle?: string | null
}) {
  const raw = story && story.trim() ? story : description
  const text = raw && raw.trim() ? raw : ""
  const hi = highlights ?? []
  const kicker = highlightsTitle || "Highlights"

  if (!text && hi.length === 0) return null

  // ── Breath-band fallback (no accent image): quiet lead-scale passage. ──
  if (!accentImage) {
    return (
      <section className="bg-sand py-20 md:py-28">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <FadeUp className="lg:col-span-7">
            <Eyebrow>The Narrative</Eyebrow>
            {text ? (
              <Prose
                text={text}
                className="mt-6 max-w-[42rem] font-display font-light text-xl md:text-2xl leading-[1.55] text-navy/85"
              />
            ) : null}
          </FadeUp>
          {hi.length > 0 && (
            <div className="lg:col-span-4 lg:col-start-9">
              <HighlightsList highlights={hi} title={kicker} />
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="bg-sand py-20 md:py-28">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Prose column at reading measure, highlights beneath. */}
        <div className="order-2 lg:order-1 lg:col-span-7 space-y-6">
          <FadeUp>
            <p className="text-[10px] uppercase tracking-[0.26em] text-gold font-semibold mb-2">
              The Sanctuary Story
            </p>
            <h2 className="font-display uppercase tracking-[0.16em] text-navy text-2xl sm:text-3xl lg:text-4xl font-normal leading-[1.25]">
              Living In Stillness
            </h2>
            {text ? (
              <Prose
                text={text}
                className="mt-6 max-w-[40rem] font-sans text-sm sm:text-base leading-[1.85] font-light text-navy/75"
              />
            ) : null}
          </FadeUp>
          <HighlightsList highlights={hi} title={kicker} />
        </div>

        {/* Smaller contained portrait accent (3:4) with clean shadow. */}
        <div className="order-1 lg:order-2 lg:col-span-5">
          <div className="relative aspect-[4/5] w-full overflow-hidden shadow-xl bg-beige">
            <SafeImage
              src={accentImage}
              alt="Sanctuary Architecture"
              fill
              sizes="(max-width:1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
