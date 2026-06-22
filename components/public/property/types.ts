import type { PropertyMediaLike } from "@/lib/property-media"

// ── Shared property-page types ──────────────────────────────────────────────
// Extracted from PropertyDetailClient so the brochure sub-components and the
// admin live preview (property-form-preview.tsx) all share ONE source of truth.
// The shape is kept byte-for-byte compatible with the original exported type.

export type PropertyDetailMedia = PropertyMediaLike & {
  id: string
  alt?: string | null
}

export type SectionData = {
  id: string
  title: string
  subtitle?: string | null
  body: string
  imageUrl?: string | null
}

export type RoomTypeData = {
  id: string
  name: string
  classType: string
  description?: string | null
  totalUnits: number
  pricePerNight: number
  maxGuests: number
  bedrooms: number
  bathrooms: number
  sizeSqm?: number | null
  bedType?: string | null
  amenities: string[]
  imageUrl?: string | null
  images?: string[] | null
}

export type ReviewData = {
  id: string
  rating: number
  comment: string
  createdAt: Date | string
  guest: { name: string | null; image: string | null }
  images?: { url: string }[]
}

export type PropertyDetail = {
  id: string
  title: string
  slug: string
  propertyType?: string | null
  description: string
  tagline?: string | null
  story?: string | null
  neighborhood?: string | null
  hostNote?: string | null
  location: string
  address?: string | null
  maxGuests: number
  bedrooms: number
  bathrooms: number
  pricePerNight: number
  totalUnits?: number
  checkInTime?: string | null
  checkOutTime?: string | null
  highlights: string[]
  amenities: string[]
  rules: string[]
  services?: string[]
  whatToExpect?: string[]
  highlightsTitle?: string | null
  amenitiesTitle?: string | null
  stayDetails?: { label: string; value: string }[] | null
  gettingHere?: { time: string; from: string; distance?: string }[] | null
  featureIcons?: Record<string, string> | null
  images: PropertyDetailMedia[]
  owner?: { name: string | null; image: string | null }
  roomTypes?: RoomTypeData[]
  sections?: SectionData[]
  reviews?: ReviewData[]
  _count?: { reviews: number }
}

/** State for the full-screen room-photo lightbox (owned by PropertyDetailClient). */
export type RoomGalleryState = { images: string[]; active: number; name: string }
