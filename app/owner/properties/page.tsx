import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getPrimaryImageUrl } from "@/lib/property-media"
import { getPagination, parsePage } from "@/lib/pagination"
import { PaginationControls } from "@/components/shared/pagination-controls"
import { ArrowRight, Bath, BedDouble, Camera, MapPin, Sparkles, Users } from "lucide-react"

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
    include: {
      _count: {
        select: {
          bookings: { where: { status: { in: ["CONFIRMED", "COMPLETED", "CHECKED_IN"] } } },
          reviews: true,
        },
      },
      images: { take: 1, orderBy: [{ isPrimary: "desc" }, { order: "asc" }] },
    },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
  })

  return (
    <div className="space-y-14">
      <section className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="h-px w-8 bg-gold/40" />
            <p className="text-[9px] uppercase tracking-[0.45em] text-gold/60">Owner Properties</p>
          </div>
          <h1 className="font-display text-4xl leading-[1.12] tracking-wide text-sand/88 md:text-5xl">
            Every property, beautifully kept in one view.
          </h1>
          <p className="max-w-2xl text-sm font-light leading-[1.85] text-sand/38">
            Open any property to review its guest story, gallery, amenities, arrivals, reviews, stay value, and update requests.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-px bg-gold/8">
          {[
            ["Total", total],
            ["Shown", properties.length],
          ].map(([label, value]) => (
            <div key={label} className="bg-[#102943] p-6">
              <p className="text-[8px] uppercase tracking-[0.3em] text-sand/28">{label}</p>
              <p className="mt-3 font-display text-3xl text-gold/75">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {properties.length === 0 ? (
        <div className="border border-gold/8 py-24 text-center">
          <Sparkles className="mx-auto mb-6 h-8 w-8 text-gold/25 stroke-[1.2]" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-sand/25">
            No active properties listed yet
          </p>
          <p className="mt-3 text-[11px] font-light text-sand/20">
            Contact Salt Route to prepare your first property for guests.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-px bg-gold/8 md:grid-cols-2 xl:grid-cols-3">
          {properties.map((p) => {
            const imageUrl = getPrimaryImageUrl(p.images) || "/placeholder-property.jpg"
            const readiness = [
              p.images.length > 0,
              p.amenities.length > 0,
              p.highlights.length > 0,
              p.description.length > 140,
            ].filter(Boolean).length

            return (
              <Link
                key={p.id}
                href={`/owner/properties/${p.id}`}
                className="group flex min-h-[500px] flex-col bg-[#102943] transition-colors duration-700 hover:bg-[#163350]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#1B3A5C]">
                  <Image
                    src={imageUrl}
                    alt={p.title}
                    fill
                    sizes="(min-width: 1280px) 31vw, (min-width: 768px) 48vw, 100vw"
                    className="object-cover transition-transform duration-[1800ms] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#0C1F33]/22 transition-colors duration-700 group-hover:bg-transparent" />
                  <div className="absolute left-5 top-5 border border-gold/20 bg-[#0C1F33]/78 px-3 py-2 text-[8px] uppercase tracking-[0.28em] text-gold backdrop-blur">
                    {p.status}
                  </div>
                  {p.featured && (
                    <div className="absolute bottom-5 left-5 border border-white/18 bg-white/10 px-3 py-2 text-[8px] uppercase tracking-[0.28em] text-white backdrop-blur">
                      Signature
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <p className="flex items-center gap-2 text-[8.5px] uppercase tracking-[0.28em] text-gold/50">
                    <MapPin className="h-3.5 w-3.5 stroke-[1.3]" />
                    {p.location}
                  </p>
                  <h3 className="mt-4 font-display text-2xl tracking-wide text-sand/86 transition-colors duration-500 group-hover:text-sand">
                    {p.title}
                  </h3>

                  <div className="mt-6 grid grid-cols-3 gap-3 text-[8px] uppercase tracking-[0.2em] text-sand/28">
                    <span className="inline-flex items-center gap-2">
                      <BedDouble className="h-3.5 w-3.5 stroke-[1.3]" />
                      {p.bedrooms}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Bath className="h-3.5 w-3.5 stroke-[1.3]" />
                      {p.bathrooms}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 stroke-[1.3]" />
                      {p.maxGuests}
                    </span>
                  </div>

                  <div className="mt-auto grid grid-cols-3 gap-3 border-t border-gold/8 pt-6">
                    <div>
                      <p className="font-display text-2xl text-gold/72">{p._count.bookings}</p>
                      <p className="mt-1 text-[8px] uppercase tracking-[0.2em] text-sand/25">Stays</p>
                    </div>
                    <div>
                      <p className="font-display text-2xl text-gold/72">{p._count.reviews}</p>
                      <p className="mt-1 text-[8px] uppercase tracking-[0.2em] text-sand/25">Reviews</p>
                    </div>
                    <div>
                      <p className="font-display text-2xl text-gold/72">{readiness}/4</p>
                      <p className="mt-1 text-[8px] uppercase tracking-[0.2em] text-sand/25">Details</p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-gold/8 pt-5">
                    <span className="inline-flex items-center gap-2 text-[8.5px] uppercase tracking-[0.25em] text-sand/30">
                      <Camera className="h-3.5 w-3.5 stroke-[1.3]" />
                      {p.amenities.length} amenities
                    </span>
                    <span className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-gold/55 transition-colors duration-500 group-hover:text-gold">
                      Open property
                      <ArrowRight className="h-3.5 w-3.5 stroke-[1.3] transition-transform duration-500 group-hover:translate-x-1" />
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

