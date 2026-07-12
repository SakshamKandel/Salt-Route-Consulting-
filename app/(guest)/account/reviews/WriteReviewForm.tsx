"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Star, X } from "lucide-react"
import { MediaUploader, type UploadedMedia } from "@/components/admin/media-uploader"
import Image from "next/image"

export function WriteReviewForm({ bookingId, propertyName }: { bookingId: string; propertyName: string }) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [images, setImages] = useState<UploadedMedia[]>([])
  const [isPending, setIsPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError("Please select a rating.")
      return
    }
    if (comment.trim().length < 10) {
      setError("Please share a little more about the stay.")
      return
    }

    setIsPending(true)
    setError(null)

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          bookingId, 
          rating, 
          comment,
          images: images.map(img => ({
            url: img.url,
            publicId: img.publicId
          }))
        }),
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => router.refresh(), 1500)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "We could not share your review yet.")
      }
    } catch {
      setError("We could not reach the team just now. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  if (success) {
    return (
      <div className="py-10 text-center">
        <div className="w-12 h-px bg-[#C9A96E] mx-auto mb-5" />
        <p className="font-display text-lg text-[#1B3A5C] tracking-wide mb-1.5">
          Thank you for sharing
        </p>
        <p className="text-[13px] text-[#1B3A5C]/60">
          Your reflection means a great deal to us.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div className="space-y-1.5">
        <p className="text-[11px] text-[#C9A96E] uppercase tracking-[0.18em] font-medium">
          Your Stay
        </p>
        <h3 className="font-display text-xl text-[#1B3A5C] tracking-wide">{propertyName}</h3>
      </div>

      {/* Star Rating */}
      <div className="space-y-3">
        <label className="text-[13px] uppercase tracking-[0.14em] font-medium text-[#1B3A5C]/70 block">How Did It Feel?</label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "text-[#C9A96E] fill-[#C9A96E]"
                    : "text-[#1B3A5C]/10"
                }`}
                strokeWidth={1.5}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="text-[11px] uppercase tracking-[0.16em] text-[#C9A96E] ml-3 font-semibold">
              {rating === 5 ? "Exceptional" : rating === 4 ? "Excellent" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div className="space-y-3">
        <label className="text-[13px] uppercase tracking-[0.14em] font-medium text-[#1B3A5C]/70 block">Your Experience</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Describe the atmosphere, the service, and the stay..."
          rows={5}
          className="w-full bg-[#FBF9F4] border border-[#1B3A5C]/10 rounded-lg text-[#1B3A5C] px-4 py-3.5 text-[15px] leading-relaxed placeholder:text-[#1B3A5C]/40 focus:outline-none focus:border-[#1B3A5C]/30 transition-colors resize-none"
        />
      </div>

      {/* Image Upload */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[13px] uppercase tracking-[0.14em] font-medium text-[#1B3A5C]/70 block">Photos From Your Stay</label>
          <span className="text-[11px] uppercase tracking-[0.1em] text-[#1B3A5C]/55">{images.length} of 5 photos</span>
        </div>

        {images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-20 h-20 group">
                <Image
                  src={img.url}
                  alt="Review preview"
                  fill
                  className="object-cover rounded-lg border border-[#1B3A5C]/8"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 bg-[#1B3A5C] text-[#FFFAF3] rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {images.length < 5 && (
          <MediaUploader
            kind="image"
            onAdd={(m) => setImages(prev => [...prev, m])}
            multiple={true}
            maxFiles={5 - images.length}
            label="Attach Stay Photos"
            className="w-full"
          />
        )}
      </div>

      {error && (
        <p className="text-[13px] text-rose-600 font-medium">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full inline-flex items-center justify-center py-3 bg-[#1B3A5C] text-[#FFFAF3] rounded-lg text-[13px] font-medium hover:bg-[#2A4F7A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? "Sharing..." : "Share Review"}
      </button>
    </form>
  )
}

