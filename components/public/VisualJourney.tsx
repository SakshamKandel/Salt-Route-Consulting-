"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, X, ArrowRight } from "lucide-react"
import { VISUAL_JOURNEY_TILES, type VisualJourneyTile } from "@/lib/visual-journey-tiles"
import { Reveal, EASE as MOTION_EASE } from "@/components/public/motion"

const EASE = MOTION_EASE.outLuxe

// Editorial mosaic — a curated six of the thirteen tiles in a compact
// two-row grid (mixed ratios, light stagger). Indices map into
// VISUAL_JOURNEY_TILES so the lightbox's prev/next still cycles all thirteen.
const MOSAIC: { idx: number; span: string; ratio: string }[] = [
  { idx: 0, span: "col-span-2 md:col-span-5", ratio: "aspect-[4/3]" },
  { idx: 1, span: "col-span-1 md:col-span-3", ratio: "aspect-[3/4]" },
  { idx: 2, span: "col-span-1 md:col-span-4", ratio: "aspect-[4/3]" },
  { idx: 3, span: "col-span-1 md:col-span-4", ratio: "aspect-[4/3]" },
  { idx: 4, span: "col-span-1 md:col-span-3", ratio: "aspect-[3/4]" },
  { idx: 5, span: "col-span-2 md:col-span-5", ratio: "aspect-[4/3]" },
]

