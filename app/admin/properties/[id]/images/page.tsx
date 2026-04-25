import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ImageManager } from "./ImageManager"

export default async function PropertyImagesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [property, images] = await Promise.all([
    prisma.property.findUnique({ where: { id }, select: { id: true, title: true } }),
    prisma.propertyImage.findMany({
      where: { propertyId: id },
      orderBy: { order: "asc" },
    }),
  ])

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
          <h2 className="text-3xl font-display text-navy">Manage Media</h2>
          <p className="text-slate-500">
            {property.title} - {images.length} media item{images.length !== 1 ? "s" : ""}. The starred image is shown as the property thumbnail.
          </p>
        </div>
      </div>

      <ImageManager propertyId={id} initial={images} />
    </div>
  )
}
