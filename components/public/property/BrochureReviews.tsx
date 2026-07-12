"use client"

// ── Brochure: Guest reviews ─────────────────────────────────────────────────
// Compact editorial reviews: a heading row (eyebrow + serif title left, rating
// meta right) over a hairline, then reviews in a two-column hairline grid of
// quiet py-6 rows. The empty state is one anchored serif line; the underline
// review form sits beneath. All props and conditionals are unchanged: renders
// null when there is nothing to show and no form to collect.

import { Star, Quote } from "lucide-react"
import { Eyebrow, FadeUp } from "@/components/public/property/primitives"
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
    <section className="py-10 md:py-16 bg-cream">
      <div className="max-w-screen-xl mx-auto px-5 sm:px-6 md:px-12">
        {/* Heading row — title left, rating meta right, over a hairline. */}
        <FadeUp className="flex flex-wrap items-end justify-between gap-4 border-b border-charcoal/10 pb-5">
          <div>
            <Eyebrow>Guest Voices</Eyebrow>
            <h2 className="mt-3 font-display font-normal text-[clamp(2rem,4vw,3.25rem)] leading-[1.1] tracking-[-0.01em] text-charcoal">
              Reviews
            </h2>
          </div>
          {reviewCount > 0 && (
            <p className="pb-1 font-sans text-[11px] uppercase tracking-[0.16em] sm:tracking-[0.24em] font-bold text-charcoal/60">
              {avgRating} <span className="text-gold">✦</span> {reviewCount} stays
            </p>
          )}
        </FadeUp>

        {shown.length === 0 ? (
          <FadeUp className="mt-8">
            <p className="font-display font-light text-[clamp(1.375rem,2.5vw,1.875rem)] leading-[1.35] tracking-[-0.01em] text-charcoal">
              No reviews yet — be the first to share your stay.
            </p>
          </FadeUp>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-12">
            {shown.map((review, index) => (
              <FadeUp
                key={review.id}
                delay={(index % 2) * 0.05}
                className="border-b border-charcoal/10 py-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <Quote className="w-4 h-4 text-gold/50" />
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-gold fill-gold" />
                    ))}
                  </span>
                </div>
                <p className="mt-3 font-sans text-[14px] leading-relaxed text-charcoal/75 italic whitespace-pre-line">
                  {review.comment}
                </p>

                {review.images?.length ? (
                  <div className="mt-4">
                    <ReviewImageGallery images={review.images} />
                  </div>
                ) : null}

                <p className="mt-4 font-display text-[15px] text-charcoal">
                  {review.guest.name ?? "Guest"}
                </p>
              </FadeUp>
            ))}
          </div>
        )}

        {!isOwnerView && (
          /* Review rows already close with a hairline; only the empty state
             needs its own rule above the form. */
          <FadeUp
            className={`mt-8 max-w-2xl ${
              shown.length === 0 ? "border-t border-charcoal/10 pt-8" : ""
            }`}
          >
            <PropertyReviewForm
              eligibleBookingId={eligibleBookingId}
              isAuthenticated={isAuthenticated}
              propertySlug={slug}
            />
          </FadeUp>
        )}
      </div>
    </section>
  )
}
