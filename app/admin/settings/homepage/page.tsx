import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Star, Home, Plus } from "lucide-react"
import { FeaturedToggle } from "./FeaturedToggle"
import { getPrimaryImageUrl } from "@/lib/property-media"
import { getPagination, parsePage } from "@/lib/pagination"
import { PaginationControls } from "@/components/shared/pagination-controls"

export default async function HomepageSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const requestedPage = parsePage(params.page)
  const total = await prisma.property.count()
  const pagination = getPagination(requestedPage, total)

  const properties = await prisma.property.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    skip: pagination.skip,
    take: pagination.take,
    include: { images: { take: 1, orderBy: [{ isPrimary: "desc" }, { order: "asc" }] } },
  })

  const featured = properties.filter((p) => p.featured)
  const notFeatured = properties.filter((p) => !p.featured)

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Settings</p>
        <h2 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Homepage Settings</h2>
        <p className="text-[12px] text-[#1B3A5C]/45 mt-1">
          Control which properties appear in the Featured section on the public homepage.
          Toggle the star to feature or unfeature a property.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex items-start gap-3 text-[12px] text-amber-800">
        <Star size={16} className="fill-amber-400 text-amber-400 shrink-0 mt-0.5" />
        <p>Up to 3 featured properties are shown on the homepage. Featuring more than 3 will rotate through them.</p>
      </div>

      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1B3A5C]/8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home size={16} className="text-[#C9A96E]" />
            <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#1B3A5C]/60">All Properties (<span className="tabular-nums">{total}</span>)</h3>
          </div>
          <Button asChild size="sm" className="bg-[#1B3A5C] text-[#FFFAF3] hover:bg-[#2A4F7A] rounded-lg text-[12px] font-medium">
            <Link href="/admin/properties/new">
              <Plus className="w-3 h-3 mr-1" /> Add Property
            </Link>
          </Button>
        </div>

        {properties.length === 0 ? (
          <div className="p-10 text-center">
            <Home className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-3" />
            <p className="text-[13px] text-[#1B3A5C]/40">No properties yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1B3A5C]/5">
            {[...featured, ...notFeatured].map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#FBF9F4] transition-colors">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#1B3A5C]/5 shrink-0">
                  {getPrimaryImageUrl(p.images) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getPrimaryImageUrl(p.images)!} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-beige" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#1B3A5C] truncate">{p.title}</p>
                  <p className="text-[11px] text-[#1B3A5C]/40 truncate">{p.location}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full text-[9px] font-semibold border uppercase tracking-[0.15em] px-2.5 py-1 shrink-0 ${
                    p.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600 border-emerald-200/60"
                    : p.status === "DRAFT" ? "bg-amber-50 text-amber-700 border-amber-200/60"
                    : "bg-[#1B3A5C]/5 text-[#1B3A5C]/50 border-[#1B3A5C]/10"
                  }`}
                >
                  {p.status}
                </span>
                <FeaturedToggle propertyId={p.id} featured={p.featured} />
                <Button asChild variant="ghost" size="sm" className="shrink-0 text-[#1B3A5C]/50 hover:text-[#1B3A5C] hover:bg-[#1B3A5C]/5 rounded-lg text-[12px]">
                  <Link href={`/admin/properties/${p.id}/edit`}>Edit</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <PaginationControls
        basePath="/admin/settings/homepage"
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
