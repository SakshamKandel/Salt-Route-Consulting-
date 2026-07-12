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
  onOpenRoomGallery,
  onReserve,
}: {
  roomTypes: RoomTypeData[]
  isOwnerView: boolean
  previewMode: boolean
  onOpenRoomGallery: (g: RoomGalleryState) => void
  onReserve: (roomId: string) => void
}) {
  if (!roomTypes || roomTypes.length === 0) return null

  const roomImagesOf = (rt: RoomTypeData): string[] =>
    (rt.images && rt.images.length > 0 ? rt.images : rt.imageUrl ? [rt.imageUrl] : []).filter(
      Boolean,
    ) as string[]

  return (
    <section className="py-10 md:py-16 bg-white">
      <div className="max-w-screen-xl mx-auto px-5 sm:px-6 md:px-12">
        {/* Header row — eyebrow + title left, stay count right. */}
        <div className="flex items-end justify-between gap-6 border-b border-charcoal/10 pb-5">
          <SectionHeading
            eyebrow="Accommodation"
            title="Rooms & Suites"
            align="left"
            variant="editorial"
            className="mb-0"
          />
          <p className="shrink-0 pb-1 font-sans uppercase text-[10px] tracking-[0.15em] text-charcoal/45">
            {String(roomTypes.length).padStart(2, "0")} {roomTypes.length === 1 ? "Stay" : "Stays"}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
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
                <article className="flex h-full flex-col">
                  {cover ? (
                    <button
                      type="button"
                      aria-label={`View ${rt.name} photos`}
                      onClick={() => {
                        if (openable) onOpenRoomGallery({ images: imgs, active: 0, name: rt.name })
                      }}
                      className={`group relative block aspect-[4/3] w-full overflow-hidden ${
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
                        <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-[0.18em] font-sans font-bold text-white">
                          {imgs.length} Photos
                        </span>
                      )}
                    </button>
                  ) : (
                    /* No photography — a quiet typographic panel, never stock. */
                    <div className="flex aspect-[4/3] w-full flex-col items-start justify-end border border-charcoal/10 bg-sand p-6">
                      <Eyebrow>{formatClassType(rt.classType)}</Eyebrow>
                      <p className="mt-2 font-display font-normal text-2xl leading-[1.1] tracking-[-0.01em] text-charcoal">
                        {rt.name}
                      </p>
                      <div className="mt-4 h-px w-10 bg-gold" />
                    </div>
                  )}

                  <div className="mt-4 flex flex-1 flex-col">
                    <p className="font-sans text-[10px] uppercase tracking-[0.24em] font-bold text-charcoal/45">
                      {formatClassType(rt.classType)}
                    </p>
                    <h3 className="mt-1.5 font-display font-normal text-xl md:text-[1.375rem] leading-[1.2] tracking-[-0.01em] text-charcoal">
                      {rt.name}
                    </h3>
                    <p className="mt-1.5 font-sans text-[11px] uppercase tracking-[0.12em] text-charcoal/50">
                      {meta.join(" · ")}
                    </p>

                    {rt.description && (
                      <p className="mt-2.5 font-sans text-[13px] leading-relaxed font-light text-charcoal/60 line-clamp-2 whitespace-pre-line">
                        {rt.description}
                      </p>
                    )}

                    <div className="mt-auto">
                      <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-charcoal/10 pt-3">
                        <p className="font-display text-[17px] text-charcoal">
                          {formatNpr(rt.pricePerNight)}
                          <span className="text-[10px] font-sans text-charcoal/40"> / night</span>
                        </p>
                        {!isOwnerView && (
                          <button
                            type="button"
                            onClick={() => onReserve(rt.id)}
                            className="group inline-flex items-center gap-1.5 uppercase tracking-[0.18em] text-[10px] font-bold text-charcoal transition-colors hover:text-gold"
                          >
                            Reserve
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
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
