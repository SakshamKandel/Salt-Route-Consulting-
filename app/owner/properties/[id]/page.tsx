import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import PropertyDetailClient from "@/components/public/PropertyDetailClient"

export default async function OwnerPropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  
  const { id } = await params
  
  const property = await prisma.property.findUnique({
    where: { id, ownerId: session.user.id },
    include: {
      images: { orderBy: { order: "asc" } },
      reviews: {
        where: { status: "PUBLISHED" },
        include: { guest: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 6,
      },
      _count: { select: { reviews: true } },
    },
  })

  if (!property) return notFound()

  return (
    <div className="-m-8 md:-m-14">
      <PropertyDetailClient 
        property={{
          ...property,
          pricePerNight: Number(property.pricePerNight)
        }} 
        wishlistItem={false}
        isOwnerView={true}
      />
    </div>
  )
}
