"use client"

// ── Brochure: full-bleed film / virtual-tour band ───────────────────────────
// An editorial, image-forward video band. A native autoplaying loop sits
// behind a non-interactive bottom-left caption so the video controls remain
// clickable. Renders nothing when no video source is supplied.

import { Eyebrow } from "@/components/public/property/primitives"

export function BrochureVideoBand({
  videoUrl,
  videoPoster,
  title,
}: {
  videoUrl?: string
  videoPoster?: string | null
  title: string
}) {
  if (!videoUrl) return null

  return (
    <section id="virtual-tour" className="relative w-full bg-charcoal">
      <div className="relative aspect-[4/5] md:aspect-[21/9]">
        <video
          src={videoUrl}
          poster={videoPoster ?? undefined}
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          controls
          controlsList="nodownload"
        />
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-8 md:p-12">
          <Eyebrow light>Film</Eyebrow>
          <h2 className="mt-4 font-display text-3xl uppercase tracking-wide text-white md:text-5xl">
            {title}
          </h2>
        </div>
      </div>
    </section>
  )
}
