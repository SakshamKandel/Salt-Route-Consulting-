import { prisma } from "@/lib/db"
import PropertiesClient from "@/components/public/PropertiesClient"
import { Prisma } from "@prisma/client"

type SearchFilters = {
  location?: string
  checkIn?: Date
  checkOut?: Date
  guests?: number
  page?: number
}

const PAGE_SIZE = 12

// Fallback used only when Nominatim is unavailable.
const NEPAL_CENTER: [number, number] = [27.7172, 85.3240]

// Geocodes a location string via Nominatim with a 7-day Next.js Data Cache entry.
async function geocodeForMap(location: string): Promise<[number, number]> {
  try {
    const query = /nepal/i.test(location) ? location : `${location}, Nepal`
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=np`
    const res = await fetch(url, {
      headers: { "User-Agent": "SaltRouteConsulting/1.0 (contact@saltroutegroup.com)" },
      next: { revalidate: 604800 },
    })
    if (!res.ok) return NEPAL_CENTER
    const data: { lat: string; lon: string }[] = await res.json()
    if (!data[0]) return NEPAL_CENTER
    return [Number(data[0].lat), Number(data[0].lon)]
  } catch {
    return NEPAL_CENTER
  }
}

async function getProperties({ location, checkIn, checkOut, guests, page = 1 }: SearchFilters) {
  const where: Prisma.PropertyWhereInput = { status: "ACTIVE" }

  if (location) {
    where.location = { contains: location, mode: "insensitive" }
  }
  if (guests && guests > 0) {
    where.maxGuests = { gte: guests }
  }
  if (checkIn && checkOut) {
    where.AND = [
      {
        bookings: {
          none: {
            status: { in: ["PENDING", "CONFIRMED"] },
            checkIn: { lt: checkOut },
            checkOut: { gt: checkIn },
          },
        },
      },
      {
        blockedDates: {
          none: { date: { gte: checkIn, lt: checkOut } },
        },
      },
    ]
  }

  const [totalProperties, locationRows, propertyList, mapProperties] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where: { status: "ACTIVE", location: { not: "" } },
      select: { location: true },
      distinct: ["location"],
      orderBy: { location: "asc" },
    }),
    prisma.property.findMany({
      where: { status: "ACTIVE" },
      select: { title: true, slug: true, location: true },
      orderBy: [{ featured: "desc" }, { title: "asc" }],
    }),
    prisma.property.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        title: true,
        slug: true,
        location: true,
        pricePerNight: true,
        images: {
          orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
          select: { url: true },
          take: 1,
        },
      },
      orderBy: [{ featured: "desc" }, { title: "asc" }],
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalProperties / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  const properties = await prisma.property.findMany({
    where,
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      location: true,
      bedrooms: true,
      bathrooms: true,
      maxGuests: true,
      pricePerNight: true,
      highlights: true,
      amenities: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
        take: 1,
        select: {
          url: true,
          isPrimary: true,
          isBanner: true,
          order: true,
        },
      },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })

  return {
    properties,
    page: safePage,
    totalProperties,
    totalPages,
    knownLocations: locationRows.flatMap((row) => {
      const city = row.location.split(",")[0]?.trim()
      return city ? [city] : []
    }),
    knownProperties: propertyList,
    mapProperties: await (async () => {
      // Geocode unique locations in parallel, then apply a small jitter
      // when multiple properties share the same location so markers don't overlap.
      const uniqueLocations = [...new Set(mapProperties.map((p) => p.location))]
      const coordsMap = new Map<string, [number, number]>()
      await Promise.all(
        uniqueLocations.map(async (loc) => {
          coordsMap.set(loc, await geocodeForMap(loc))
        })
      )
      const locationCount = new Map<string, number>()
      return mapProperties.map((p) => {
        const idx = locationCount.get(p.location) ?? 0
        locationCount.set(p.location, idx + 1)
        const [lat, lng] = coordsMap.get(p.location) ?? NEPAL_CENTER
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          location: p.location,
          pricePerNight: Number(p.pricePerNight),
          latitude: lat + idx * 0.002,
          longitude: lng + idx * 0.002,
          imageUrl: p.images[0]?.url ?? undefined,
        }
      })
    })(),
  }
}

function parsePageParam(value: string | string[] | undefined): number {
  if (typeof value !== "string") return 1
  const page = Number(value)
  if (!Number.isFinite(page) || page < 1) return 1
  return Math.floor(page)
}

function dedupe(values: string[]) {
  return Array.from(new Set(values))
}

function parseDateParam(value: string | string[] | undefined): Date | undefined {
  if (typeof value !== "string" || !value) return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const location = typeof params.location === "string" ? params.location : undefined
  const checkIn = parseDateParam(params.checkIn)
  const checkOut = parseDateParam(params.checkOut)
  const guestsRaw = typeof params.guests === "string" ? Number(params.guests) : NaN
  const guests = Number.isFinite(guestsRaw) && guestsRaw > 0 ? Math.floor(guestsRaw) : undefined
  const page = parsePageParam(params.page)

  const validRange = checkIn && checkOut && checkOut > checkIn ? { checkIn, checkOut } : {}

  const propertiesResult = await getProperties({
    location,
    ...validRange,
    guests,
    page,
  })
  const { properties, totalProperties, totalPages, knownLocations, knownProperties, mapProperties } = propertiesResult
  const serializedProperties = properties.map((p) => ({
    ...p,
    pricePerNight: Number(p.pricePerNight),
  }))

  return (
    <PropertiesClient
      properties={serializedProperties}
      location={location}
      checkIn={typeof params.checkIn === "string" ? params.checkIn : undefined}
      checkOut={typeof params.checkOut === "string" ? params.checkOut : undefined}
      guests={guests}
      page={propertiesResult.page}
      pageSize={PAGE_SIZE}
      totalProperties={totalProperties}
      totalPages={totalPages}
      knownLocations={dedupe(knownLocations)}
      knownProperties={knownProperties}
      mapProperties={mapProperties}
    />
  )
}
