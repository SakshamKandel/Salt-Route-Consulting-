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
    <section className="py-20 md:py-28 bg-sand">
      <div className="max-w-screen-xl mx-auto px-5 sm:px-6 md:px-12">
        {/* Heading row */}
        <FadeUp className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-[10px] uppercase tracking-[0.26em] text-gold font-semibold mb-2">
              Guest Reflections
            </p>
            <h2 className="font-display uppercase tracking-[0.16em] text-navy text-2xl sm:text-3xl md:text-4xl font-normal">
              Guest Reviews
            </h2>
          </div>
          {reviewCount > 0 && (
            <p className="pb-1 font-sans text-xs uppercase tracking-[0.2em] font-semibold text-navy/60">
              {avgRating} <span className="text-gold">★</span> {reviewCount} {reviewCount === 1 ? "stay" : "stays"}
            </p>
          )}
        </FadeUp>

        {shown.length === 0 ? (
          <FadeUp className="mt-4">
            <p className="font-display font-light text-xl md:text-2xl text-navy/60">
              No reviews yet — be the first to share your sanctuary stay.
            </p>
          </FadeUp>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {shown.map((review, index) => (
              <FadeUp
                key={review.id}
                delay={(index % 2) * 0.05}
                className="bg-white p-8 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <Quote className="w-5 h-5 text-gold/40" />
                  <span className="flex items-center gap-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-gold fill-gold" />
                    ))}
                  </span>
                </div>
                <p className="font-serif italic text-xs sm:text-sm leading-relaxed text-navy/80 whitespace-pre-line">
                  &ldquo;{review.comment}&rdquo;
                </p>

                {review.images?.length ? (
                  <div className="mt-4">
                    <ReviewImageGallery images={review.images} />
                  </div>
                ) : null}

                <div className="pt-2">
                  <p className="font-display text-sm font-semibold text-navy">
                    {review.guest.name ?? "Sanctuary Guest"}
                  </p>
                </div>
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
