"use client"

// ── Brochure: Rooms & Suites ────────────────────────────────────────────────
// Ritz-style compact grid (2-up / 3-up cards): 4:3 photography (or a quiet
// sand typographic panel when a room has none), class kicker, serif name, one
// meta line, a hairline price row and a small RESERVE text link. Photo clicks
// keep the same onOpenRoomGallery gating (disabled in the admin preview);
// RESERVE keeps the same onReserve(roomTypeId) callback. FadeUp is the only
// motion and is preview-gated in primitives.

import { ArrowRight } from "lucide-react"
import {
  SafeImage,
  FadeUp,
  SectionHeading,
  Eyebrow,
  formatClassType,
} from "@/components/public/property/primitives"
import type { RoomTypeData, RoomGalleryState } from "@/components/public/property/types"
import { formatNpr } from "@/lib/currency"

export function BrochureRooms({
  roomTypes,
  isOwnerView,
  previewMode,
  hidePrice,
  onOpenRoomGallery,
  onReserve,
}: {
  roomTypes: RoomTypeData[]
  isOwnerView: boolean
  previewMode: boolean
  hidePrice?: boolean
  onOpenRoomGallery: (g: RoomGalleryState) => void
  onReserve: (roomId: string) => void
}) {
  if (!roomTypes || roomTypes.length === 0) return null

  const roomImagesOf = (rt: RoomTypeData): string[] =>
    (rt.images && rt.images.length > 0 ? rt.images : rt.imageUrl ? [rt.imageUrl] : []).filter(
      Boolean,
    ) as string[]

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-screen-xl mx-auto px-5 sm:px-6 md:px-12">
        {/* Header row — eyebrow + title left, stay count right. */}
        <div className="flex items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-[10px] uppercase tracking-[0.26em] text-gold font-semibold mb-2">
              Sanctuary Accommodations
            </p>
            <h2 className="font-display uppercase tracking-[0.16em] text-navy text-2xl sm:text-3xl md:text-4xl font-normal">
              Rooms and Suites
            </h2>
          </div>
          <p className="shrink-0 pb-1 font-sans uppercase text-[10px] tracking-[0.2em] text-navy/50 font-medium">
            {String(roomTypes.length).padStart(2, "0")} {roomTypes.length === 1 ? "Stay" : "Stays"} Available
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {roomTypes.map((rt, i) => {
            const imgs = roomImagesOf(rt)
            const cover = imgs[0] || ""
            const openable = imgs.length > 0 && !previewMode

            const meta: string[] = [
              `${rt.maxGuests} Guests`,
              `${rt.bedrooms} Beds`,
              `${rt.bathrooms} Baths`,
            ]
            if (rt.sizeSqm) meta.push(`${rt.sizeSqm} sqm`)

            return (
              <FadeUp key={rt.id} delay={(i % 3) * 0.06}>
                <article className="flex h-full flex-col bg-sand shadow-sm hover:shadow-xl transition-shadow duration-500 overflow-hidden">
                  {cover ? (
                    <button
                      type="button"
                      aria-label={`View ${rt.name} photos`}
                      onClick={() => {
                        if (openable) onOpenRoomGallery({ images: imgs, active: 0, name: rt.name })
                      }}
                      className={`group relative block aspect-[4/3] w-full overflow-hidden bg-beige ${
                        openable ? "cursor-pointer" : "cursor-default"
                      }`}
                    >
                      <SafeImage
                        src={cover}
                        alt={rt.name}
                        fill
                        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                      {imgs.length > 1 && (
                        <span className="absolute bottom-3 left-3 bg-navy/80 backdrop-blur-xs px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] font-sans font-medium text-cream">
                          {imgs.length} Photos
                        </span>
                      )}
                    </button>
                  ) : (
                    <div className="flex aspect-[4/3] w-full flex-col items-start justify-end bg-sand p-6">
                      <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">
                        {formatClassType(rt.classType)}
                      </p>
                      <p className="mt-2 font-display text-2xl text-navy">
                        {rt.name}
                      </p>
                    </div>
                  )}

                  <div className="p-6 flex flex-1 flex-col justify-between bg-white">
                    <div>
                      <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">
                        {formatClassType(rt.classType)}
                      </p>
                      <h3 className="mt-1 font-display text-xl text-navy">
                        {rt.name}
                      </h3>
                      <p className="mt-1.5 font-sans text-[10px] uppercase tracking-[0.16em] text-navy/50">
                        {meta.join(" · ")}
                      </p>

                      {rt.description && (
                        <p className="mt-3 font-sans text-xs text-navy/70 font-light leading-relaxed line-clamp-2">
                          {rt.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-6 mt-6">
                      <div className="flex items-center justify-between gap-4">
                        {hidePrice || rt.hidePrice ? (
                          <p className="font-display text-sm text-gold font-medium">
                            Request a Quote
                          </p>
                        ) : (
                          <p className="font-display text-lg text-navy">
                            {formatNpr(rt.pricePerNight)}
                            <span className="text-[10px] font-sans text-navy/50"> / night</span>
                          </p>
                        )}
                        {!isOwnerView && (
                          <button
                            type="button"
                            onClick={() => onReserve(rt.id)}
                            className="inline-flex items-center gap-1.5 bg-navy text-cream hover:bg-gold hover:text-navy px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] font-medium transition-colors"
                          >
                            {hidePrice || rt.hidePrice ? "Request Quote" : "Reserve"}
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              </FadeUp>
            )
          })}
        </div>
      </div>
    </section>
  )
}
