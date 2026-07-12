import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { formatNpr } from "@/lib/currency"
import { getPrimaryImageUrl } from "@/lib/property-media"
import { Bath, BedDouble, Check, ChevronRight, Edit3, ImageOff, MapPin, Star, Users } from "lucide-react"

const PROPERTY_STATUS_CHIP: Record<string, string> = {
  ACTIVE:   "bg-emerald-50 text-emerald-600 border-emerald-200/60",
  DRAFT:    "bg-amber-50 text-amber-600 border-amber-200/60",
  INACTIVE: "bg-[#1B3A5C]/5 text-[#1B3A5C]/50 border-[#1B3A5C]/10",
}

export default async function OwnerPropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params

  const [property, stats] = await Promise.all([
    prisma.property.findUnique({
      where: { id, ownerId: session.user.id },
      include: {
        images: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }] },
        reviews: {
          where: { status: "PUBLISHED" },
          include: { guest: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 4,
        },
        _count: { select: { reviews: true, bookings: true } },
      },
    }),
    prisma.booking.aggregate({
      where: {
        propertyId: id,
        property: { ownerId: session.user.id },
        status: { in: ["CONFIRMED", "COMPLETED", "CHECKED_IN"] },
      },
      _sum: { totalPrice: true },
      _count: { id: true },
    }),
  ])

  if (!property) return notFound()

  const heroImage = getPrimaryImageUrl(property.images)
  const galleryImages = property.images.slice(0, 5)

  const avgRating =
    property.reviews.length > 0
      ? (
          property.reviews.reduce((s, r) => s + r.rating, 0) /
          property.reviews.length
        ).toFixed(1)
      : null

  const statusChip = PROPERTY_STATUS_CHIP[property.status] ?? PROPERTY_STATUS_CHIP.INACTIVE

  const performanceMetrics = [
    { label: "Total bookings",    value: stats._count.id },
    { label: "Published reviews", value: property._count.reviews },
    { label: "Guest rating",      value: avgRating ? `${avgRating} / 5` : "—" },
    { label: "Lifetime revenue",  value: formatNpr(stats._sum.totalPrice) },
  ]

  return (
    <div className="pb-12 space-y-8">

      {/* ── BREADCRUMB ── */}
      <div className="flex items-center gap-1.5 text-[11px] font-medium">
        <Link href="/owner/properties" className="text-[#1B3A5C]/40 hover:text-[#1B3A5C] transition-colors">
          Properties
        </Link>
        <ChevronRight className="h-3 w-3 text-[#1B3A5C]/25" />
        <span className="text-[#1B3A5C]/70 truncate">{property.title}</span>
      </div>

      {/* ── HEADER ROW ── */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] text-[#C9A96E] uppercase tracking-[0.2em] font-medium mb-1">
            <MapPin className="h-3 w-3" />
            {property.location}
          </p>
          <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">
            {property.title}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-[11px] text-[#1B3A5C]/45">
            <span className="inline-flex items-center gap-1.5">
              <BedDouble className="h-3.5 w-3.5 text-[#1B3A5C]/30" />
              {property.bedrooms} bedroom{property.bedrooms !== 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Bath className="h-3.5 w-3.5 text-[#1B3A5C]/30" />
              {property.bathrooms} bathroom{property.bathrooms !== 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-[#1B3A5C]/30" />
              {property.maxGuests} guests
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-semibold border uppercase tracking-[0.15em] ${statusChip}`}>
            {property.status}
          </span>
          <Link
            href={`/owner/request-edit?propertyId=${property.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B3A5C] text-[#FFFAF3] rounded-lg text-[12px] font-medium hover:bg-[#2A4F7A] transition-colors"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Request update
          </Link>
        </div>
      </div>

      {/* ── IMAGE GALLERY ── */}
      {galleryImages.length > 0 ? (
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[320px] md:h-[420px] rounded-2xl overflow-hidden">
          {/* Hero image */}
          <div className="col-span-4 md:col-span-2 row-span-2 relative overflow-hidden bg-[#1B3A5C]/5">
            {heroImage && (
              <Image
                src={heroImage}
                alt={property.title}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                priority
              />
            )}
          </div>

          {/* Secondary images */}
          {galleryImages.slice(1, 5).map((img, i) => (
            <div
              key={img.id}
              className={`hidden md:block relative overflow-hidden bg-[#1B3A5C]/5 ${
                i >= 2 ? "row-start-2" : ""
              }`}
            >
              <Image
                src={img.url}
                alt={`${property.title} ${i + 2}`}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          ))}

          {/* Placeholder tiles if fewer than 5 images */}
          {Array.from({ length: Math.max(0, 4 - (galleryImages.length - 1)) }).map(
            (_, i) => (
              <div
                key={`ph-${i}`}
                className="hidden md:flex items-center justify-center bg-[#FFFAF3] border border-[#1B3A5C]/8"
              >
                <ImageOff className="h-4 w-4 text-[#1B3A5C]/10" />
              </div>
            )
          )}
        </div>
      ) : (
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl h-56 flex flex-col items-center justify-center">
          <ImageOff className="h-6 w-6 text-[#1B3A5C]/15 mb-3" />
          <p className="text-[13px] text-[#1B3A5C]/35 font-medium">No images uploaded yet</p>
        </div>
      )}

      {/* ── PERFORMANCE METRICS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {performanceMetrics.map((m) => (
          <div key={m.label} className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-4 sm:p-5">
            <p className="text-xl sm:text-2xl font-semibold text-[#1B3A5C] leading-tight tabular-nums break-words">{m.value}</p>
            <p className="text-[10px] text-[#1B3A5C]/40 mt-1 uppercase tracking-[0.2em] font-medium">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-start">

        {/* ── DESCRIPTION + HIGHLIGHTS ── */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-5">

          {/* Description */}
          <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#1B3A5C]/5">
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#1B3A5C]/45 font-medium">
                Property Story
              </h2>
            </div>
            <div className="px-5 py-4">
              <p className="text-[13px] text-[#1B3A5C]/60 leading-relaxed">
                {property.description}
              </p>
            </div>
          </div>

          {/* Highlights */}
          {property.highlights.length > 0 && (
            <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#1B3A5C]/5">
                <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#1B3A5C]/45 font-medium">
                  Highlights
                </h2>
              </div>
              <ul className="px-5 py-4 space-y-2.5">
                {property.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="h-3.5 w-3.5 text-[#C9A96E] mt-0.5 shrink-0" />
                    <span className="text-[13px] text-[#1B3A5C]/60 leading-relaxed">
                      {h}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── AMENITIES ── */}
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#1B3A5C]/5">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#1B3A5C]/45 font-medium">
              Amenities
            </h2>
          </div>
          {property.amenities.length > 0 ? (
            <ul className="px-5 py-4 space-y-2.5">
              {property.amenities.map((a, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[12px] text-[#1B3A5C]/60">
                  <span className="w-1 h-1 rounded-full bg-[#C9A96E]/60 shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-4 text-[12px] text-[#1B3A5C]/35">No amenities listed yet.</p>
          )}
        </div>
      </div>

      {/* ── GUEST REVIEWS ── */}
      {property.reviews.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-[15px] font-semibold text-[#1B3A5C]">Guest reviews</h2>
            <span className="text-[11px] text-[#1B3A5C]/35 tabular-nums">
              ({property._count.reviews} total)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {property.reviews.map((review) => (
              <div
                key={review.id}
                className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[12px] font-semibold text-[#1B3A5C] truncate">
                    {review.guest.name ?? "Anonymous Guest"}
                  </p>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < review.rating
                            ? "text-[#C9A96E] fill-[#C9A96E]"
                            : "text-[#1B3A5C]/15"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[12px] text-[#1B3A5C]/55 leading-relaxed">
                  &ldquo;{review.comment}&rdquo;
                </p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#1B3A5C]/35 font-medium">
                  {new Date(review.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FOOTER CTA ── */}
      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4">
        <div>
          <p className="text-[13px] font-semibold text-[#1B3A5C]">Need to update this property?</p>
          <p className="text-[12px] text-[#1B3A5C]/45 mt-0.5">
            Send calendar, feature, amenity, pricing, or photo updates to the Salt Route team.
          </p>
        </div>
        <Link
          href={`/owner/request-edit?propertyId=${property.id}`}
          className="shrink-0 self-start sm:self-auto inline-flex items-center px-4 py-2 bg-[#1B3A5C] text-[#FFFAF3] rounded-lg text-[12px] font-medium hover:bg-[#2A4F7A] transition-colors"
        >
          Request update
        </Link>
      </div>
    </div>
  )
}
