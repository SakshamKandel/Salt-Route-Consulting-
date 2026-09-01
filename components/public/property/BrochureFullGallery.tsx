"use client"

// ── Brochure: full photograph gallery ───────────────────────────────────────
// Editorial masonry gallery: mixed-ratio columns rendered by PropertyGallery's
// masonry layout (its lightbox is shared). Framed by a quiet left-aligned
// heading on a tight white band after the Reviews hairline.

import { SectionHeading } from "@/components/public/property/primitives"
import { PropertyGallery } from "@/components/public/PropertyGallery"

export function BrochureFullGallery({
  images,
  title,
}: {
  images: { id: string; url: string; alt?: string | null }[]
  title: string
}) {
  if (!images || images.length === 0) return null

  return (
    <section id="full-gallery" className="py-20 md:py-28 bg-white">
      <div
        className="max-w-screen-xl mx-auto px-6 md:px-12"
        aria-label={`Photographs of ${title}`}
      >
        <div className="mb-12">
          <p className="text-[10px] uppercase tracking-[0.26em] text-gold font-semibold mb-2">
            Visual Odyssey
          </p>
          <h2 className="font-display uppercase tracking-[0.16em] text-navy text-2xl sm:text-3xl md:text-4xl font-normal">
            Sanctuary Photographs
          </h2>
        </div>
        <PropertyGallery images={images} layout="masonry" />
      </div>
    </section>
  )
}
