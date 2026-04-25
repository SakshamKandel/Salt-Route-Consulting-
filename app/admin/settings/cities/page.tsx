import { prisma } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"

async function getCityData() {
  return prisma.$queryRaw<{ name: string; total: number; active: number }[]>`
    SELECT
      trim(location) AS name,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active
    FROM properties
    WHERE trim(location) <> ''
    GROUP BY trim(location)
    ORDER BY total DESC, name ASC
  `
}

export default async function CitiesSettingsPage() {
  const cities = await getCityData()

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-3xl font-display text-navy">Cities & Locations</h2>
        <p className="text-slate-500">
          All distinct locations used across properties. Edit a property to change its location.
        </p>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-navy">{cities.length} Locations</h3>
          <Button asChild size="sm" className="bg-navy text-cream">
            <Link href="/admin/properties/new">Add Property</Link>
          </Button>
        </div>
        {cities.length === 0 ? (
          <p className="p-8 text-center text-slate-400">No properties found.</p>
        ) : (
          <div className="divide-y">
            {cities.map(({ name, total, active }) => (
              <div key={name} className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-full bg-navy/5 flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-navy" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-navy">{name}</p>
                  <p className="text-xs text-slate-400">
                    {total} {total === 1 ? "property" : "properties"} · {active} active
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="border-navy/20 text-navy">
                  <Link href={`/admin/properties?location=${encodeURIComponent(name)}`}>
                    View
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
        <div className="px-5 py-4 bg-slate-50 border-t text-xs text-slate-500">
          To add a new location, create a property with that location string.
        </div>
      </div>
    </div>
  )
}
