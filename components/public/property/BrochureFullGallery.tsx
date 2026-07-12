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
    <section id="full-gallery" className="py-10 md:py-16 bg-white">
      <div
        className="max-w-screen-xl mx-auto px-6 md:px-12"
        aria-label={`Photographs of ${title}`}
      >
        <SectionHeading
          eyebrow="Gallery"
          title="Photographs"
          align="left"
          variant="editorial"
          className="mb-8"
        />
        <PropertyGallery images={images} layout="masonry" />
      </div>
    </section>
  )
}
