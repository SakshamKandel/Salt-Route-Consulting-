"use client"

// ── Brochure: Guest reviews ─────────────────────────────────────────────────
// Editorial, image-forward review list with a quiet underline review form.
// Renders null when there is nothing to show and no form to collect.

import { Star, Quote } from "lucide-react"
import { SectionHeading, GoldRule, FadeUp } from "@/components/public/property/primitives"
import type { ReviewData } from "@/components/public/property/types"
import { PropertyReviewForm } from "@/components/public/PropertyReviewForm"
import { ReviewImageGallery } from "@/components/public/ReviewImageGallery"

export function BrochureReviews({
  reviews,
  reviewCount,
  avgRating,
  slug,
  isOwnerView,
  isAuthenticated,
  eligibleBookingId,
}: {
  reviews: ReviewData[]
  reviewCount: number
  avgRating: string
  slug: string
  isOwnerView: boolean
  isAuthenticated: boolean
  eligibleBookingId: string | null
}) {
  const shown = (reviews ?? []).slice(0, 6)

  // Nothing to show and nothing to collect → render nothing at all.
  if (shown.length === 0 && isOwnerView) return null

  return (
    <section className="py-16 md:py-28 bg-cream">
      <SectionHeading eyebrow="Guest Voices" title="Reviews" />

      {reviewCount > 0 && (
        <FadeUp className="text-center -mt-6 mb-12">
          <p className="font-sans text-[12px] uppercase tracking-[0.16em] sm:tracking-[0.3em] font-bold text-charcoal/60">
            {avgRating} <span className="text-gold">✦</span> {reviewCount} stays
          </p>
        </FadeUp>
      )}

      {shown.length === 0 ? (
        <FadeUp className="text-center">
          <p className="font-sans text-[15px] text-charcoal/50 italic">
            No reviews yet — be the first to share your stay.
          </p>
        </FadeUp>
      ) : (
        <div className="max-w-3xl mx-auto px-5 sm:px-6 space-y-12">
          {shown.map((review, index) => (
            <FadeUp
              key={review.id}
              className={index === 0 ? "" : "border-t border-charcoal/10 pt-12"}
            >
              <Quote className="w-6 h-6 text-gold/40" />
              <p className="mt-5 font-sans text-[16px] leading-loose text-charcoal/75 italic whitespace-pre-line">
                {review.comment}
              </p>

              {review.images?.length ? (
                <div className="mt-6">
                  <ReviewImageGallery images={review.images} />
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <span className="font-display text-charcoal">
                  {review.guest.name ?? "Guest"}
                </span>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-gold fill-gold" />
                  ))}
                </span>
              </div>
            </FadeUp>
          ))}
        </div>
      )}

      {!isOwnerView && (
        <FadeUp className="max-w-3xl mx-auto px-5 sm:px-6 mt-12 pt-12 border-t border-charcoal/10">
          <GoldRule className="mb-8" />
          <PropertyReviewForm
            eligibleBookingId={eligibleBookingId}
            isAuthenticated={isAuthenticated}
            propertySlug={slug}
          />
        </FadeUp>
      )}
    </section>
  )
}
