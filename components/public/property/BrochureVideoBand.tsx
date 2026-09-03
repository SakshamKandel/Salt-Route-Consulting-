"use client"

import { useEffect, useRef } from "react"
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
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (preview || !videoRef.current) return
    const video = videoRef.current
    video.muted = true
    video.defaultMuted = true
    void video.play().catch(() => {
      // The poster remains visible if a browser still blocks muted autoplay.
    })
  }, [preview])

  if (!videoUrl) return null

  return (
    <section
      id="film"
      aria-label={`${title} film`}
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-black"
    >
      <div className="relative h-[58svh] min-h-[420px] max-h-[820px] w-full sm:h-[68svh] lg:h-[72svh]">
        {videoPoster ? (
          <SafeImage
            src={videoPoster}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        ) : null}

        {!preview ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={videoPoster ?? undefined}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            disablePictureInPicture
            controlsList="nodownload noplaybackrate noremoteplayback"
            tabIndex={-1}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[center_48%]"
            onCanPlay={(event) => void event.currentTarget.play().catch(() => {})}
          />
        ) : null}

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,15,25,.2)_0%,transparent_36%,rgba(5,15,25,.72)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-black/90 sm:h-3" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2 bg-black/90 sm:h-3" />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 mx-auto max-w-[1320px] px-6 pb-12 text-cream sm:px-10 sm:pb-16 lg:px-14 lg:pb-20">
          <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-gold">A film from the property</p>
          <h2 className="mt-3 max-w-3xl font-display text-[clamp(2rem,4vw,4.5rem)] leading-[1.02]">
            {title}
          </h2>
        </div>
      </div>
    </section>
  )
}
