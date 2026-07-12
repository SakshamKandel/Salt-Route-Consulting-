"use client"

// ── Brochure spine ──────────────────────────────────────────────────────────
// The admin-authored story sections, rotated through FOUR editorial-split
// variants (edge-bleed / asymmetric 4-8 / dark overlap / portrait spotlight)
// with the anchor side alternating each recurrence — no two spreads rhyme.
// Imageless sections never degrade to a thin centered stub: consecutive
// imageless sections merge into ONE quiet left-aligned typographic band
// anchored by a gold hairline. Bodies always render as real paragraphs.

import {
  RevealImage,
  FadeUp,
  Eyebrow,
  GoldRule,
  Prose,
  SafeImage,
  BrochureCurtain,
} from "@/components/public/property/primitives"
import type { SectionData } from "@/components/public/property/types"

type Entry = { section: SectionData; chapterNo: number }
type Group =
  | { kind: "image"; entry: Entry; seed: number }
  | { kind: "text"; entries: Entry[] }

function eyebrowOf(entry: Entry) {
  return entry.section.subtitle || `Chapter ${String(entry.chapterNo).padStart(2, "0")}`
}

/** Shared text stack for the spread variants. */
function SectionText({ entry, dark = false }: { entry: Entry; dark?: boolean }) {
  return (
    <FadeUp>
      <Eyebrow light={dark}>{eyebrowOf(entry)}</Eyebrow>
      <h2
        className={`mt-3 font-display font-normal text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.12] tracking-[-0.01em] ${
          dark ? "text-white" : "text-charcoal"
        }`}
      >
        {entry.section.title}
      </h2>
      <GoldRule className="mt-5" />
      <Prose
        text={entry.section.body}
        className={`mt-5 max-w-[38rem] font-sans text-[15px] leading-loose font-light ${
          dark ? "text-white/65" : "text-charcoal/60"
        }`}
      />
    </FadeUp>
  )
}

