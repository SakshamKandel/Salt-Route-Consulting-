import { prisma } from "@/lib/db"
import PropertiesClient from "@/components/public/PropertiesClient"
import { Prisma } from "@prisma/client"
import { getUnavailablePropertyIds } from "@/lib/room-availability"

// searchParams already opts this route into dynamic rendering.
// Removing force-dynamic allows Next.js to cache data fetches and
// apply Partial Prerendering where possible.
export const revalidate = 300

type SearchFilters = {
  location?: string
  checkIn?: Date
  checkOut?: Date
  guests?: number
  page?: number
}

const PAGE_SIZE = 12

async function getProperties({ location, checkIn, checkOut, guests, page = 1 }: SearchFilters) {
  const where: Prisma.PropertyWhereInput = { status: "ACTIVE" }

  if (location) {
    where.location = { contains: location, mode: "insensitive" }
  }
  if (guests && guests > 0) {
    where.maxGuests = { gte: guests }
  }
  if (checkIn && checkOut) {
    // Unit-aware availability: a property with multiple rooms/villas stays
    // listed until every unit of every class is taken for some day in range.
    const unavailableIds = await getUnavailablePropertyIds(checkIn, checkOut)
    if (unavailableIds.length > 0) {
      where.id = { notIn: unavailableIds }
    }
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
    // Map property metadata. The client resolves known Nepal locations
    // locally, so rendering never waits on a geocoding API.
    prisma.property.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        title: true,
        slug: true,
        location: true,
        pricePerNight: true,
        hidePrice: true,
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
      hidePrice: true,
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
    // Return map property metadata without external geocoding coordinates.
    mapProperties: mapProperties.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      location: p.location,
      pricePerNight: Number(p.pricePerNight),
      hidePrice: p.hidePrice,
      imageUrl: p.images[0]?.url ?? undefined,
    })),
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
  }).catch((err) => {
    console.error("[properties] fetch failed:", err)
    return {
      properties: [] as Awaited<ReturnType<typeof getProperties>>["properties"],
      page,
      totalProperties: 0,
      totalPages: 1,
      knownLocations: [] as string[],
      knownProperties: [] as Awaited<ReturnType<typeof getProperties>>["knownProperties"],
      mapProperties: [] as Awaited<ReturnType<typeof getProperties>>["mapProperties"],
    }
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
