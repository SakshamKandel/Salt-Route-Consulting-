import { prisma } from "@/lib/db"
import { PropertyForm } from "../PropertyForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function NewPropertyPage() {
  const [owners, locationRows] = await Promise.all([
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
  ])
  const knownLocations = locationRows.map((r) => r.location)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/properties"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h2 className="text-3xl font-display text-navy">Add New Property</h2>
          <p className="text-slate-500">Create a new property listing.</p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <PropertyForm owners={owners} knownLocations={knownLocations} />
      </div>
    </div>
  )
}
