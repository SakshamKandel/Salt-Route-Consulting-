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
        <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Settings</p>
        <h2 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Cities & Locations</h2>
        <p className="text-[12px] text-[#1B3A5C]/45 mt-1">
          All distinct locations used across properties. Edit a property to change its location.
        </p>
      </div>

      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1B3A5C]/8 flex items-center justify-between">
          <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#1B3A5C]/60"><span className="tabular-nums">{cities.length}</span> Locations</h3>
          <Button asChild size="sm" className="bg-[#1B3A5C] text-[#FFFAF3] hover:bg-[#2A4F7A] rounded-lg text-[12px] font-medium">
            <Link href="/admin/properties/new">Add Property</Link>
          </Button>
        </div>
        {cities.length === 0 ? (
          <div className="p-10 text-center">
            <MapPin className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-3" />
            <p className="text-[13px] text-[#1B3A5C]/40">No properties found.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1B3A5C]/5">
            {cities.map(({ name, total, active }) => (
              <div key={name} className="flex items-center gap-4 px-5 py-4 hover:bg-[#FBF9F4] transition-colors">
                <div className="w-9 h-9 rounded-full bg-[#1B3A5C]/5 flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-[#C9A96E]" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-[#1B3A5C]">{name}</p>
                  <p className="text-[11px] text-[#1B3A5C]/40 tabular-nums">
                    {total} {total === 1 ? "property" : "properties"} · {active} active
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="border-[#1B3A5C]/15 text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 rounded-lg text-[12px] font-medium">
                  <Link href={`/admin/properties?location=${encodeURIComponent(name)}`}>
                    View
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
        <div className="px-5 py-4 bg-[#FBF9F4] border-t border-[#1B3A5C]/8 text-[11px] text-[#1B3A5C]/45">
          To add a new location, create a property with that location string.
        </div>
      </div>
    </div>
  )
}
