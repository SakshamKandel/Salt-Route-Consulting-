"use client"

// ── Property detail page (brochure layout) ──────────────────────────────────
// Thin orchestrator: owns ALL shared interactive state (booking inputs,
// goToBooking navigation, room-photo lightbox) and the PreviewContext, then
// composes the presentational Brochure* blocks top-to-bottom. The same
// component renders the public route AND the admin live preview (previewMode),
// so the brochure look stays in lockstep with what the admin edits.

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import type { PropertyDetail, RoomGalleryState } from "./property/types"
import { PreviewContext, FALLBACK_IMAGE } from "./property/primitives"
import {
  getImageMedia,
  getBannerImageUrl,
  isVideoUrl,
  getOptimizedVideoUrl,
  getVideoPosterUrl,
} from "@/lib/property-media"
import { toDateOnlyString } from "@/lib/booking-dates"

import { BrochureHero } from "./property/BrochureHero"
import { BrochureBookingBar } from "./property/BrochureBookingBar"
import { BrochureStory } from "./property/BrochureStory"
import { BrochureSections } from "./property/BrochureSections"
import { BrochurePhotoBand } from "./property/BrochurePhotoBand"
import { BrochureRooms } from "./property/BrochureRooms"
import { BrochureFeatureStrip } from "./property/BrochureFeatureStrip"
import { BrochureVideoBand } from "./property/BrochureVideoBand"
import { BrochureFacilities } from "./property/BrochureFacilities"
import { BrochureStayDetails } from "./property/BrochureStayDetails"
import { BrochureLocation } from "./property/BrochureLocation"
import { BrochureReviews } from "./property/BrochureReviews"
import { BrochureReservation } from "./property/BrochureReservation"
import { BrochureFullGallery } from "./property/BrochureFullGallery"
import { RoomGalleryLightbox } from "./property/RoomGalleryLightbox"

// Re-export so existing importers (page.tsx, property-form-preview.tsx) keep working.
export type { PropertyDetail } from "./property/types"

