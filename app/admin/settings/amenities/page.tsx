import { prisma } from "@/lib/db"
import { AmenitiesManager } from "./AmenitiesManager"

async function getAmenityData() {
  const properties = await prisma.property.findMany({
    select: { amenities: true, title: true },
  })

  const countMap: Record<string, number> = {}
  for (const p of properties) {
    for (const a of p.amenities) {
      countMap[a] = (countMap[a] ?? 0) + 1
    }
  }

  return Object.entries(countMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export default async function AmenitiesSettingsPage() {
  const amenities = await getAmenityData()

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-3xl font-display text-navy">Amenities</h2>
        <p className="text-slate-500">
          View and manage amenities used across all properties. Adding an amenity here adds it to every property; removing deletes it from all.
        </p>
      </div>
      <AmenitiesManager amenities={amenities} />
    </div>
  )
}
