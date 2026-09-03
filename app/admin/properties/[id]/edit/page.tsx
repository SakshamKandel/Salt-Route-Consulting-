import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { PropertyForm } from "../../PropertyForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [property, owners, locationRows, features] = await Promise.all([
    prisma.property.findUnique({
      where: { id },
      include: {
        roomTypes: { where: { active: true }, orderBy: { order: "asc" } },
        sections: { orderBy: { order: "asc" } },
      },
    }),
    prisma.user.findMany({
      where: { role: { in: ["OWNER", "ADMIN"] }, status: "ACTIVE" },
      select: { id: true, name: true, email: true, role: true },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    }),
    prisma.property.findMany({
      where: { location: { not: "" } },
      select: { location: true },
      distinct: ["location"],
      orderBy: { location: "asc" },
    }),
    prisma.propertyFeature.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, iconKey: true },
    }).catch(() => [] as { id: string; name: string; iconKey: string }[]),
  ])

  if (!property) return notFound()

  const knownLocations = locationRows.map((r) => r.location)
  const initialData = {
    ...property,
    pricePerNight: Number(property.pricePerNight),
    stayDetails: (property.stayDetails as unknown as { label: string; value: string }[] | null) ?? [],
    gettingHere: (property.gettingHere as unknown as { time: string; from: string; distance?: string }[] | null) ?? [],
    roomTypes: property.roomTypes.map((rt) => ({
      id: rt.id,
      classType: rt.classType,
      name: rt.name,
      totalUnits: rt.totalUnits,
      pricePerNight: Number(rt.pricePerNight),
      maxGuests: rt.maxGuests,
      bedrooms: rt.bedrooms,
      bathrooms: rt.bathrooms,
      imageUrl: rt.imageUrl ?? "",
      images: rt.images?.length ? rt.images : (rt.imageUrl ? [rt.imageUrl] : []),
    })),
    // Saved Story Sections so the live preview shows the brochure spine too.
    sections: property.sections.map((s) => ({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle,
      body: s.body,
      imageUrl: s.imageUrl,
    })),
    experiences: (property.experiences as unknown as { id?: string; title: string; description: string; imageUrl?: string | null }[] | null) ?? [],
  }

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="rounded-lg text-[#1B3A5C]/40 hover:text-[#1B3A5C] hover:bg-[#1B3A5C]/5">
          <Link href={`/admin/properties/${id}`}><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Portfolio</p>
          <h2 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Edit Property</h2>
          <p className="text-[13px] text-[#1B3A5C]/45 mt-1">Update details for {property.title}.</p>
        </div>
      </div>

      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl p-6">
        <PropertyForm
          owners={owners}
          initialData={initialData}
          knownLocations={knownLocations}
          availableFeatures={features}
        />
      </div>
    </div>
  )
}
