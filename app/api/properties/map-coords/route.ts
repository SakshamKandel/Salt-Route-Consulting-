import { prisma } from "@/lib/db"

// 5-minute cache — geocoding results are stable, no need to hit Nominatim
// on every request. The underlying fetch to Nominatim also caches for 7 days.
export const revalidate = 300

const NEPAL_CENTER: [number, number] = [27.7172, 85.3240]

// Geocode a location string via Nominatim with a hard 4-second timeout.
// Nominatim is a free, rate-limited service — if it's slow or throttling us,
// we fall back to the Nepal center point rather than hanging the request.
async function geocodeForMap(location: string): Promise<[number, number]> {
  try {
    const query = /nepal/i.test(location) ? location : `${location}, Nepal`
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=np`
    const res = await fetch(url, {
      headers: { "User-Agent": "SaltRouteConsulting/1.0 (connect@saltroutecorp.com)" },
      next: { revalidate: 604800 },
      // Hard timeout: never let a single geocode call hang for more than 4s.
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return NEPAL_CENTER
    const data: { lat: string; lon: string }[] = await res.json()
    if (!data[0]) return NEPAL_CENTER
    return [Number(data[0].lat), Number(data[0].lon)]
  } catch {
    return NEPAL_CENTER
  }
}

/**
 * Returns geocoded coordinates for all active properties.
 * Called client-side by PropertyMapInner AFTER the page has already rendered,
 * so geocoding latency never blocks the properties page load.
 */
export async function GET() {
  const mapProperties = await prisma.property.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      location: true,
    },
    orderBy: [{ featured: "desc" }, { title: "asc" }],
  })

  const uniqueLocations = [...new Set(mapProperties.map((p) => p.location))]
  const coordsMap = new Map<string, [number, number]>()
  await Promise.all(
    uniqueLocations.map(async (loc) => {
      coordsMap.set(loc, await geocodeForMap(loc))
    }),
  )

  // Apply a small jitter when multiple properties share the same location
  // so markers don't overlap on the map.
  const locationCount = new Map<string, number>()
  const result = mapProperties.map((p) => {
    const idx = locationCount.get(p.location) ?? 0
    locationCount.set(p.location, idx + 1)
    const [lat, lng] = coordsMap.get(p.location) ?? NEPAL_CENTER
    return {
      id: p.id,
      latitude: lat + idx * 0.002,
      longitude: lng + idx * 0.002,
    }
  })

  return Response.json(result)
}
