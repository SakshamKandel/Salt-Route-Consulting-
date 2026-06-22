"use client"

// ── Brochure: Rooms & Suites ────────────────────────────────────────────────
// Editorial, image-forward accommodation listing. Each room is a full-width
// alternating image/text band — no cards, no carousel, no borders.

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
    <section className="py-16 md:py-28 bg-white">
      <SectionHeading eyebrow="Accommodation" title="Rooms & Suites" />

      <div className="space-y-16 md:space-y-28">
        {roomTypes.map((rt, index) => {
          const imgs = roomImagesOf(rt)
          const cover = imgs[0] || ""
          const openable = imgs.length > 0 && !previewMode

          const meta: string[] = [
            `${rt.maxGuests} Guests`,
            `${rt.bedrooms} Beds`,
            `${rt.bathrooms} Baths`,
          ]
          if (rt.sizeSqm) meta.push(`${rt.sizeSqm} sqm`)

          const imageEven = index % 2 === 0

          return (
            <div
              key={rt.id}
              className="max-w-screen-xl mx-auto px-5 sm:px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center"
            >
              <FadeUp
                className={`lg:col-span-7 ${imageEven ? "lg:order-1" : "lg:order-2"}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (openable) onOpenRoomGallery({ images: imgs, active: 0, name: rt.name })
                  }}
                  className={`relative aspect-[16/11] overflow-hidden w-full ${
                    openable ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <SafeImage
                    src={cover}
                    alt={rt.name}
                    fill
                    sizes="(max-width:1024px) 100vw, 58vw"
                    className="object-cover"
                  />
                  {imgs.length > 1 && (
                    <span className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.3em] font-sans font-bold text-white">
                      {imgs.length} Photos
                    </span>
                  )}
                </button>
              </FadeUp>

              <FadeUp
                className={`lg:col-span-5 ${imageEven ? "lg:order-2" : "lg:order-1"}`}
              >
                <Eyebrow>{formatClassType(rt.classType)}</Eyebrow>
                <h3 className="font-display text-2xl sm:text-3xl md:text-4xl uppercase tracking-wide text-charcoal mt-2">
                  {rt.name}
                </h3>

                <p className="font-display text-xl text-charcoal mt-4">
                  {formatNpr(rt.pricePerNight)}
                  <span className="text-[10px] font-sans text-charcoal/40"> / night</span>
                </p>

                <p className="font-sans text-[12px] uppercase tracking-[0.1em] sm:tracking-[0.15em] text-charcoal/50 mt-3">
                  {meta.join(" · ")}
                </p>

                {rt.description && (
                  <p className="font-sans text-[15px] leading-loose font-light text-charcoal/60 mt-6 whitespace-pre-line">
                    {rt.description}
                  </p>
                )}

                {!isOwnerView && (
                  <button
                    type="button"
                    onClick={() => onReserve(rt.id)}
                    className="group inline-flex items-center gap-2 mt-8 uppercase tracking-[0.18em] sm:tracking-[0.3em] text-[11px] font-bold text-charcoal"
                  >
                    Reserve
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                )}
              </FadeUp>
            </div>
          )
        })}
      </div>
    </section>
  )
}
