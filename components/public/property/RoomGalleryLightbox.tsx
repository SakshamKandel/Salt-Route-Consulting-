"use client"

// ── Room gallery lightbox ───────────────────────────────────────────────────
// Full-screen room-photo viewer. A faithful port of the existing lightbox: a
// flat black overlay (already on-brand) with a counter, contained main image,
// prev/next navigation, and a thumbnail filmstrip.

import { SafeImage } from "@/components/public/property/primitives"
import type { RoomGalleryState } from "@/components/public/property/types"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

export function RoomGalleryLightbox({
  roomGallery,
  setRoomGallery,
}: {
  roomGallery: RoomGalleryState | null
  setRoomGallery: React.Dispatch<React.SetStateAction<RoomGalleryState | null>>
}) {
  if (!roomGallery) return null

  const hasMultiple = roomGallery.images.length > 1

  return (
    <div
      className="fixed inset-0 z-[10001] bg-black/90 flex flex-col items-center justify-center"
      onClick={() => setRoomGallery(null)}
    >
      {/* Close */}
      <button
        type="button"
        onClick={() => setRoomGallery(null)}
        className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        aria-label="Close gallery"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Counter */}
      <p className="text-white/70 text-[12px] mb-4">
        {roomGallery.name + " — " + (roomGallery.active + 1) + " / " + roomGallery.images.length}
      </p>

      {/* Main image */}
      <div
        className="relative w-[92vw] max-w-4xl aspect-[16/10]"
        onClick={(e) => e.stopPropagation()}
      >
        <SafeImage
          src={roomGallery.images[roomGallery.active]}
          alt={roomGallery.name}
          fill
          sizes="92vw"
          className="object-contain"
        />

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() =>
                setRoomGallery((s) =>
                  s && { ...s, active: (s.active - 1 + s.images.length) % s.images.length }
                )
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() =>
                setRoomGallery((s) => s && { ...s, active: (s.active + 1) % s.images.length })
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail filmstrip */}
      {hasMultiple && (
        <div className="flex gap-2 mt-5" onClick={(e) => e.stopPropagation()}>
          {roomGallery.images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRoomGallery((s) => s && { ...s, active: i })}
              className={`relative h-14 w-20 shrink-0 overflow-hidden border-b-2 ${
                i === roomGallery.active
                  ? "border-gold"
                  : "border-transparent opacity-60 hover:opacity-100"
              } transition-opacity`}
              aria-label={`View photo ${i + 1}`}
            >
              <SafeImage src={img} alt={roomGallery.name} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
