"use client"

// ── BrochurePhotoBand ────────────────────────────────────────────────────────
// One short full-bleed "breath" photograph between the story spine and the
// rooms grid — a single image band (no composition), with a quiet View-All
// hairline link when more photographs remain. Static markup only (no motion),
// so it renders identically inside the admin live preview.

import { ArrowUpRight } from "lucide-react"
import { SafeImage } from "@/components/public/property/primitives"

type BandImage = { id: string; url: string; alt?: string | null }

export function BrochurePhotoBand({
  images,
  onViewAll,
}: {
  images: BandImage[]
  /** Kept in the API for call-site compatibility; the band shows one image. */
  max?: number
  onViewAll: () => void
}) {
  if (!images || images.length === 0) return null

  const image = images[0]
  const hasMore = images.length > 1

  return (
    <section className="w-full">
      <div className="relative h-[36vh] md:h-[48vh] w-full overflow-hidden">
        <SafeImage
          src={image.url}
          alt={image.alt ?? "Property photograph"}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {hasMore && (
        <div className="bg-sand px-5 sm:px-6 md:px-12">
          <div className="max-w-screen-xl mx-auto flex justify-end py-4">
            <button
              type="button"
              onClick={onViewAll}
              className="inline-flex items-center gap-2 uppercase tracking-[0.2em] text-[10px] font-semibold text-navy hover:text-gold transition-colors"
            >
              View Full Gallery ({images.length} Photographs)
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
