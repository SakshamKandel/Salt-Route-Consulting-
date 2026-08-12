"use client"

import { Fragment, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Reveal, CurtainImage, ParallaxImage } from "@/components/public/motion"
import { VISUAL_JOURNEY_TILES, type VisualJourneyTile } from "@/lib/visual-journey-tiles"

// ── Rhythm groups: the 13 chapters read in three movements ─────────────────
const GROUPS = [
  { numeral: "I", start: 0, end: 4 },
  { numeral: "II", start: 4, end: 9 },
  { numeral: "III", start: 9, end: 13 },
] as const

// Text-free breath image (Mustang high desert) — gallery[3] is never shown in
// the tile strips (they slice 0–3), so the band doesn't repeat a visible photo.
const BREATH_IMAGE =
  VISUAL_JOURNEY_TILES[4].gallery[3] ?? VISUAL_JOURNEY_TILES[4].cover

// The quote beat re-voices an existing chapter hook — no new copy.
const QUOTE_TILE = VISUAL_JOURNEY_TILES[6]

/**
 * Coverage-safe parallax cover: composes the shared <ParallaxImage> with a
 * child that overhangs the top so the drift never exposes the frame edge
 * (works in both the animated and reduced-motion branches).
 */
function ParallaxCover({
  src,
  alt,
  className = "",
  sizes,
  speed = 0.09,
}: {
  src: string
  alt: string
  className?: string
  sizes?: string
  speed?: number
}) {
  return (
    <ParallaxImage speed={speed} className={className}>
      <div className="absolute inset-x-0 -top-[12%] bottom-0">
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      </div>
    </ParallaxImage>
  )
}

/** Demoted per-chapter action: tracked-uppercase text link, hairline grows. */
function PlanLink() {
  return (
    <Link
      href="/contact"
      className="group inline-flex items-center gap-3 font-sans font-medium uppercase text-[11px] tracking-[0.22em] text-navy"
    >
      Plan With Us
      <span
        className="block h-px w-8 bg-current transition-all duration-300 ease-[var(--ease-out-quart)] group-hover:w-14"
        aria-hidden
      />
    </Link>
  )
}

function BulletItem({ b }: { b: VisualJourneyTile["bullets"][number] }) {
  return (
    <li className="flex gap-4">
      <span className="mt-2 w-5 h-px bg-gold shrink-0" aria-hidden />
      <div>
        <p className="font-sans font-medium uppercase text-[11px] tracking-[0.2em] text-navy mb-1.5">
          {b.label}
        </p>
        <p className="font-sans font-light text-[15px] md:text-base text-navy/65 leading-[1.7]">
          {b.body}
        </p>
      </div>
    </li>
  )
}

/** The chapter's editorial text — number, title, hook, narrative, key moments. */
function TileText({ tile }: { tile: VisualJourneyTile }) {
  return (
    <div className="space-y-7">
      <Reveal className="space-y-5">
        <p aria-hidden className="font-display font-normal text-5xl md:text-6xl text-gold/60 leading-none">
          {tile.num}
        </p>
        <h2 className="type-h2">{tile.title}</h2>
      </Reveal>

      <Reveal delay={0.08}>
        <p className="font-display italic text-xl md:text-2xl text-navy/85 leading-[1.5]">
          {tile.hook}
        </p>
      </Reveal>

      <Reveal delay={0.14}>
        <p className="type-body">{tile.narrative}</p>
      </Reveal>

      <Reveal delay={0.2}>
        <ul className="border-t border-navy/10 pt-7 space-y-6">
          {tile.bullets.map((b) => (
            <BulletItem key={b.label} b={b} />
          ))}
        </ul>
      </Reveal>

      <Reveal delay={0.24}>
        <div className="border-t border-navy/10 pt-7 space-y-6">
          <p className="font-display italic text-base md:text-lg text-navy/85 leading-[1.55]">
            {tile.cta}
          </p>
          <PlanLink />
        </div>
      </Reveal>
    </div>
  )
}

