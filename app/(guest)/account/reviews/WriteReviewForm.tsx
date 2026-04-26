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
      <div className="border border-charcoal/10 bg-[#FBF9F4] p-12 text-center">
        <div className="w-12 h-[1px] bg-gold mx-auto mb-6" />
        <p className="text-charcoal text-[10px] uppercase tracking-[0.3em] font-sans font-medium">
          Thank You For Sharing.
        </p>
        <p className="text-charcoal/50 text-[10px] uppercase tracking-[0.2em] mt-2 font-light">
          Thank you for sharing your experience.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.3em] text-charcoal/40 font-sans font-medium">
          Your Stay
        </p>
        <h3 className="font-display text-2xl text-charcoal tracking-wide">{propertyName}</h3>
      </div>
      
      {/* Star Rating */}
      <div className="space-y-4">
        <label className="text-[9px] uppercase tracking-[0.2em] font-semibold text-charcoal/40 block">How Did It Feel?</label>
        <div className="flex items-center gap-3">
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
                    ? "text-gold fill-gold"
                    : "text-charcoal/10"
                }`}
                strokeWidth={1}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="text-[9px] uppercase tracking-[0.2em] text-gold ml-4 font-bold">
              {rating === 5 ? "Exceptional" : rating === 4 ? "Excellent" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div className="space-y-4">
        <label className="text-[9px] uppercase tracking-[0.2em] font-semibold text-charcoal/40 block">Your Experience</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Describe the atmosphere, the service, and the stay..."
          rows={5}
          className="w-full bg-[#FBF9F4] border-b border-charcoal/10 text-charcoal px-0 py-4 text-sm font-sans placeholder:text-charcoal/20 focus:outline-none focus:border-charcoal/30 transition-colors resize-none font-light"
        />
      </div>

      {/* Image Upload */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
        <label className="text-[9px] uppercase tracking-[0.2em] font-semibold text-charcoal/40 block">Photos From Your Stay</label>
          <span className="text-[8px] uppercase tracking-[0.1em] text-charcoal/30 font-light">{images.length} of 5 photos</span>
        </div>
        
        {images.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-6">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-24 h-24 group">
                <Image 
                  src={img.url} 
                  alt="Review preview" 
                  fill 
                  className="object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-700"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 bg-charcoal text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
        <div className="bg-red-50 border-l-2 border-red-500 p-4">
          <p className="text-red-600 text-[10px] uppercase tracking-[0.2em] font-medium">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-charcoal text-white py-5 text-[10px] uppercase tracking-[0.4em] font-sans hover:bg-gold hover:text-white transition-all duration-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
      >
        {isPending ? "Sharing..." : "Share Review"}
      </button>
    </form>
  )
}

