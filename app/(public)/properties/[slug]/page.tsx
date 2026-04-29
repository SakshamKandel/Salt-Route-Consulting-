import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { notFound } from "next/navigation"
import PropertyDetailClient from "@/components/public/PropertyDetailClient"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const property = await prisma.property.findUnique({ where: { slug } })
  if (!property) return {}
  return {
    title: `${property.title} | Salt Route`,
    description: property.description.slice(0, 160),
  }
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params
  const session = await auth()

  const property = await prisma.property.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      images: { orderBy: { order: "asc" } },
      reviews: {
        where: { status: "PUBLISHED" },
        include: { 
          guest: { select: { name: true, image: true } },
          images: { select: { url: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      },
      _count: { select: { reviews: true } },
    },
  })

  if (!property) notFound()

  const wishlistItem = session?.user?.id
    ? await prisma.wishlist.findUnique({
        where: { userId_propertyId: { userId: session.user.id, propertyId: property.id } },
      })
    : null

  return (
    <PropertyDetailClient 
      property={{
        ...property,
        pricePerNight: Number(property.pricePerNight)
      }} 
      wishlistItem={!!wishlistItem}
    />
  )
}
