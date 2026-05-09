"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { VISUAL_JOURNEY_TILES, type VisualJourneyTile } from "@/lib/visual-journey-tiles"

const EASE = [0.16, 1, 0.3, 1] as const

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.2, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function useParallaxY(ref: React.RefObject<HTMLElement | null>, intensity = 0.15): MotionValue<string> {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  return useTransform(scrollYProgress, [0, 1], [`-${intensity * 100}%`, `${intensity * 100}%`])
}

function ParallaxFigure({
  src,
  alt,
  className = "",
  intensity = 0.16,
  priority = false,
}: {
  src: string
  alt: string
  className?: string
  intensity?: number
  priority?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const y = useParallaxY(ref, intensity)
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="absolute inset-[-12%] will-change-transform">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority={priority}
        />
      </motion.div>
    </div>
  )
}

function TileBlock({ tile, index }: { tile: VisualJourneyTile; index: number }) {
  // Alternate image/text sides for visual rhythm
  const reverse = index % 2 === 1

  return (
    <article id={tile.slug} className="py-20 md:py-28 border-t border-charcoal/8 first:border-t-0">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12">
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start ${reverse ? "lg:[direction:rtl]" : ""}`}>

          {/* Image column */}
          <div className="lg:col-span-7 lg:[direction:ltr]">
            <ParallaxFigure
              src={tile.cover}
              alt={tile.title}
              className="aspect-[4/5] md:aspect-[16/11] border border-charcoal/8"
              intensity={0.12}
            />

            {tile.gallery.length > 1 && (
              <div className="grid grid-cols-3 gap-3 md:gap-4 mt-3 md:mt-4">
                {tile.gallery.slice(0, 3).map((src, gi) => (
                  <div key={src + gi} className="relative aspect-square overflow-hidden bg-[#F5F1E8]">
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 33vw, 200px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Text column */}
          <div className="lg:col-span-5 lg:[direction:ltr] space-y-7">
            <FadeUp className="space-y-5">
              <p className="font-display text-5xl md:text-6xl text-gold/65 leading-none tracking-wide">
                {tile.num}
              </p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal tracking-wide uppercase leading-[1.1]">
                {tile.title}
              </h2>
            </FadeUp>

            <FadeUp delay={0.08}>
              <p className="font-display text-lg md:text-xl text-charcoal/85 leading-[1.55] italic">
                {tile.hook}
              </p>
            </FadeUp>

            <FadeUp delay={0.14}>
              <p className="font-sans text-base md:text-lg text-charcoal/65 leading-[1.85] font-light">
                {tile.narrative}
              </p>
            </FadeUp>

            <FadeUp delay={0.2}>
              <ul className="space-y-5 border-t border-charcoal/10 pt-7">
                {tile.bullets.map((b) => (
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
            </FadeUp>

            <FadeUp delay={0.24}>
              <div className="border-t border-charcoal/10 pt-7 space-y-5">
                <p className="font-display text-base md:text-lg text-charcoal/85 leading-[1.55] italic">
                  {tile.cta}
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 px-7 py-3.5 text-sm uppercase tracking-[0.2em] font-medium border border-charcoal text-charcoal hover:bg-charcoal hover:text-white transition-colors duration-500"
                >
                  Plan With Us
                  <ArrowRight className="w-4 h-4" strokeWidth={1.4} />
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </article>
  )
}

export function VisualJourneyPage() {
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const heroParallax = useTransform(heroProgress, [0, 1], ["0%", "30%"])
  const heroOpacity = useTransform(heroProgress, [0, 0.7], [1, 0])

  return (
    <div className="bg-background text-charcoal min-h-screen">
      {/* HERO */}
      <section ref={heroRef} className="relative h-[100svh] w-full flex flex-col items-center justify-center pt-20 bg-charcoal overflow-hidden">
        <motion.div
          style={{ y: heroParallax, scale: 1.15 }}
          className="absolute inset-0 z-0 will-change-transform"
        >
          <Image
            src={VISUAL_JOURNEY_TILES[5].cover}
            alt="The Himalayas"
            fill
            className="object-cover opacity-55"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-5xl w-full will-change-transform"
        >
          <FadeUp>
            <p className="text-sm uppercase tracking-[0.6em] text-white/55 font-sans mb-10 font-light">
              Visual Journey
            </p>
            <span className="block w-12 h-px bg-gold/55 mx-auto mb-10" aria-hidden />
            <h1
              className="font-display text-white tracking-wide leading-[0.95] font-normal uppercase"
              style={{ fontSize: "clamp(3rem, 11vw, 9rem)" }}
            >
              Tapestry<br />of Nepal.
            </h1>
            <p className="mt-12 max-w-xl mx-auto text-lg md:text-xl text-white/55 font-light leading-relaxed">
              Thirteen windows into a single country, each one its own world. Walk through them at your own pace.
            </p>
            <div className="mt-12 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.5em] text-white/40">
              <span className="block w-8 h-px bg-white/25" />
              <span>Scroll</span>
              <span className="block w-8 h-px bg-white/25" />
            </div>
          </FadeUp>
        </motion.div>
      </section>

      {/* INDEX (chapter list) */}
      <section className="bg-white py-20 md:py-24 border-b border-charcoal/8">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <FadeUp className="mb-10 md:mb-14">
            <p className="text-sm uppercase tracking-[0.4em] text-charcoal/45 font-medium mb-4">The Chapters</p>
            <h2 className="font-display text-3xl md:text-5xl text-charcoal tracking-wide uppercase leading-[1.05]">
              Choose your entry.
            </h2>
          </FadeUp>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-3">
            {VISUAL_JOURNEY_TILES.map((tile) => (
              <li key={tile.slug}>
                <Link
                  href={`#${tile.slug}`}
                  className="group flex items-baseline gap-5 py-3 border-b border-charcoal/8 hover:border-charcoal/40 transition-colors"
                >
                  <span className="font-display text-xl text-gold/55 tracking-wide w-8 shrink-0">
                    {tile.num}
                  </span>
                  <span className="flex-1 font-sans text-base md:text-lg text-charcoal/80 group-hover:text-charcoal transition-colors">
                    {tile.title}
                  </span>
                  <ArrowRight className="w-4 h-4 text-charcoal/30 group-hover:text-charcoal group-hover:translate-x-1 transition-all duration-500" strokeWidth={1.4} />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* TILE BLOCKS */}
      <div className="bg-white">
        {VISUAL_JOURNEY_TILES.map((tile, idx) => (
          <TileBlock key={tile.slug} tile={tile} index={idx} />
        ))}
      </div>

      {/* CLOSING CTA */}
      <section className="py-32 md:py-44 bg-charcoal text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <Image
            src={VISUAL_JOURNEY_TILES[5].cover}
            alt=""
            fill
            className="object-cover blur-3xl"
          />
        </div>
        <div className="max-w-3xl mx-auto relative z-10">
          <FadeUp className="space-y-10">
            <span className="block w-12 h-px bg-gold/45 mx-auto" aria-hidden />
            <p className="text-sm uppercase tracking-[0.6em] text-white/40 font-light">Begin Your Journey</p>
            <h2
              className="font-display text-white tracking-wide uppercase leading-[0.95]"
              style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)" }}
            >
              One country.<br />Thirteen ways in.
            </h2>
            <p className="font-sans text-lg md:text-xl text-white/55 leading-[1.85] font-light max-w-md mx-auto">
              Tell us which chapters speak to you, and we&rsquo;ll weave a journey from them.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 px-9 py-4 text-sm uppercase tracking-[0.2em] font-medium bg-white text-charcoal hover:bg-white/90 transition-colors duration-500"
              >
                Plan Your Journey
                <ArrowRight className="w-4 h-4" strokeWidth={1.4} />
              </Link>
              <Link
                href="/properties"
                className="inline-flex items-center gap-3 px-9 py-4 text-sm uppercase tracking-[0.2em] font-medium border border-white/30 text-white hover:border-white/70 transition-colors duration-500"
              >
                Browse Stays
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  )
}
