"use client"

// ── Brochure: full photograph gallery ───────────────────────────────────────
// Editorial gallery band. PropertyGallery owns its own carousel + lightbox; we
// only frame it with a brochure heading and a quiet white section.

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
      <SectionHeading eyebrow="Gallery" title="Photographs" />
      <div
        className="max-w-screen-xl mx-auto px-6 md:px-12"
        aria-label={`Photographs of ${title}`}
      >
        <PropertyGallery images={images} />
      </div>
    </section>
  )
}
