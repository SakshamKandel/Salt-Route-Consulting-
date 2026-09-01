"use client"

// ── Brochure: full-bleed film / virtual-tour band ───────────────────────────
// Lazy editorial video band. The poster renders immediately (next/image); the
// video element only mounts — and its bytes only download — once the band is
// about a viewport away (IntersectionObserver, fired once). Reduced-motion and
// Save-Data get the poster with tap-to-play controls instead of autoplay. The
// admin live preview renders the poster only, with no <video> element at all.

import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { SafeImage, usePreview } from "@/components/public/property/primitives"

export function BrochureVideoBand({
  videoUrl,
  videoPoster,
  title,
}: {
  videoUrl?: string
  videoPoster?: string | null
  title: string
}) {
  const preview = usePreview()
  const reduce = useReducedMotion()
  const [saveData, setSaveData] = useState(false)
  const [near, setNear] = useState(false)
  const sectionRef = useRef<HTMLElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Respect the Save-Data hint the same way as reduced motion.
  useEffect(() => {
    if (preview) return
    const frame = window.requestAnimationFrame(() => {
      const conn = (navigator as unknown as { connection?: { saveData?: boolean } }).connection
      if (conn?.saveData) setSaveData(true)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [preview])

  const noAutoplay = !!reduce || saveData

  // Attach the source only when the band is ~1 viewport away (fired once).
  useEffect(() => {
    if (preview || noAutoplay || near || !videoUrl) return
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: "100% 0px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [preview, noAutoplay, near, videoUrl])

  // Start the quiet loop once the source is attached (iOS: muted+playsInline).
  useEffect(() => {
    if (near && videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [near])

  if (!videoUrl) return null

  const showVideo = !preview && (near || noAutoplay)

  return (
    <section id="virtual-tour" ref={sectionRef} className="relative w-full bg-charcoal">
      <div className="relative aspect-video md:aspect-[21/9]">
        {videoPoster ? (
          <SafeImage
            src={videoPoster}
            alt={`${title} film`}
            fill
            sizes="100vw"
            className="object-cover"
          />
        ) : null}

        {showVideo && (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={videoPoster ?? undefined}
            preload="none"
            className="absolute inset-0 h-full w-full object-cover"
            loop
            muted
            playsInline
            controls
            controlsList="nodownload"
          />
        )}

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-8 md:p-12 bg-gradient-to-t from-black/70 via-transparent to-transparent">
          <p className="text-[10px] uppercase tracking-[0.26em] text-gold font-semibold mb-2">
            Sanctuary Film
          </p>
          <h2 className="font-display uppercase tracking-[0.16em] text-2xl sm:text-3xl md:text-5xl leading-[1.1] text-cream">
            {title}
          </h2>
        </div>
      </div>
    </section>
  )
}
