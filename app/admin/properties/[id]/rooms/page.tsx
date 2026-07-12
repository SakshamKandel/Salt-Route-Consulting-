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
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="rounded-lg text-[#1B3A5C]/40 hover:text-[#1B3A5C] hover:bg-[#1B3A5C]/5">
          <Link href={`/admin/properties/${id}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Portfolio</p>
          <h2 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Room Classes</h2>
          <p className="text-[13px] text-[#1B3A5C]/45 mt-1">
            {property.title} — define suites, deluxe rooms, villas or apartments with their own price and unit count.
            A date only shows as fully booked once every unit of a class is taken.
          </p>
        </div>
      </div>

      <RoomTypeManager propertyId={id} initial={roomTypes} propertyType={property.propertyType} />
    </div>
  )
}