export function VisualJourney() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [galleryIdx, setGalleryIdx] = useState(0)

  const open = useCallback((idx: number) => {
    setActiveIdx(idx)
    setGalleryIdx(0)
  }, [])

  const close = useCallback(() => setActiveIdx(null), [])

  const next = useCallback(() => {
    setActiveIdx((i) => (i === null ? null : (i + 1) % VISUAL_JOURNEY_TILES.length))
    setGalleryIdx(0)
  }, [])

  const prev = useCallback(() => {
    setActiveIdx((i) =>
      i === null ? null : (i - 1 + VISUAL_JOURNEY_TILES.length) % VISUAL_JOURNEY_TILES.length
    )
    setGalleryIdx(0)
  }, [])

  // Lock body scroll + keyboard nav while modal is open
  useEffect(() => {
    if (activeIdx === null) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
      else if (e.key === "ArrowRight") next()
      else if (e.key === "ArrowLeft") prev()
    }
    window.addEventListener("keydown", handler)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handler)
    }
  }, [activeIdx, close, next, prev])

  const active = activeIdx !== null ? VISUAL_JOURNEY_TILES[activeIdx] : null

  return (
    <>
      <section className="py-10 md:py-16 bg-white overflow-hidden">
        {/* Eyebrow + Title */}
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <Reveal className="space-y-5 max-w-2xl">
            <p className="type-eyebrow">Visual Journey</p>
            <h2 className="type-h2">Tapestry of Nepal.</h2>
            <p className="type-body pt-1 max-w-xl">
              Thirteen windows into a single country, each one its own world. Tap a tile to step inside.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <Link
              href="/visual-journey"
              className="hidden md:inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] font-medium text-charcoal/70 hover:text-charcoal transition-colors group whitespace-nowrap"
            >
              Read the full journey
              <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.4} />
            </Link>
          </Reveal>
        </div>

        {/* Editorial mosaic — six curated tiles, uneven grid, staggered baselines */}
        <Reveal
          stagger={0.08}
          className="max-w-screen-2xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-12 gap-4 md:gap-5"
        >
          {MOSAIC.map(({ idx, span, ratio }) => {
            const tile = VISUAL_JOURNEY_TILES[idx]
            if (!tile) return null
            return (
              <Reveal.Item key={tile.slug} className={span}>
                <button
                  onClick={() => open(idx)}
                  className="group block w-full text-left focus:outline-none"
                  aria-label={`Open ${tile.title}`}
                >
                  <div className={`relative ${ratio} overflow-hidden mb-3 bg-beige w-full`}>
                    <Image
                      src={tile.cover}
                      alt={tile.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 42vw"
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/45 via-charcoal/0 to-charcoal/0" />
                    <span className="absolute top-4 left-4 font-display text-xl md:text-2xl text-white/85">
                      {tile.num}
                    </span>
                    <span className="absolute bottom-5 right-5 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.28em] text-white/85 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      Read <ArrowRight className="w-3 h-3" strokeWidth={1.4} />
                    </span>
                  </div>
                  <h3 className="font-display text-base md:text-lg text-charcoal tracking-[-0.01em] leading-tight group-hover:text-gold transition-colors duration-500">
                    {tile.title}
                  </h3>
                </button>
              </Reveal.Item>
            )
          })}
        </Reveal>

        <div className="md:hidden px-6 mt-10">
          <Link
            href="/visual-journey"
            className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] font-medium text-charcoal/70 hover:text-charcoal transition-colors"
          >
            Read the full journey
            <ArrowRight className="w-4 h-4" strokeWidth={1.4} />
          </Link>
        </div>
      </section>

      {/* MODAL */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="vj-modal-root"
            className="fixed inset-0 z-[10050]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {/* Scrim */}
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="absolute inset-0 bg-charcoal/85"
            />

            {/* Desktop: centered split panel. Mobile: full-screen slide-up overlay. */}
            <motion.div
              key={active.slug}
              role="dialog"
              aria-modal="true"
              aria-label={active.title}
              initial={{ y: "8%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "6%", opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="absolute inset-0 md:inset-8 lg:inset-12 bg-background text-charcoal flex flex-col md:flex-row overflow-hidden"
            >
              {/* Close */}
              <button
                onClick={close}
                aria-label="Close"
                className="absolute top-5 right-5 z-20 w-11 h-11 inline-flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-charcoal border border-charcoal/10 transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={1.4} />
              </button>

              {/* Prev / Next (large, off-edge on desktop; visible inline on mobile) */}
              <button
                onClick={prev}
                aria-label="Previous"
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-white/90 hover:bg-white text-charcoal border border-charcoal/10 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" strokeWidth={1.4} />
              </button>
              <button
                onClick={next}
                aria-label="Next"
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-white/90 hover:bg-white text-charcoal border border-charcoal/10 transition-colors"
              >
                <ChevronRight className="w-5 h-5" strokeWidth={1.4} />
              </button>

              {/* LEFT 60% — Gallery */}
              <div className="relative md:w-[60%] h-[55vh] md:h-full bg-charcoal flex flex-col">
                <div className="relative flex-1 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${active.slug}-${galleryIdx}`}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7, ease: EASE }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={active.gallery[galleryIdx]}
                        alt={`${active.title} — image ${galleryIdx + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 60vw"
                        className="object-cover"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Tile number watermark */}
                  <span className="absolute top-6 left-6 font-display text-4xl md:text-5xl text-white/70 tracking-wide pointer-events-none">
                    {active.num}
                  </span>
                </div>

                {/* Thumbnails */}
                {active.gallery.length > 1 && (
                  <div className="flex gap-2 md:gap-3 p-4 md:p-5 bg-charcoal">
                    {active.gallery.map((src, gi) => (
                      <button
                        key={src + gi}
                        onClick={() => setGalleryIdx(gi)}
                        aria-label={`View image ${gi + 1}`}
                        className={`relative h-14 md:h-16 flex-1 overflow-hidden transition-all duration-500 ${
                          gi === galleryIdx
                            ? "ring-2 ring-gold opacity-100"
                            : "opacity-50 hover:opacity-90"
                        }`}
                      >
                        <Image
                          src={src}
                          alt=""
                          fill
                          sizes="120px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT 40% — Text (scrolls independently) */}
              <div className="md:w-[40%] flex flex-col bg-background">
                <div className="overflow-y-auto flex-1 px-6 md:px-10 lg:px-14 py-10 md:py-14 lg:py-16">
                  <p className="text-xs uppercase tracking-[0.28em] text-charcoal/45 font-medium mb-5">
                    Tile {active.num} · Tapestry of Nepal
                  </p>
                  <h3 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal tracking-[-0.01em] leading-[1.1] mb-7">
                    {active.title}
                  </h3>

                  <p className="font-display text-lg md:text-xl text-charcoal/85 leading-[1.5] mb-8 italic">
                    {active.hook}
                  </p>

                  <p className="font-sans text-base md:text-[17px] text-charcoal/65 leading-[1.85] font-light mb-10">
                    {active.narrative}
                  </p>

                  <ul className="space-y-5 mb-10 border-t border-charcoal/10 pt-8">
                    {active.bullets.map((b) => (
                      <li key={b.label} className="flex gap-4">
                        <span className="mt-2 w-5 h-px bg-gold shrink-0" aria-hidden />
                        <div>
                          <p className="font-display text-base md:text-lg text-charcoal tracking-wide uppercase mb-1">
                            {b.label}
                          </p>
                          <p className="font-sans text-base text-charcoal/65 leading-[1.75] font-light">
                            {b.body}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="border-t border-charcoal/10 pt-8 space-y-6">
                    <p className="font-display text-base md:text-lg text-charcoal/85 leading-[1.55] italic">
                      {active.cta}
                    </p>
                    <Link
                      href="/contact"
                      onClick={close}
                      className="inline-flex items-center gap-3 px-8 py-4 text-sm uppercase tracking-[0.2em] font-medium border border-charcoal text-charcoal hover:bg-charcoal hover:text-white transition-colors duration-500"
                    >
                      Plan With Us
                      <ArrowRight className="w-4 h-4" strokeWidth={1.4} />
                    </Link>
                  </div>
                </div>

                {/* Mobile prev/next bar */}
                <div className="md:hidden flex items-center justify-between border-t border-charcoal/10 px-6 py-4 bg-background">
                  <button
                    onClick={prev}
                    className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] font-medium text-charcoal/70 hover:text-charcoal"
                  >
                    <ChevronLeft className="w-4 h-4" strokeWidth={1.4} />
                    Prev
                  </button>
                  <span className="text-xs uppercase tracking-[0.3em] text-charcoal/40">
                    {activeIdx! + 1} / {VISUAL_JOURNEY_TILES.length}
                  </span>
                  <button
                    onClick={next}
                    className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] font-medium text-charcoal/70 hover:text-charcoal"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" strokeWidth={1.4} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
