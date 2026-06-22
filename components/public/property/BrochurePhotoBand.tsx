"use client"

// ── BrochurePhotoBand ────────────────────────────────────────────────────────
// A full-bleed editorial photo band: a tight grid of brochure-style images with
// a quiet "View All Photos" hairline link when more remain than are shown.

import { ArrowUpRight } from "lucide-react"
import { SafeImage } from "@/components/public/property/primitives"

export function BrochurePhotoBand({
  images,
  max,
  onViewAll,
}: {
  images: { id: string; url: string; alt?: string | null }[]
  max?: number
  onViewAll: () => void
}) {
  if (!images || images.length === 0) return null

  const shown = images.slice(0, max ?? 3)
  const gridCols =
    shown.length >= 3 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"
  const hasMore = images.length > shown.length

  return (
    <section className="w-full py-16 md:py-28">
      <div className={`grid ${gridCols} gap-1`}>
        {shown.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-[4/5] md:aspect-[3/4] overflow-hidden"
          >
            <SafeImage
              src={image.url}
              alt={image.alt ?? "Property photograph"}
              fill
              sizes="(max-width:768px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center gap-2 uppercase tracking-[0.18em] sm:tracking-[0.3em] text-[11px] font-bold text-charcoal transition-colors hover:text-gold"
          >
            View All Photos
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  )
}
