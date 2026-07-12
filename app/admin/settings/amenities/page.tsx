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
        <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Settings</p>
        <h2 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Amenities</h2>
        <p className="text-[12px] text-[#1B3A5C]/45 mt-1">
          View and manage amenities used across all properties. Adding an amenity here adds it to every property; removing deletes it from all.
        </p>
      </div>
      <AmenitiesManager amenities={amenities} />
    </div>
  )
}
