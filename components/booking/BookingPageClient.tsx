"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import Image from "next/image"
import { BookingRequestForm, type BookingRoomType } from "./booking-request-form"
import { LuxuryLink } from "@/components/ui/luxury-link"
import { formatNpr } from "@/lib/currency"
import { Expand, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react"

interface Props {
  property: {
    id: string
    title: string
    slug: string
    location: string
    description: string
    bedrooms: number
    bathrooms: number
    maxGuests: number
    pricePerNight: number
    images: { url: string; alt?: string | null }[]
  }
  roomTypes: BookingRoomType[]
  heroImage: string | null
  currentUserPhone: string | null
  requestedRoomTypeId: string | null
  requestedCheckIn: string | null
  requestedCheckOut: string | null
  requestedGuests: number | null
  requestedPhone: string | null
  isAuthenticated: boolean
}

export function BookingPageClient({
  property,
  roomTypes,
  heroImage,
  currentUserPhone,
  requestedRoomTypeId,
  requestedCheckIn,
  requestedCheckOut,
  requestedGuests,
  requestedPhone,
  isAuthenticated,
}: Props) {
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | null>(requestedRoomTypeId)

  const selectedRoom = useMemo(
    () => roomTypes.find((rt) => rt.id === selectedRoomTypeId),
    [roomTypes, selectedRoomTypeId]
  )

  // Gallery for the currently selected room (or the property images as fallback).
  const galleryImages = useMemo(() => {
    const roomImgs = (selectedRoom?.images && selectedRoom.images.length > 0)
      ? selectedRoom.images
      : (selectedRoom?.imageUrl ? [selectedRoom.imageUrl] : [])
    if (roomImgs.length > 0) return roomImgs
    const propImgs = property.images.map((i) => i.url)
    if (propImgs.length > 0) return propImgs
    return heroImage ? [heroImage] : []
  }, [selectedRoom, property.images, heroImage])

  const [activeImage, setActiveImage] = useState(0)
  // Reset to the first photo whenever the selected room changes.
  useEffect(() => { setActiveImage(0) }, [selectedRoomTypeId])

  const displayImage = galleryImages[activeImage] || heroImage
  const displayLabel = selectedRoom?.name || property.title

  // Lightbox state
  const [lightbox, setLightbox] = useState<{ open: boolean; zoom: number }>({ open: false, zoom: 1 })

  const openLightbox = useCallback(() => {
    if (displayImage) setLightbox({ open: true, zoom: 1 })
  }, [displayImage])

  const closeLightbox = useCallback(() => {
    setLightbox({ open: false, zoom: 1 })
  }, [])

  const stepImage = useCallback((dir: 1 | -1) => {
    setActiveImage((i) => (galleryImages.length === 0 ? 0 : (i + dir + galleryImages.length) % galleryImages.length))
    setLightbox((s) => ({ ...s, zoom: 1 }))
  }, [galleryImages.length])

  // Keyboard controls
  useEffect(() => {
    if (!lightbox.open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowLeft") stepImage(-1)
      if (e.key === "ArrowRight") stepImage(1)
    }
    window.addEventListener("keydown", handler)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", handler)
      document.body.style.overflow = ""
    }
  }, [lightbox.open, closeLightbox, stepImage])

  return (
    <div className="min-h-screen bg-[#FBF9F4] pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-12">
          <LuxuryLink href={`/properties/${property.slug}`} className="inline-flex">
            ← BACK TO PROPERTY
          </LuxuryLink>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-24 items-start">
          {/* Left Column */}
          <div className="space-y-12">
            {/* Image with zoom + gallery */}
            <div className="space-y-3">
              <div className="group relative">
                {displayImage && (
                  <div className="relative aspect-[4/3] w-full overflow-hidden border border-charcoal/10">
                    <Image
                      src={displayImage}
                      alt={displayLabel}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      unoptimized={displayImage.includes("placehold.co")}
                      className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={openLightbox}
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold flex items-center gap-2 hover:bg-white transition-colors"
                    >
                      <Expand className="w-3 h-3" /> Zoom
                    </button>
                    {galleryImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => stepImage(-1)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-charcoal flex items-center justify-center shadow"
                          aria-label="Previous photo"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => stepImage(1)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-charcoal flex items-center justify-center shadow"
                          aria-label="Next photo"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-4 left-4 bg-black/55 backdrop-blur-sm text-white text-[10px] uppercase tracking-[0.2em] font-bold px-3 py-1.5">
                          {activeImage + 1} / {galleryImages.length}
                        </div>
                      </>
                    )}
                  </div>
                )}
                {!displayImage && (
                  <div className="aspect-[4/3] w-full bg-charcoal/5 border border-charcoal/10 flex items-center justify-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-charcoal/30">No Image</p>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {galleryImages.map((url, i) => (
                    <button
                      key={url + i}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={`relative h-16 w-24 shrink-0 overflow-hidden border-2 transition-colors ${i === activeImage ? "border-charcoal" : "border-transparent opacity-60 hover:opacity-100"}`}
                    >
                      <Image src={url} alt="" fill sizes="96px" className="object-cover" unoptimized={url.includes("placehold.co")} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Room indicator */}
            {selectedRoom && (
              <div className="flex items-center gap-3">
                <span className="text-[9px] uppercase tracking-[0.25em] text-gold/80 font-sans font-bold">
                  Selected Room
                </span>
                <span className="w-6 h-[1px] bg-gold/40" />
                <span className="font-display text-sm text-charcoal uppercase tracking-wide">
                  {selectedRoom.name}
                </span>
                <span className="text-charcoal/40 font-sans text-xs">
                  {formatNpr(selectedRoom.pricePerNight)}/night
                </span>
              </div>
            )}

            <div className="space-y-6">
              <h1 className="font-display text-4xl md:text-5xl text-charcoal">{property.title}</h1>
              <p className="text-[10px] tracking-[0.2em] uppercase font-sans text-charcoal/50">
                {property.location}
              </p>

              <div className="w-12 h-[1px] bg-charcoal/20" />

              <p className="text-charcoal/70 text-sm leading-loose font-sans max-w-2xl">
                {property.description}
              </p>

              <div className="flex flex-wrap gap-8 pt-6">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-charcoal/40 mb-1">Bedrooms</span>
                  <span className="font-display text-xl text-charcoal">{property.bedrooms}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-charcoal/40 mb-1">Bathrooms</span>
                  <span className="font-display text-xl text-charcoal">{property.bathrooms}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-charcoal/40 mb-1">Capacity</span>
                  <span className="font-display text-xl text-charcoal">Up to {property.maxGuests}</span>
                </div>
              </div>
            </div>

            <div className="border border-charcoal/10 p-8 space-y-4 bg-white/50">
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-sans font-semibold text-charcoal/60">
                Concierge Process
              </h3>
              <ul className="space-y-3 font-sans text-xs tracking-wide text-charcoal/60 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-charcoal/30 font-display italic">01</span>
                  <span>Your request is reviewed by our dedicated concierge team.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-charcoal/30 font-display italic">02</span>
                  <span>We will verify property availability within 24 hours.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-charcoal/30 font-display italic">03</span>
                  <span>You will receive an exclusive confirmation dossier via email once approved.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-charcoal/30 font-display italic">04</span>
                  <span>No charges are applied until your itinerary is finalized and confirmed.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="w-full lg:w-[480px] sticky top-32">
            <BookingRequestForm
              propertyId={property.id}
              pricePerNight={Number(property.pricePerNight)}
              maxGuests={property.maxGuests}
              roomTypes={roomTypes}
              initialRoomTypeId={requestedRoomTypeId}
              initialCheckIn={requestedCheckIn}
              initialCheckOut={requestedCheckOut}
              initialGuests={Number.isFinite(requestedGuests ?? NaN) && requestedGuests ? requestedGuests : undefined}
              isAuthenticated={isAuthenticated}
              initialPhone={currentUserPhone || requestedPhone}
              onRoomTypeChange={setSelectedRoomTypeId}
            />
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox.open && displayImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Toolbar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
            <div className="text-white text-xs uppercase tracking-[0.3em] font-sans">
              {selectedRoom?.name || property.title}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightbox((s) => ({ ...s, zoom: Math.max(1, s.zoom - 0.5) }))
                }}
                disabled={lightbox.zoom <= 1}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-full p-2.5 transition-all"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightbox((s) => ({ ...s, zoom: Math.min(4, s.zoom + 0.5) }))
                }}
                disabled={lightbox.zoom >= 4}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-full p-2.5 transition-all"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <span className="text-white/60 text-xs font-mono w-12 text-center">
                {Math.round(lightbox.zoom * 100)}%
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

          <div
            className="relative w-full h-full flex items-center justify-center p-8 md:p-16 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative transition-transform duration-200 ease-out"
              style={{
                transform: `scale(${lightbox.zoom})`,
                cursor: lightbox.zoom > 1 ? "grab" : "zoom-in",
              }}
              onClick={() => {
                setLightbox((s) => ({ ...s, zoom: s.zoom === 1 ? 2 : 1 }))
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayImage}
                alt={displayLabel}
                className="max-w-[90vw] max-h-[80vh] w-auto h-auto object-contain select-none"
                draggable={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
