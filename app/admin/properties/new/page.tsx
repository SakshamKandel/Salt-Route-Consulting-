import { prisma } from "@/lib/db"
import { PropertyForm } from "../PropertyForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function NewPropertyPage() {
  const [owners, locationRows, features] = await Promise.all([
    prisma.user.findMany({
      where: { role: "OWNER" },
      select: { id: true, name: true, email: true }
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
  const knownLocations = locationRows.map((r) => r.location)

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      <div className="flex flex-wrap items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/properties"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div className="min-w-0">
          <h2 className="text-2xl md:text-3xl font-display text-navy">Add New Property</h2>
          <p className="text-slate-500">Create a new property listing.</p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 sm:p-6 shadow-sm">
        <PropertyForm owners={owners} knownLocations={knownLocations} availableFeatures={features} />
      </div>
    </div>
  )
}
