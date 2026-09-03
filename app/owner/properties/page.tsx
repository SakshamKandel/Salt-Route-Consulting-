import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getPrimaryImageUrl } from "@/lib/property-media"
import { getPagination, parsePage } from "@/lib/pagination"
import { PaginationControls } from "@/components/shared/pagination-controls"
import { Bath, BedDouble, ChevronRight, Home, MapPin, Plus, Star, Users } from "lucide-react"

const PROPERTY_STATUS_CHIP: Record<string, string> = {
  ACTIVE:    "bg-emerald-50 text-emerald-600 border-emerald-200/60",
  DRAFT:     "bg-amber-50 text-amber-600 border-amber-200/60",
  INACTIVE:  "bg-[#1B3A5C]/5 text-[#1B3A5C]/50 border-[#1B3A5C]/10",
}

export default async function OwnerPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const params = await searchParams
  const requestedPage = parsePage(params.page)
  const where = {
    ownerId: session.user.id,
    status: { not: "ARCHIVED" as const },
  }
  const total = await prisma.property.count({ where })
  const pagination = getPagination(requestedPage, total)

  const properties = await prisma.property.findMany({
    where,
    skip: pagination.skip,
    take: pagination.take,
    select: {
      id: true,
      title: true,
      location: true,
      status: true,
      featured: true,
      bedrooms: true,
      bathrooms: true,
      maxGuests: true,
      amenities: true,
      _count: {
        select: {
          bookings: { where: { status: { in: ["CONFIRMED", "COMPLETED", "CHECKED_IN"] } } },
          reviews: true,
        },
      },
      images: {
        take: 1,
        orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
        select: { url: true, isPrimary: true },
      },
    },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
  })

  return (
    <div className="pb-12 space-y-8">

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.3em] mb-1">
            Portfolio
          </p>
          <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">
            Your properties
          </h1>
          <p className="text-[12px] text-[#1B3A5C]/45 mt-1.5 max-w-xl">
            Open any property to review its gallery, amenities, reviews, stay value, and update requests.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <p className="text-[11px] text-[#1B3A5C]/40 tabular-nums">
            {total} propert{total === 1 ? "y" : "ies"}
          </p>
          <Link
            href="/owner/properties/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#1B3A5C] px-4 py-2.5 text-[12px] font-medium text-[#FFFAF3] transition-colors hover:bg-[#2A4F7A]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add property
          </Link>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl py-16 text-center">
          <Home className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-3" />
          <p className="text-[13px] text-[#1B3A5C]/35 font-medium">No properties yet</p>
          <p className="text-[11px] text-[#1B3A5C]/25 mt-1 max-w-sm mx-auto">
            Add your first residence and our team will review, photograph, and publish it to the
            Salt Route collection.
          </p>
          <Link
            href="/owner/properties/new"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#1B3A5C] px-5 py-2.5 text-[12px] font-medium text-[#FFFAF3] transition-colors hover:bg-[#2A4F7A]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add your first property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map((p) => {
            const imageUrl = getPrimaryImageUrl(p.images) || "/placeholder-property.jpg"
            const chip = PROPERTY_STATUS_CHIP[p.status] ?? PROPERTY_STATUS_CHIP.INACTIVE

            return (
              <Link
                key={p.id}
                href={`/owner/properties/${p.id}`}
                className="group flex flex-col bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl overflow-hidden hover:border-[#1B3A5C]/15 transition-colors"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#1B3A5C]/5">
                  <Image
                    src={imageUrl}
                    alt={p.title}
                    fill
                    sizes="(min-width: 1280px) 31vw, (min-width: 768px) 48vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-semibold border uppercase tracking-[0.15em] ${chip}`}>
                      {p.status}
                    </span>
                    {p.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-semibold border uppercase tracking-[0.15em] bg-[#FFFAF3]/90 text-[#A8863F] border-[#C9A96E]/40">
                        <Star className="h-2.5 w-2.5" />
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <p className="flex items-center gap-1 text-[10px] text-[#C9A96E] uppercase tracking-[0.2em] font-medium mb-1.5">
                    <MapPin className="h-2.5 w-2.5" />
                    {p.location}
                  </p>
                  <h3 className="text-[14px] font-semibold text-[#1B3A5C] leading-snug line-clamp-1">
                    {p.title}
                  </h3>

                  <div className="mt-3 flex items-center gap-4 text-[11px] text-[#1B3A5C]/45">
                    <span className="inline-flex items-center gap-1.5">
                      <BedDouble className="h-3.5 w-3.5 text-[#1B3A5C]/30" />
                      {p.bedrooms}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Bath className="h-3.5 w-3.5 text-[#1B3A5C]/30" />
                      {p.bathrooms}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-[#1B3A5C]/30" />
                      {p.maxGuests}
                    </span>
                  </div>

                  <div className="mt-auto grid grid-cols-3 gap-3 border-t border-[#1B3A5C]/5 pt-4 mt-4">
                    <div>
                      <p className="text-[15px] font-semibold text-[#1B3A5C] tabular-nums">{p._count.bookings}</p>
                      <p className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-[#1B3A5C]/35 font-medium">Stays</p>
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#1B3A5C] tabular-nums">{p._count.reviews}</p>
                      <p className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-[#1B3A5C]/35 font-medium">Reviews</p>
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#1B3A5C] tabular-nums">{p.amenities.length}</p>
                      <p className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-[#1B3A5C]/35 font-medium">Amenities</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end border-t border-[#1B3A5C]/5 pt-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1B3A5C]/40 group-hover:text-[#1B3A5C] transition-colors">
                      Open property
                      <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <PaginationControls
        basePath="/owner/properties"
        page={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={total}
        startItem={pagination.startItem}
        endItem={pagination.endItem}
        label="properties"
      />
    </div>
  )
}
