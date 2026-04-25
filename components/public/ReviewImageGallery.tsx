"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"

type GalleryImage = {
  url: string
}

export function ReviewImageGallery({ images }: { images: GalleryImage[] }) {
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

  return (
    <>
      <div className="flex flex-wrap gap-4 mt-8">
        {images.map((img, i) => (
          <div 
            key={i} 
            className="group relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 cursor-zoom-in overflow-hidden border border-charcoal/5 shadow-sm hover:shadow-md transition-all duration-500"
            onClick={() => openLightbox(i)}
          >
            <Image 
              src={img.url} 
              alt={`Review image ${i + 1}`} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <Maximize2 className="w-5 h-5 text-white stroke-[1.5]" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center transition-all duration-500"
          onClick={closeLightbox}
        >
          {/* Top toolbar */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
            <div className="text-white/40 text-[10px] uppercase tracking-[0.4em] font-sans">
              Image {active + 1} of {total}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setZoom((z) => Math.max(1, z - 0.5))
                }}
                disabled={zoom <= 1}
                className="bg-white/5 hover:bg-white/10 disabled:opacity-20 text-white rounded-full p-3 transition-all border border-white/5"
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
                className="bg-white/5 hover:bg-white/10 disabled:opacity-20 text-white rounded-full p-3 transition-all border border-white/5"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  closeLightbox()
                }}
                className="bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all ml-4 border border-white/10"
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
                className="absolute left-6 top-1/2 -translate-y-1/2 z-10 bg-white/5 hover:bg-white/10 text-white rounded-full p-4 transition-all border border-white/5"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goNext()
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-10 bg-white/5 hover:bg-white/10 text-white rounded-full p-4 transition-all border border-white/5"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            className="relative w-full h-full flex items-center justify-center p-6 md:p-12 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative transition-transform duration-300 ease-out"
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
                src={images[active].url}
                alt={`Review image large ${active + 1}`}
                width={1920}
                height={1080}
                className="max-w-[90vw] max-h-[80vh] w-auto h-auto object-contain select-none shadow-2xl"
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
