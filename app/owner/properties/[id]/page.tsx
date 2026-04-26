import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { formatNpr } from "@/lib/currency"
import { getPrimaryImageUrl } from "@/lib/property-media"

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

  const performanceMetrics = [
    { label: "Total Bookings", value: stats._count.id },
    { label: "Published Reviews", value: property._count.reviews },
    { label: "Guest Rating", value: avgRating ? `${avgRating} / 5` : "-" },
    {
      label: "Lifetime Revenue",
      value: formatNpr(stats._sum.totalPrice),
    },
  ]

  return (
    <div className="space-y-14">

      {/* ─── BREADCRUMB ─── */}
      <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.35em]">
        <Link href="/owner/properties" className="text-sand/30 hover:text-gold transition-colors duration-500">
              Properties
        </Link>
        <span className="text-sand/20">·</span>
        <span className="text-sand/50">{property.title}</span>
      </div>

      {/* ─── IMAGE GALLERY ─── */}
      {galleryImages.length > 0 ? (
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px] md:h-[520px]">
          {/* Hero image - spans 2 cols and 2 rows */}
          <div className="col-span-4 md:col-span-2 row-span-2 relative overflow-hidden bg-[#163350]">
            {heroImage && (
              <Image
                src={heroImage}
                alt={property.title}
                fill
                className="object-cover transition-transform duration-[2s] hover:scale-105"
                priority
              />
            )}
            {/* Status badge */}
            <div className="absolute top-5 left-5">
              <span
                className="px-4 py-2 text-[8.5px] uppercase tracking-[0.3em] font-medium"
                style={{
                  background: "rgba(8,15,24,0.75)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(201,169,110,0.25)",
                  color: "#C9A96E",
                }}
              >
                {property.status}
              </span>
            </div>
          </div>

          {/* Secondary images */}
          {galleryImages.slice(1, 5).map((img, i) => (
            <div
              key={img.id}
              className={`hidden md:block relative overflow-hidden bg-[#163350] ${
                i >= 2 ? "row-start-2" : ""
              }`}
            >
              <Image
                src={img.url}
                alt={`${property.title} ${i + 2}`}
                fill
                className="object-cover transition-transform duration-[2s] hover:scale-105"
              />
            </div>
          ))}

          {/* Placeholder tiles if fewer than 5 images */}
          {Array.from({ length: Math.max(0, 4 - (galleryImages.length - 1)) }).map(
            (_, i) => (
              <div
                key={`ph-${i}`}
                className="hidden md:block bg-[#163350]"
                style={{ border: "1px solid rgba(201,169,110,0.06)" }}
              />
            )
          )}
        </div>
      ) : (
        <div
          className="h-64 flex items-center justify-center"
          style={{ border: "1px solid rgba(201,169,110,0.08)", background: "#163350" }}
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-sand/25">
            No images uploaded
          </p>
        </div>
      )}

      {/* ─── HEADER ROW ─── */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="w-8 h-px bg-gold/35" />
            <p className="text-[9px] uppercase tracking-[0.4em] text-gold/60">
              {property.location}
            </p>
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-sand/90 tracking-wide">
            {property.title}
          </h1>
          <div className="flex items-center gap-6 text-[9.5px] uppercase tracking-[0.25em] text-sand/35">
            <span>{property.bedrooms} Bedroom{property.bedrooms !== 1 ? "s" : ""}</span>
            <span className="w-1 h-1 rounded-full bg-sand/20" />
            <span>{property.bathrooms} Bathroom{property.bathrooms !== 1 ? "s" : ""}</span>
            <span className="w-1 h-1 rounded-full bg-sand/20" />
            <span>{property.maxGuests} Guests</span>
          </div>
        </div>

        <Link
          href={`/owner/request-edit?propertyId=${property.id}`}
          className="inline-flex items-center gap-3 px-7 py-4 text-[9px] uppercase tracking-[0.35em] font-medium text-gold transition-all duration-500 hover:bg-gold/8 shrink-0"
          style={{ border: "1px solid rgba(201,169,110,0.3)" }}
        >
              Request Update
          <span className="text-gold/60">→</span>
        </Link>
      </div>

      {/* ─── PERFORMANCE METRICS ─── */}
      <div>
        <div className="flex items-center gap-4 mb-8">
          <span className="w-8 h-px bg-gold/30" />
          <h2 className="text-[10px] uppercase tracking-[0.4em] text-sand/40 font-medium">
            Stay Results
          </h2>
        </div>
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-px"
          style={{ background: "rgba(201,169,110,0.06)" }}
        >
          {performanceMetrics.map((m) => (
            <div
              key={m.label}
              className="bg-[#102943] px-7 py-8 group hover:bg-[#0D1F30] transition-colors duration-700"
            >
              <p className="text-[8.5px] uppercase tracking-[0.4em] text-sand/30 mb-2 font-medium">
                {m.label}
              </p>
              <p className="font-display text-2xl md:text-3xl text-gold/75 group-hover:text-gold transition-colors duration-700">
                {m.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

        {/* ─── DESCRIPTION + DETAILS ─── */}
        <div className="lg:col-span-2 space-y-12">

          {/* Description */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="w-8 h-px bg-gold/30" />
              <h2 className="text-[10px] uppercase tracking-[0.4em] text-sand/40 font-medium">
                Property Story
              </h2>
            </div>
            <p className="text-[13px] text-sand/55 leading-[1.95] font-light">
              {property.description}
            </p>
          </div>

          {/* Highlights */}
          {property.highlights.length > 0 && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="w-8 h-px bg-gold/30" />
                <h2 className="text-[10px] uppercase tracking-[0.4em] text-sand/40 font-medium">
                  Additional Features
                </h2>
              </div>
              <ul className="space-y-2.5">
                {property.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-1 h-1 rounded-full bg-gold/50 mt-2 shrink-0" />
                    <span className="text-[12.5px] text-sand/50 font-light leading-relaxed">
                      {h}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ─── AMENITIES ─── */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <span className="w-8 h-px bg-gold/30" />
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-sand/40 font-medium">
              Amenities
            </h2>
          </div>
          {property.amenities.length > 0 ? (
            <ul className="space-y-2.5">
              {property.amenities.map((a, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-[11.5px] text-sand/50 font-light"
                >
                  <span className="w-4 h-px bg-gold/30 shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-sand/25 italic">No amenities listed.</p>
          )}
        </div>
      </div>

      {/* ─── GUEST REVIEWS ─── */}
      {property.reviews.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <span className="w-8 h-px bg-gold/30" />
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-sand/40 font-medium">
              Guest Reviews
            </h2>
            <span className="text-[9px] uppercase tracking-[0.3em] text-sand/25 ml-2">
              ({property._count.reviews} total)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {property.reviews.map((review) => (
              <div
                key={review.id}
                className="p-7 space-y-4"
                style={{ border: "1px solid rgba(201,169,110,0.07)", background: "rgba(201,169,110,0.02)" }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-sand/60 font-medium tracking-wide">
                    {review.guest.name ?? "Anonymous Guest"}
                  </p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-[10px] ${
                          i < review.rating ? "text-gold/80" : "text-sand/15"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-[12px] text-sand/40 leading-[1.8] font-light italic">
                  &ldquo;{review.comment}&rdquo;
                </p>
                <p className="text-[9px] uppercase tracking-[0.3em] text-sand/25">
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

      {/* ─── FOOTER CTA ─── */}
      <div
        className="flex flex-col sm:flex-row items-center justify-between gap-6 px-10 py-8"
        style={{ border: "1px solid rgba(201,169,110,0.1)", background: "rgba(201,169,110,0.025)" }}
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-sand/40 font-medium mb-1">
            Need to update this property?
          </p>
          <p className="text-[12px] text-sand/30 font-light">
            Send property, calendar, feature, amenity, pricing, or photo updates to the Salt Route team.
          </p>
        </div>
        <Link
          href={`/owner/request-edit?propertyId=${property.id}`}
          className="shrink-0 px-8 py-4 text-[9px] uppercase tracking-[0.35em] font-medium text-[#0C1F33] bg-gold hover:bg-gold/90 transition-all duration-500"
        >
          Request Update
        </Link>
      </div>
    </div>
  )
}
