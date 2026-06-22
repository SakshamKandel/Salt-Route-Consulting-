"use client"

// ── Brochure hero ───────────────────────────────────────────────────────────
// Full-bleed image-forward hero for the property brochure redesign. Bottom-
// anchored editorial text, gradient-only legibility (no card/border/shadow),
// and text+hairline CTAs. Motion is handled by the shared primitives, which
// auto-disable in the admin live preview.

import { MapPin, Play } from "lucide-react"
import { SafeImage, Eyebrow } from "@/components/public/property/primitives"
import { LuxuryButton } from "@/components/ui/luxury-button"
import { WishlistButton } from "@/app/(public)/properties/[slug]/WishlistButton"

export function BrochureHero({
  heroImage,
  title,
  propertyType,
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
  if (!heroImage) return null

  return (
    <section
      className={`relative w-full bg-charcoal ${
        previewMode ? "h-[600px] md:h-[520px]" : "h-[85vh] md:h-[80vh]"
      }`}
    >
      <SafeImage
        src={heroImage}
        alt={title}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Legibility gradient — not a card or border. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <div className="absolute inset-0 flex items-end">
        <div className="w-full max-w-screen-xl mx-auto px-6 md:px-12 pb-14 md:pb-20 text-white">
          {propertyType ? (
            <Eyebrow light className="mb-5">
              {propertyType}
            </Eyebrow>
          ) : null}

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl uppercase tracking-wide leading-[1.05]">
            {title}
          </h1>

          {tagline ? (
            <p className="mt-5 font-sans font-light text-white/80 text-lg">{tagline}</p>
          ) : null}

          <div className="mt-6 flex items-center gap-3 text-white/70 uppercase tracking-[0.2em] text-[11px]">
            <MapPin className="w-4 h-4" strokeWidth={1.5} />
            <span>{location}</span>
          </div>

          <div className="mt-8 flex items-center gap-8">
            {hasVideo ? (
              <button
                type="button"
                onClick={onWatchVideo}
                className="group flex items-center gap-3 uppercase tracking-[0.3em] text-[11px] font-bold text-white/90 transition-colors duration-500 hover:text-gold"
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
        </div>
      </div>
    </section>
  )
}
