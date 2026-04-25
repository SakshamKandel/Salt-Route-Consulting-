import { prisma } from "@/lib/db"
import HomeClient from "@/components/public/HomeClient"

async function getFeaturedProperties() {
  return prisma.property.findMany({
    where: { status: "ACTIVE" },
    include: { images: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }], take: 1 } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 4,
  })
}

export default async function HomePage() {
  const featured = await getFeaturedProperties()
  const serializedFeatured = featured.map(p => ({
    ...p,
    pricePerNight: Number(p.pricePerNight)
  }))
  return <HomeClient featured={serializedFeatured} />
}
