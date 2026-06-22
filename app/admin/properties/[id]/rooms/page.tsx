import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { RoomTypeManager } from "./RoomTypeManager"

export default async function PropertyRoomsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const property = await prisma.property.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      propertyType: true,
      roomTypes: { orderBy: { order: "asc" } },
    },
  })

  if (!property) return notFound()

  const roomTypes = property.roomTypes.map((rt) => ({
    id: rt.id,
    name: rt.name,
    classType: rt.classType,
    description: rt.description,
    totalUnits: rt.totalUnits,
    pricePerNight: Number(rt.pricePerNight),
    maxGuests: rt.maxGuests,
    bedrooms: rt.bedrooms,
    bathrooms: rt.bathrooms,
    sizeSqm: rt.sizeSqm,
    bedType: rt.bedType,
    amenities: rt.amenities,
    imageUrl: rt.imageUrl,
    images: rt.images ?? [],
    active: rt.active,
  }))

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/admin/properties/${id}`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-display text-navy">Room Classes</h2>
          <p className="text-slate-500">
            {property.title} — define suites, deluxe rooms, villas or apartments with their own price and unit count.
            A date only shows as fully booked once every unit of a class is taken.
          </p>
        </div>
      </div>

      <RoomTypeManager propertyId={id} initial={roomTypes} propertyType={property.propertyType} />
    </div>
  )
}
