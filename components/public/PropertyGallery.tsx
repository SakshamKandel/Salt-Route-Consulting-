"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Expand } from "lucide-react"

type GalleryImage = {
  id: string
  url: string
  alt?: string | null
}

export function PropertyGallery({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoom, setZoom] = useState(1)

  const total = images.length

  const goPrev = useCallback(() => {
    if (total === 0) return
    setActive((i) => (i - 1 + total) % total)
    setZoom(1)
  }, [total])

  const goNext = useCallback(() => {
    if (total === 0) return
    setActive((i) => (i + 1) % total)
    setZoom(1)
  }, [total])

  const openLightbox = (index: number) => {
    setActive(index)
    setZoom(1)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setZoom(1)
  }

  useEffect(() => {
    if (!lightboxOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "ArrowRight") goNext()
    }
    window.addEventListener("keydown", handler)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", handler)
      document.body.style.overflow = ""
    }
  }, [lightboxOpen, goPrev, goNext])

  if (total === 0) return null

  const current = images[active]

  return (
    <>
      {/* Inline carousel with prev/next + thumbnails */}
      <div className="relative w-full">
        <div
          className="relative w-full aspect-[16/9] bg-charcoal/5 overflow-hidden cursor-zoom-in shadow-2xl"
          onClick={() => openLightbox(active)}
        >
          <Image
            key={current.id}
            src={current.url}
            alt={current.alt || "Property image"}
            fill
            sizes="(max-width: 1024px) 100vw, 80vw"
            className="object-cover transition-transform duration-700 hover:scale-[1.02]"
            priority
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-charcoal font-bold flex items-center gap-2 pointer-events-none">
            <Expand className="w-3 h-3" />
            Tap to zoom
          </div>
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold pointer-events-none">
            {active + 1} / {total}
          </div>
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation()
                goPrev()
              }}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur hover:bg-white text-charcoal rounded-full p-3 shadow-lg transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation()
                goNext()
              }}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur hover:bg-white text-charcoal rounded-full p-3 shadow-lg transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div className="mt-6 flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-thin">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => {
                setActive(i)
                setZoom(1)
              }}
              className={`relative shrink-0 aspect-[4/3] w-28 md:w-32 overflow-hidden transition-all ${
                i === active ? "ring-2 ring-gold opacity-100" : "opacity-60 hover:opacity-100"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt || `Thumbnail ${i + 1}`}
                fill
                sizes="128px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Top toolbar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
            <div className="text-white text-xs uppercase tracking-[0.3em] font-sans">
              {active + 1} / {total}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setZoom((z) => Math.max(1, z - 0.5))
                }}
                disabled={zoom <= 1}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-full p-2.5 transition-all"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setZoom((z) => Math.min(4, z + 0.5))
                }}
                disabled={zoom >= 4}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-full p-2.5 transition-all"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <span className="text-white/60 text-xs font-mono w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  closeLightbox()
                }}
                className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition-all"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goPrev()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goNext()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            className="relative w-full h-full flex items-center justify-center p-8 md:p-16 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative transition-transform duration-200 ease-out"
              style={{
                transform: `scale(${zoom})`,
                cursor: zoom > 1 ? "grab" : "zoom-in",
              }}
              onClick={() => {
                if (zoom === 1) setZoom(2)
                else setZoom(1)
              }}
            >
              <Image
                src={current.url}
                alt={current.alt || "Property image"}
                width={1600}
                height={1200}
                className="max-w-[90vw] max-h-[80vh] w-auto h-auto object-contain select-none"
                draggable={false}
                priority
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
