import { prisma } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Star, Home, Plus } from "lucide-react"
import { FeaturedToggle } from "./FeaturedToggle"
import { getPrimaryImageUrl } from "@/lib/property-media"

export default async function HomepageSettingsPage() {
  const properties = await prisma.property.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: { images: { take: 6, orderBy: { order: "asc" } } },
  })

  const featured = properties.filter((p) => p.featured)
  const notFeatured = properties.filter((p) => !p.featured)

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-display text-navy">Homepage Settings</h2>
        <p className="text-slate-500">
          Control which properties appear in the Featured section on the public homepage.
          Toggle the star to feature or unfeature a property.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-sm text-amber-800">
        <Star size={16} className="fill-amber-400 text-amber-400 shrink-0 mt-0.5" />
        <p>Up to 3 featured properties are shown on the homepage. Featuring more than 3 will rotate through them.</p>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home size={18} className="text-navy" />
            <h3 className="font-semibold text-navy">All Properties ({properties.length})</h3>
          </div>
          <Button asChild size="sm" className="bg-navy text-cream">
            <Link href="/admin/properties/new">
              <Plus className="w-3 h-3 mr-1" /> Add Property
            </Link>
          </Button>
        </div>

        {properties.length === 0 ? (
          <p className="p-8 text-center text-slate-400">No properties yet.</p>
        ) : (
          <div className="divide-y">
            {[...featured, ...notFeatured].map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                  {getPrimaryImageUrl(p.images) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getPrimaryImageUrl(p.images)!} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-beige" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy truncate">{p.title}</p>
                  <p className="text-xs text-slate-500 truncate">{p.location}</p>
                </div>
                <Badge
                  variant={
                    p.status === "ACTIVE" ? "default"
                    : p.status === "DRAFT" ? "secondary"
                    : "outline"
                  }
                  className="shrink-0"
                >
                  {p.status}
                </Badge>
                <FeaturedToggle propertyId={p.id} featured={p.featured} />
                <Button asChild variant="ghost" size="sm" className="shrink-0">
                  <Link href={`/admin/properties/${p.id}/edit`}>Edit</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
