import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { SectionManager } from "./SectionManager"

export default async function PropertySectionsPage({
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
      sections: { orderBy: { order: "asc" } },
    },
  })

  if (!property) return notFound()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/admin/properties/${id}`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-display text-navy">Story Sections</h2>
          <p className="text-slate-500">
            {property.title} — add rich editorial sections to the public page (the view, dining, experiences, the host&apos;s story...).
          </p>
        </div>
      </div>

      <SectionManager propertyId={id} initial={property.sections} />
    </div>
  )
}
