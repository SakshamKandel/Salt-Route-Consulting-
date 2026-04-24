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

  const [property, owners] = await Promise.all([
    prisma.property.findUnique({ where: { id } }),
    prisma.user.findMany({
      where: { role: { in: ["OWNER", "ADMIN"] } },
      select: { id: true, name: true, email: true }
    })
  ])

  if (!property) return notFound()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/admin/properties/${id}`}><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h2 className="text-3xl font-display text-navy">Edit Property</h2>
          <p className="text-slate-500">Update details for {property.title}.</p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <PropertyForm owners={owners} initialData={property} />
      </div>
    </div>
  )
}
