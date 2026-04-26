import { prisma } from "@/lib/db"
import HomeClient from "@/components/public/HomeClient"

export default async function HomePage() {
  const [featured, allActive] = await Promise.all([
    prisma.property.findMany({
      where: { status: "ACTIVE" },
      include: { images: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }], take: 1 } },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 4,
    }),
    prisma.property.findMany({
      where: { status: "ACTIVE" },
      select: { title: true, slug: true, location: true },
      orderBy: [{ featured: "desc" }, { title: "asc" }],
    }),
  ])

  const serializedFeatured = featured.map((p) => ({
    ...p,
    pricePerNight: Number(p.pricePerNight),
  }))

  return <HomeClient featured={serializedFeatured} allProperties={allActive} />
}
