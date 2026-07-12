"use client"

// ── Brochure hero ───────────────────────────────────────────────────────────
// Compact editorial hero: bottom-left location kicker, serif title and a
// one-line tagline over a slow Ken-Burns image. Gradient-only legibility (no
// card, border, or shadow) and text CTAs (Watch Video + wishlist). All motion
// is preview-gated (static inside the admin live preview) and honors
// prefers-reduced-motion. The property type renders in the Overview facts
// strip directly below the booking bar (its prop is kept in the API).

import { motion, useReducedMotion } from "framer-motion"
import { MapPin, Play } from "lucide-react"
import { SafeImage, BrochureKenBurns } from "@/components/public/property/primitives"
import { LuxuryButton } from "@/components/ui/luxury-button"
import { WishlistButton } from "@/app/(public)/properties/[slug]/WishlistButton"
import type { ReactNode } from "react"

/** Fade + short rise on mount (hero choreography). Static when `still`. */
function Rise({
  still,
  delay,
  className,
  children,
}: {
  still: boolean
  delay: number
  className?: string
  children: ReactNode
}) {
  if (still) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function BrochureHero({
  heroImage,
  title,
  tagline,
  location,
  propertyId,
  wishlistItem,
  hasVideo,
  isOwnerView,
  previewMode,
  ownerHref,
  onWatchVideo,
}: {
  heroImage: string
  title: string
  /** Kept in the API; the type now renders in the Overview facts strip. */
  propertyType?: string | null
  tagline?: string | null
  location: string
  propertyId: string
  wishlistItem: boolean
  hasVideo: boolean
  isOwnerView: boolean
  previewMode: boolean
  ownerHref: string
  onWatchVideo: () => void
}) {
  const reduce = useReducedMotion()
  if (!heroImage) return null

  // Preview pane and reduced-motion both render the final state statically.
  const still = previewMode || !!reduce

  return (
    <section
      className={`relative w-full bg-charcoal ${
        previewMode ? "h-[560px] md:h-[520px]" : "h-[64svh] md:h-[76vh] min-h-[520px]"
      }`}
    >
      <div className="absolute inset-0">
        <BrochureKenBurns className="h-full w-full">
          <SafeImage
            src={heroImage}
            alt={title}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            className="object-cover"
          />
        </BrochureKenBurns>
      </div>

      {/* Legibility gradient — not a card or border. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <div className="absolute inset-0 flex items-end">
        <div className="w-full max-w-screen-xl mx-auto px-5 sm:px-6 md:px-12 pb-20 md:pb-28 text-white">
          <Rise still={still} delay={0.2}>
            <p className="mb-4 flex items-center gap-2.5 text-[10px] uppercase tracking-[0.24em] text-white/75">
              <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
              <span className="min-w-0">{location}</span>
            </p>
          </Rise>

          <h1 className="font-display font-normal text-[clamp(2.5rem,5vw,4rem)] tracking-[-0.02em] leading-[1.05]">
            {still ? (
              title
            ) : (
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  {title}
                </motion.span>
              </span>
            )}
          </h1>

          {tagline ? (
            <Rise still={still} delay={0.6}>
              <p className="mt-4 max-w-2xl font-sans font-light text-white/80 text-base md:text-lg">
                {tagline}
              </p>
            </Rise>
          ) : null}

          <Rise still={still} delay={0.75}>
            <div className="mt-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
              {hasVideo ? (
                <button
                  type="button"
                  onClick={onWatchVideo}
                  className="group flex items-center gap-3 uppercase tracking-[0.18em] text-[11px] font-bold text-white/90 transition-colors duration-500 hover:text-gold sm:tracking-[0.28em]"
                >
                  <Play className="w-4 h-4" strokeWidth={1.5} />
                  Watch Video
                </button>
              ) : null}

              {isOwnerView ? (
                <LuxuryButton href={ownerHref} dark>
                  View Owner Details
                </LuxuryButton>
              ) : !previewMode ? (
                <WishlistButton propertyId={propertyId} initialWishlisted={wishlistItem} />
              ) : null}
            </div>
          </Rise>
        </div>
      </div>
    </section>
  )
}
