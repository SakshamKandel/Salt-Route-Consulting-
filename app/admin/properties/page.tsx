import { prisma } from "@/lib/db"
import { PropertiesTable } from "./PropertiesTable"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function AdminPropertiesPage() {
  const properties = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      location: true,
      status: true,
      pricePerNight: true,
    },
  })

  const rows = properties.map((p) => ({
    id: p.id,
    title: p.title,
    location: p.location,
    status: p.status,
    pricePerNight: Number(p.pricePerNight),
  }))

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display text-navy">Properties</h2>
          <p className="text-slate-500">Manage all property listings, availability, and details.</p>
        </div>
        <Button asChild className="bg-navy text-cream">
          <Link href="/admin/properties/new">
            <Plus className="w-4 h-4 mr-2" /> Add Property
          </Link>
        </Button>
      </div>

      <PropertiesTable properties={rows} />
    </div>
  )
}