export default function PropertyDetailClient({
  property,
  wishlistItem,
  isOwnerView = false,
  isAuthenticated = false,
  eligibleBookingId = null,
  previewMode = false,
  initialPhone = null,
}: {
  property: PropertyDetail
  wishlistItem: boolean
  isOwnerView?: boolean
  isAuthenticated?: boolean
  eligibleBookingId?: string | null
  previewMode?: boolean
  initialPhone?: string | null
}) {
  const router = useRouter()

  // ── Derived media ──
  const imageMedia = getImageMedia(property.images)
  const heroImage = getBannerImageUrl(property.images) || FALLBACK_IMAGE
  const videoMedia = property.images.find((item) => isVideoUrl(item.url))
  const videoUrl = videoMedia ? getOptimizedVideoUrl(videoMedia.url) : undefined
  const videoPoster = videoMedia ? getVideoPosterUrl(videoMedia.url) : null
  const galleryImages = imageMedia.map((img) => ({ id: img.id, url: img.url, alt: img.alt }))

  // ── Derived content ──
  const roomTypes = property.roomTypes ?? []
  const sections = property.sections ?? []
  const services = property.services ?? []
  const reviews = property.reviews ?? []
  const whatToExpect = property.whatToExpect ?? []
  const stayDetailRows = property.stayDetails ?? []
  const gettingHere = property.gettingHere ?? []

  const startingPrice =
    roomTypes.length > 0 ? Math.min(...roomTypes.map((rt) => rt.pricePerNight)) : property.pricePerNight
  const totalUnitsDisplay =
    roomTypes.length > 0
      ? roomTypes.reduce((sum, rt) => sum + rt.totalUnits, 0)
      : Math.max(1, property.totalUnits ?? 1)
  const reviewCount = property._count?.reviews ?? reviews.length
  const avgRating =
    reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "5.0"

  // ── Shared booking state (hero bar + reservation form) ──
  const today = useMemo(() => toDateOnlyString(new Date()), [])
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(2)
  const [roomTypeId, setRoomTypeId] = useState(roomTypes[0]?.id ?? "")
  const [resPhone, setResPhone] = useState(initialPhone ?? "")
  const [roomGallery, setRoomGallery] = useState<RoomGalleryState | null>(null)

  function goToBooking() {
    if (previewMode) return
    const q = new URLSearchParams({ property: property.id })
    if (roomTypeId) q.set("room", roomTypeId)
    if (checkIn) q.set("checkIn", checkIn)
    if (checkOut) q.set("checkOut", checkOut)
    if (guests > 0) q.set("guests", String(guests))
    if (resPhone.trim()) q.set("phone", resPhone.trim())
    router.push(`/booking-request?${q.toString()}`)
  }

  const scrollTo = (id: string) => {
    if (previewMode) return
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  const handleReserve = (roomId: string) => {
    setRoomTypeId(roomId)
    scrollTo("reservation")
  }

  const reservationImage = galleryImages[2]?.url || galleryImages[0]?.url || heroImage

  return (
    <PreviewContext.Provider value={previewMode}>
      <div className={`bg-background text-charcoal ${previewMode ? "" : "min-h-screen"}`}>
        <BrochureHero
          heroImage={heroImage}
          title={property.title}
          propertyType={property.propertyType}
          tagline={property.tagline}
          location={property.location}
          propertyId={property.id}
          wishlistItem={wishlistItem}
          hasVideo={!!videoUrl}
          isOwnerView={isOwnerView}
          previewMode={previewMode}
          ownerHref={`/owner/properties/${property.id}`}
          onWatchVideo={() => scrollTo("virtual-tour")}
        />

        {!isOwnerView && (
          <BrochureBookingBar
            today={today}
            checkIn={checkIn}
            setCheckIn={setCheckIn}
            checkOut={checkOut}
            setCheckOut={setCheckOut}
            guests={guests}
            setGuests={setGuests}
            maxGuests={property.maxGuests}
            onSearch={goToBooking}
          />
        )}

        <BrochureStory
          story={property.story}
          description={property.description}
          accentImage={galleryImages[0]?.url ?? null}
        />

        {/* The admin-editable Story Sections — the spine of the brochure. */}
        <BrochureSections sections={sections} />

        <BrochurePhotoBand images={galleryImages} max={3} onViewAll={() => scrollTo("full-gallery")} />

        <BrochureRooms
          roomTypes={roomTypes}
          isOwnerView={isOwnerView}
          previewMode={previewMode}
          onOpenRoomGallery={setRoomGallery}
          onReserve={handleReserve}
        />

        <BrochureFeatureStrip
          whatToExpect={whatToExpect}
          highlights={property.highlights}
          highlightsTitle={property.highlightsTitle}
          featureIcons={property.featureIcons}
        />

        <BrochureVideoBand videoUrl={videoUrl} videoPoster={videoPoster} title={property.title} />

        <BrochureFacilities
          services={services}
          amenities={property.amenities}
          amenitiesTitle={property.amenitiesTitle}
          featureIcons={property.featureIcons}
        />

        <BrochureStayDetails
          stayDetails={stayDetailRows}
          bedrooms={property.bedrooms}
          bathrooms={property.bathrooms}
          maxGuests={property.maxGuests}
          totalUnitsDisplay={totalUnitsDisplay}
          checkInTime={property.checkInTime}
          checkOutTime={property.checkOutTime}
          rules={property.rules}
        />

        <BrochureLocation
          location={property.location}
          address={property.address}
          neighborhood={property.neighborhood}
          gettingHere={gettingHere}
          hostNote={property.hostNote}
          owner={property.owner}
        />

        <BrochureReviews
          reviews={reviews}
          reviewCount={reviewCount}
          avgRating={avgRating}
          slug={property.slug}
          isOwnerView={isOwnerView}
          isAuthenticated={isAuthenticated}
          eligibleBookingId={eligibleBookingId}
        />

        <BrochureFullGallery images={galleryImages} title={property.title} />

        {!isOwnerView && (
          <BrochureReservation
            image={reservationImage}
            startingPrice={startingPrice}
            roomTypes={roomTypes}
            maxGuests={property.maxGuests}
            today={today}
            resPhone={resPhone}
            setResPhone={setResPhone}
            guests={guests}
            setGuests={setGuests}
            checkIn={checkIn}
            setCheckIn={setCheckIn}
            checkOut={checkOut}
            setCheckOut={setCheckOut}
            roomTypeId={roomTypeId}
            setRoomTypeId={setRoomTypeId}
            onSubmit={goToBooking}
            previewMode={previewMode}
          />
        )}

        <RoomGalleryLightbox roomGallery={roomGallery} setRoomGallery={setRoomGallery} />
      </div>
    </PreviewContext.Provider>
  )
}
