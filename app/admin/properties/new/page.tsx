import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { PropertyForm } from "../PropertyForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function NewPropertyPage() {
  const session = await auth()

  const [owners, locationRows, features] = await Promise.all([
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
  const knownLocations = locationRows.map((r) => r.location)

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-16">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="rounded-lg text-[#1B3A5C]/40 hover:text-[#1B3A5C] hover:bg-[#1B3A5C]/5">
          <Link href="/admin/properties"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div className="min-w-0">
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Portfolio</p>
          <h2 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Add New Property</h2>
          <p className="text-[13px] text-[#1B3A5C]/45 mt-1">Create a new property listing with live side-by-side preview.</p>
        </div>
      </div>

      <PropertyForm
        owners={owners}
        defaultOwnerId={session?.user?.id}
        knownLocations={knownLocations}
        availableFeatures={features}
      />
    </div>
  )
}
