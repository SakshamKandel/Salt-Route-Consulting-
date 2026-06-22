"use client"

import { useState } from "react"
import Link from "next/link"
import { Star } from "lucide-react"
import { LuxuryButton } from "@/components/ui/luxury-button"

type Props = {
  /** Completed, unreviewed booking for this property (if the viewer has one). */
  eligibleBookingId?: string | null
  isAuthenticated: boolean
  propertySlug: string
}

export function PropertyReviewForm({ eligibleBookingId, isAuthenticated, propertySlug }: Props) {
  const [rating, setRating] = useState(5)
  const [hovered, setHovered] = useState<number | null>(null)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isAuthenticated) {
    return (
      <div className="text-center space-y-4">
        <p className="text-[13px] text-charcoal/50 font-light">
          Stayed with us? Sign in to share your experience after your stay.
        </p>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(`/properties/${propertySlug}`)}`}
          className="inline-block text-[10px] uppercase tracking-[0.3em] font-bold text-charcoal border-b border-gold/50 pb-1 hover:border-gold transition-colors"
        >
          Sign In To Review
        </Link>
      </div>
    )
  }

  if (!eligibleBookingId) {
    return (
      <p className="text-center text-[13px] text-charcoal/50 font-light">
        Reviews come from verified stays. Once your stay here is completed, you can share your story right from this page.
      </p>
    )
  }

  if (done) {
    return (
      <div className="text-center space-y-2">
        <p className="font-display text-xl text-charcoal uppercase tracking-wide">Thank You</p>
        <p className="text-[13px] text-charcoal/50 font-light">
          Your review has been received and will appear here once our team publishes it.
        </p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (comment.trim().length < 10) {
      setError("Please write at least a few words about your stay.")
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: eligibleBookingId, rating, comment: comment.trim() }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(data.error || "Could not submit your review. Please try again.")
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your review. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-charcoal/40">Share Your Story</p>
        <p className="text-[13px] text-charcoal/50 font-light">
          You completed a stay here — tell future guests how it was.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            onMouseEnter={() => setHovered(value)}
            onMouseLeave={() => setHovered(null)}
            aria-label={`${value} star${value === 1 ? "" : "s"}`}
            className="p-1"
          >
            <Star
              size={22}
              strokeWidth={1.25}
              className={`transition-colors ${value <= (hovered ?? rating) ? "text-gold fill-current" : "text-charcoal/20"}`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        placeholder="The mornings on the terrace, the welcome we received..."
        className="w-full min-h-[110px] resize-none border border-charcoal/15 bg-white px-4 py-3 text-sm font-light text-charcoal/80 placeholder:text-charcoal/30 focus:outline-none focus:border-charcoal transition-colors"
      />

      {error && (
        <p className="text-center text-xs text-red-700 uppercase tracking-wide">{error}</p>
      )}

      <div className="text-center">
        <LuxuryButton type="submit" disabled={submitting}>
          {submitting ? "Sending..." : "Submit Review"}
        </LuxuryButton>
      </div>
    </form>
  )
}
