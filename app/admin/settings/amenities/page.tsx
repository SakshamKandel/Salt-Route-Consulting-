import { prisma } from "@/lib/db"
import { AmenitiesManager } from "./AmenitiesManager"

async function getAmenityData() {
  return prisma.$queryRaw<{ name: string; count: number }[]>`
    SELECT amenity AS name, COUNT(*)::int AS count
    FROM properties, unnest(amenities) AS amenity
    GROUP BY amenity
    ORDER BY count DESC, amenity ASC
  `
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
