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
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="rounded-lg text-[#1B3A5C]/40 hover:text-[#1B3A5C] hover:bg-[#1B3A5C]/5">
          <Link href={`/admin/properties/${id}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Portfolio</p>
          <h2 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Manage Media</h2>
          <p className="text-[13px] text-[#1B3A5C]/45 mt-1">
            {property.title} — {images.length} media item{images.length !== 1 ? "s" : ""}. The starred image is shown as the property thumbnail.
          </p>
        </div>
      </div>

      <ImageManager propertyId={id} initial={images} />
    </div>
  )
}
