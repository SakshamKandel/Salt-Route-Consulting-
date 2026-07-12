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
      <p className="font-sans text-[10px] uppercase tracking-[0.24em] font-bold text-charcoal/45">
        {title}
      </p>
      <ul className="mt-3 border-b border-charcoal/10">
        {highlights.map((text, i) => (
          <li key={text} className="flex items-baseline gap-4 border-t border-charcoal/10 py-2.5">
            <span className="font-display text-[13px] text-gold shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-sans text-[13px] font-light leading-relaxed text-charcoal/70">
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
      <section className="bg-cream py-14 md:py-20">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <FadeUp className="lg:col-span-7">
            <Eyebrow>The Narrative</Eyebrow>
            {text ? (
              <Prose
                text={text}
                className="mt-6 max-w-[42rem] font-display font-light text-xl md:text-2xl leading-[1.55] tracking-[-0.01em] text-charcoal/85"
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
    <section className="bg-cream py-10 md:py-16">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Prose column at reading measure, highlights beneath. */}
        <div className="order-2 lg:order-1 lg:col-span-7">
          <FadeUp>
            <Eyebrow>The Narrative</Eyebrow>
            <h2 className="mt-3 font-display font-normal text-[clamp(2rem,4vw,3.25rem)] leading-[1.1] tracking-[-0.01em] text-charcoal">
              Our Story
            </h2>
            <GoldRule className="mt-5" />
            {text ? (
              <Prose
                text={text}
                dropCap
                className="mt-6 max-w-[40rem] font-sans text-[15px] leading-[1.85] font-light text-charcoal/70"
              />
            ) : null}
          </FadeUp>
          <HighlightsList highlights={hi} title={kicker} />
        </div>

        {/* Smaller contained portrait accent (3:4). */}
        <div className="order-1 lg:order-2 lg:col-span-4 lg:col-start-9">
          <BrochureCurtain className="relative aspect-[3/4] w-full">
            <SafeImage
              src={accentImage}
              alt="Our story"
              fill
              sizes="(max-width:1024px) 100vw, 33vw"
              className="object-cover"
            />
          </BrochureCurtain>
        </div>
      </div>
    </section>
  )
}