export function BrochureSections({
  sections,
  startIndex,
}: {
  sections: SectionData[]
  startIndex?: number
}) {
  if (!sections || sections.length === 0) return null
  const start = startIndex ?? 0

  // ── Group: image sections stand alone; consecutive imageless ones merge. ──
  const groups: Group[] = []
  let imageSeq = 0
  sections.forEach((section, idx) => {
    const entry: Entry = { section, chapterNo: start + idx + 1 }
    if (section.imageUrl) {
      groups.push({ kind: "image", entry, seed: start + imageSeq })
      imageSeq += 1
    } else {
      const last = groups[groups.length - 1]
      if (last && last.kind === "text") last.entries.push(entry)
      else groups.push({ kind: "text", entries: [entry] })
    }
  })

  return (
    <>
      {groups.map((group) => {
        // ── Quiet typographic band for imageless sections (never a stub). ──
        if (group.kind === "text") {
          return (
            <section
              key={group.entries[0].section.id}
              className="bg-sand py-10 md:py-16"
            >
              <div className="max-w-screen-xl mx-auto px-6 md:px-12">
                <div className="max-w-[42rem] lg:ml-[8.333%] border-l border-gold/60 pl-6 md:pl-10 space-y-8 md:space-y-10">
                  {group.entries.map((entry) => (
                    <FadeUp key={entry.section.id}>
                      <Eyebrow>{eyebrowOf(entry)}</Eyebrow>
                      <h2 className="mt-3 font-display font-normal text-[clamp(1.625rem,3vw,2.5rem)] leading-[1.15] tracking-[-0.01em] text-charcoal">
                        {entry.section.title}
                      </h2>
                      <Prose
                        text={entry.section.body}
                        className="mt-5 font-sans text-[15px] leading-loose font-light text-charcoal/60"
                      />
                    </FadeUp>
                  ))}
                </div>
              </div>
            </section>
          )
        }

        const { entry, seed } = group
        const variant = seed % 4
        const imageLeft = seed % 2 === 0
        const imageUrl = entry.section.imageUrl as string

        // ── Variant A — image bleeding to its viewport edge, offset text. ──
        if (variant === 0) {
          return (
            <section key={entry.section.id} className="bg-white py-10 md:py-16 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-0">
                <div
                  className={`order-1 ${
                    imageLeft ? "lg:col-span-7 lg:col-start-1" : "lg:col-span-7 lg:col-start-6 lg:order-2"
                  }`}
                >
                  <BrochureCurtain className="relative aspect-[16/10] w-full" direction={imageLeft ? "left" : "up"}>
                    <SafeImage
                      src={imageUrl}
                      alt={entry.section.title}
                      fill
                      sizes="(max-width:1024px) 100vw, 58vw"
                      className="object-cover"
                    />
                  </BrochureCurtain>
                </div>
                <div
                  className={`order-2 px-6 md:px-12 lg:px-0 ${
                    imageLeft ? "lg:col-span-4 lg:col-start-9 lg:pr-10" : "lg:col-span-4 lg:col-start-2 lg:order-1"
                  }`}
                >
                  <SectionText entry={entry} />
                </div>
              </div>
            </section>
          )
        }

        // ── Variant B — contained asymmetric 8/4 with a staggered baseline. ──
        if (variant === 1) {
          return (
            <section key={entry.section.id} className="bg-sand py-10 md:py-16">
              <div className="max-w-screen-xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                <div className={`order-1 lg:col-span-8 ${imageLeft ? "" : "lg:order-2 lg:col-start-5"}`}>
                  <RevealImage
                    src={imageUrl}
                    alt={entry.section.title}
                    className="aspect-[16/10] w-full"
                    sizes="(max-width:1024px) 100vw, 66vw"
                  />
                </div>
                <div className={`order-2 lg:col-span-4 ${imageLeft ? "" : "lg:order-1"}`}>
                  <SectionText entry={entry} />
                </div>
              </div>
            </section>
          )
        }

        // ── Variant C — dark ground, text block overlapping the image. ──
        if (variant === 2) {
          return (
            <section key={entry.section.id} className="bg-charcoal py-10 md:py-16">
              <div className="max-w-screen-xl mx-auto px-6 md:px-12">
                <div className={`lg:w-2/3 ${imageLeft ? "" : "lg:ml-auto"}`}>
                  <RevealImage
                    src={imageUrl}
                    alt={entry.section.title}
                    className="aspect-[16/10] w-full"
                    sizes="(max-width:1024px) 100vw, 66vw"
                  />
                </div>
                <div
                  className={`relative z-10 mt-10 lg:-mt-28 lg:w-1/2 bg-charcoal lg:p-10 xl:p-12 ${
                    imageLeft ? "lg:ml-auto" : ""
                  }`}
                >
                  <SectionText entry={entry} dark />
                </div>
              </div>
            </section>
          )
        }

        // ── Variant D — compact spotlight (4:3) with a margin caption. ──
        return (
          <section key={entry.section.id} className="bg-white py-10 md:py-16">
            <div className="max-w-screen-xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              <div className={`order-1 lg:col-span-6 ${imageLeft ? "" : "lg:order-2 lg:col-start-7"}`}>
                <BrochureCurtain className="relative aspect-[4/3] w-full">
                  <SafeImage
                    src={imageUrl}
                    alt={entry.section.title}
                    fill
                    sizes="(max-width:1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </BrochureCurtain>
                <p className="mt-3 font-sans uppercase text-[10px] tracking-[0.15em] text-charcoal/45">
                  {String(entry.chapterNo).padStart(2, "0")} — {entry.section.title}
                </p>
              </div>
              <div
                className={`order-2 lg:col-span-5 lg:mt-6 ${
                  imageLeft ? "lg:col-start-8" : "lg:order-1 lg:col-start-1"
                }`}
              >
                <SectionText entry={entry} />
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}
