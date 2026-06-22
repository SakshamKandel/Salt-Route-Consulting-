import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { BookingPageClient } from "@/components/booking/BookingPageClient"
import { getPrimaryImageUrl } from "@/lib/property-media"

export const dynamic = "force-dynamic"

export default async function BookingRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const propertyId = typeof params.property === "string" ? params.property : null
  const requestedRoomTypeId = typeof params.room === "string" ? params.room : null
  const requestedCheckIn = typeof params.checkIn === "string" ? params.checkIn : null
  const requestedCheckOut = typeof params.checkOut === "string" ? params.checkOut : null
  const requestedGuests = typeof params.guests === "string" ? Number(params.guests) : null
  const requestedPhone = typeof params.phone === "string" ? params.phone : null

  // Bare /booking-request with no property → send the visitor to browse,
  // rather than dead-ending on the 404 screen.
  if (!propertyId) redirect("/properties")

  const session = await auth()

  const property = await prisma.property.findUnique({
    where: { id: propertyId, status: "ACTIVE" },
    include: {
      images: { orderBy: { order: "asc" } },
      roomTypes: { where: { active: true }, orderBy: { order: "asc" } },
    },
  })

  if (!property) return notFound()

  const currentUser = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { phone: true },
      })
    : null

  const heroImage = getPrimaryImageUrl(property.images)

  return (
    <BookingPageClient
      property={{
        id: property.id,
        title: property.title,
        slug: property.slug,
        location: property.location,
        description: property.description,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        maxGuests: property.maxGuests,
        pricePerNight: Number(property.pricePerNight),
        images: property.images.map((img) => ({ url: img.url, alt: img.alt })),
      }}
      roomTypes={property.roomTypes.map((rt) => ({
        id: rt.id,
        name: rt.name,
        classType: rt.classType,
        description: rt.description,
        pricePerNight: Number(rt.pricePerNight),
        maxGuests: rt.maxGuests,
        totalUnits: rt.totalUnits,
        bedType: rt.bedType,
        sizeSqm: rt.sizeSqm,
        imageUrl: rt.imageUrl ?? null,
      }))}
      heroImage={heroImage}
      currentUserPhone={currentUser?.phone ?? null}
      requestedRoomTypeId={requestedRoomTypeId}
      requestedCheckIn={requestedCheckIn}
      requestedCheckOut={requestedCheckOut}
      requestedGuests={requestedGuests}
      requestedPhone={requestedPhone}
      isAuthenticated={!!session?.user?.id}
    />
  )
}