function TileGalleryStrip({ tile }: { tile: VisualJourneyTile }) {
  if (tile.gallery.length <= 1) return null
  return (
    <div className="grid grid-cols-3 gap-3 md:gap-4 mt-3 md:mt-4">
      {tile.gallery.slice(0, 3).map((src, gi) => (
        <div key={src + gi} className="relative aspect-square overflow-hidden bg-beige">
          <Image src={src} alt="" fill sizes="(max-width: 768px) 33vw, 200px" className="object-cover" />
        </div>
      ))}
    </div>
  )
}

// ── Variant A/B — contained editorial split (curtain reveal, 58/42) ────────
function SplitTile({ tile, reverse }: { tile: VisualJourneyTile; reverse: boolean }) {
  return (
    <article id={tile.slug} className="py-10 md:py-16 scroll-mt-28">
      <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-20">
        <div
          className={`grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-8 xl:gap-x-20 items-start ${
            reverse ? "lg:[direction:rtl]" : ""
          }`}
        >
          <div className="lg:col-span-7 lg:[direction:ltr]">
            <CurtainImage
              direction={reverse ? "left" : "up"}
              className="aspect-[4/5] md:aspect-[16/11]"
            >
              <Image
                src={tile.cover}
                alt={tile.title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </CurtainImage>
            <TileGalleryStrip tile={tile} />
          </div>
          <div className="lg:col-span-5 lg:[direction:ltr]">
            <TileText tile={tile} />
          </div>
        </div>
      </div>
    </article>
  )
}

// ── Variant C — full-bleed cinematic band, editorial text below ────────────
function CinematicTile({ tile }: { tile: VisualJourneyTile }) {
  return (
    <article id={tile.slug} className="pt-10 md:pt-16 scroll-mt-28">
      <div className="relative h-[70vh] min-h-[440px] w-full overflow-hidden">
        <ParallaxCover src={tile.cover} alt={tile.title} className="h-full w-full" sizes="100vw" />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20 pointer-events-none"
          aria-hidden
        />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-[90rem] mx-auto w-full px-6 md:px-12 lg:px-20 pb-12 md:pb-16">
            <Reveal>
              <p aria-hidden className="font-display font-normal text-5xl md:text-7xl text-gold/70 leading-none">
                {tile.num}
              </p>
              <h2 className="mt-3 font-display font-normal text-4xl md:text-5xl lg:text-6xl text-white tracking-[-0.01em] leading-[1.05]">
                {tile.title}
              </h2>
            </Reveal>
          </div>
        </div>
      </div>
      <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-20 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-8 xl:gap-x-20">
          <div className="lg:col-span-6 space-y-7">
            <Reveal>
              <p className="font-display italic text-xl md:text-2xl text-navy/85 leading-[1.5]">
                {tile.hook}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="type-body">{tile.narrative}</p>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="border-t border-navy/10 pt-7 space-y-6">
                <p className="font-display italic text-base md:text-lg text-navy/85 leading-[1.55]">
                  {tile.cta}
                </p>
                <PlanLink />
              </div>
            </Reveal>
          </div>
          <div className="lg:col-span-6">
            <Reveal delay={0.1}>
              <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
                {tile.bullets.map((b) => (
                  <BulletItem key={b.label} b={b} />
                ))}
              </ul>
              <TileGalleryStrip tile={tile} />
            </Reveal>
          </div>
        </div>
      </div>
    </article>
  )
}

// ── Variant D — portrait spotlight (3:4 curtain + margin caption) ──────────
function PortraitTile({ tile, flip }: { tile: VisualJourneyTile; flip: boolean }) {
  return (
    <article id={tile.slug} className="py-10 md:py-16 scroll-mt-28">
      <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-8 xl:gap-x-20 items-start">
          <div className={flip ? "lg:col-span-5 lg:col-start-8" : "lg:col-span-5"}>
            <CurtainImage className="aspect-[3/4]">
              <Image
                src={tile.cover}
                alt={tile.title}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </CurtainImage>
            <p className="mt-4 font-sans uppercase text-[10px] tracking-[0.15em] text-navy/45">
              {tile.num} — {tile.title}
            </p>
          </div>
          <div
            className={
              flip
                ? "lg:col-span-6 lg:col-start-1 lg:row-start-1 lg:pt-12"
                : "lg:col-span-6 lg:col-start-7 lg:pt-12"
            }
          >
            <TileText tile={tile} />
          </div>
        </div>
      </div>
    </article>
  )
}

function TileBlock({ tile, index }: { tile: VisualJourneyTile; index: number }) {
  // Rotate four silhouettes so no two adjacent chapters rhyme.
  switch (index % 4) {
    case 1:
      return <SplitTile tile={tile} reverse />
    case 2:
      return <CinematicTile tile={tile} />
    case 3:
      // Portrait anchors right: each D sits between a full-bleed band and an
      // image-left split, so the right anchor keeps the eye zig-zagging (P3).
      return <PortraitTile tile={tile} flip />
    default:
      return <SplitTile tile={tile} reverse={false} />
  }
}

/** Movement divider — ghost roman numeral + chapter range + hairline. */
function GroupDivider({ numeral, from, to }: { numeral: string; from: string; to: string }) {
  return (
    <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-20">
      <Reveal className="flex items-end justify-between gap-6 border-b border-navy/15 pb-5">
        <span
          aria-hidden
          className="font-display font-normal text-7xl md:text-8xl leading-[0.85] text-navy/10 select-none"
        >
          {numeral}
        </span>
        <span className="type-eyebrow pb-1">
          Chapters {from} – {to}
        </span>
      </Reveal>
    </div>
  )
}

/** Text-free full-bleed breath band — the rhythm reset. */
function BreathBand() {
  return (
    <section className="relative h-[55vh] md:h-[75vh] w-full overflow-hidden">
      <ParallaxCover src={BREATH_IMAGE} alt="" className="h-full w-full" sizes="100vw" speed={0.1} />
    </section>
  )
}

/** Quote beat — an oversized serif recall of a chapter hook, in a huge field. */
function QuoteBeat() {
  return (
    <section className="py-14 md:py-20">
      <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-20">
        <Reveal className="max-w-4xl lg:ml-[8%]">
          <blockquote>
            <p className="font-display font-normal italic text-3xl md:text-4xl lg:text-5xl text-navy leading-[1.3] tracking-[-0.01em]">
              &ldquo;{QUOTE_TILE.hook}&rdquo;
            </p>
            <cite className="not-italic mt-10 block font-sans uppercase text-[10px] tracking-[0.15em] text-navy/45">
              Chapter {QUOTE_TILE.num} — {QUOTE_TILE.title}
            </cite>
          </blockquote>
        </Reveal>
      </div>
    </section>
  )
}

export function VisualJourneyPage() {
  const reduce = useReducedMotion()
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const heroParallax = useTransform(heroProgress, [0, 1], ["0%", "30%"])
  const heroOpacity = useTransform(heroProgress, [0, 0.7], [1, 0])

  return (
    <div className="bg-background text-navy min-h-screen">
      {/* HERO */}
      <section
        ref={heroRef}
        className="relative h-[100svh] w-full flex flex-col items-center justify-center pt-20 bg-navy overflow-hidden"
      >
        <motion.div
          style={reduce ? undefined : { y: heroParallax, scale: 1.15 }}
          className="absolute inset-0 z-0 will-change-transform"
        >
          <Image
            src={VISUAL_JOURNEY_TILES[5].cover}
            alt="The Himalayas"
            fill
            className="object-cover opacity-55"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85" aria-hidden />
        </motion.div>

        <motion.div
          style={reduce ? undefined : { opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-6xl w-full"
        >
          <Reveal>
            <p className="font-sans font-medium uppercase text-[11px] md:text-xs tracking-[0.24em] text-white/60 mb-10">
              Visual Journey
            </p>
            <span className="block w-12 h-px bg-gold/55 mx-auto mb-10" aria-hidden />
            <h1
              className="font-script text-white tracking-[-0.045em] leading-[1.02] pb-2"
              style={{ fontSize: "clamp(3rem, 8vw, 8rem)" }}
            >
              Tapestry
              <br />
              of Nepal.
            </h1>
            <div className="mt-14 flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.24em] text-white/40">
              <span className="block w-8 h-px bg-white/25" aria-hidden />
              <span>Scroll</span>
              <span className="block w-8 h-px bg-white/25" aria-hidden />
            </div>
          </Reveal>
        </motion.div>
      </section>

      {/* INDEX (chapter list) */}
      <section className="bg-white py-10 md:py-16">
        <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-20">
          <Reveal className="mb-6 md:mb-8 max-w-3xl">
            <p className="type-eyebrow mb-5">The Chapters</p>
            <h2 className="type-h2">Choose your entry.</h2>
            <p className="type-lead mt-7">
              Thirteen windows into a single country, each one its own world. Walk
              through them at your own pace.
            </p>
          </Reveal>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-3">
            {VISUAL_JOURNEY_TILES.map((tile) => (
              <li key={tile.slug}>
                <Link
                  href={`#${tile.slug}`}
                  className="group flex items-baseline gap-5 py-3 border-b border-navy/10 hover:border-navy/40 transition-colors duration-300"
                >
                  <span className="font-display text-xl text-gold/60 w-8 shrink-0">
                    {tile.num}
                  </span>
                  <span className="flex-1 font-sans text-base md:text-lg text-navy/80 group-hover:text-navy transition-colors duration-300">
                    {tile.title}
                  </span>
                  <ArrowRight
                    className="w-4 h-4 text-navy/30 group-hover:text-navy group-hover:translate-x-1 transition-all duration-300"
                    strokeWidth={1.4}
                  />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CHAPTERS — three movements with breath + quote interleaves */}
      <div className="bg-white">
        {GROUPS.map((g) => (
          <Fragment key={g.numeral}>
            <GroupDivider
              numeral={g.numeral}
              from={VISUAL_JOURNEY_TILES[g.start].num}
              to={VISUAL_JOURNEY_TILES[g.end - 1].num}
            />
            {VISUAL_JOURNEY_TILES.slice(g.start, g.end).map((tile, i) => {
              const idx = g.start + i
              return (
                <Fragment key={tile.slug}>
                  <TileBlock tile={tile} index={idx} />
                  {idx === 4 && <BreathBand />}
                  {idx === 8 && <QuoteBeat />}
                </Fragment>
              )
            })}
          </Fragment>
        ))}
      </div>

      {/* CLOSING — quiet invitation band, the page's one primary action */}
      <section className="bg-beige">
        <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-20 py-14 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-x-10 xl:gap-x-16 items-end">
            <Reveal className="lg:col-span-7">
              <p className="type-eyebrow mb-8">Begin Your Journey</p>
              <h2
                className="font-display font-normal text-navy leading-[1.05] tracking-[-0.02em]"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
              >
                One country.
                <br />
                Thirteen ways in.
              </h2>
            </Reveal>
            <Reveal delay={0.15} className="lg:col-span-4 lg:col-start-9">
              <p className="type-body mb-6 md:mb-8">
                Tell us which chapters speak to you, and we&rsquo;ll weave a journey
                from them.
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
                <Link href="/contact" className="btn-primary">
                  Plan Your Journey
                </Link>
                <Link
                  href="/properties"
                  className="group inline-flex items-center gap-3 font-sans font-medium uppercase text-[11px] tracking-[0.22em] text-navy"
                >
                  Browse Stays
                  <span
                    className="block h-px w-8 bg-current transition-all duration-300 ease-[var(--ease-out-quart)] group-hover:w-14"
                    aria-hidden
                  />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  )
}
