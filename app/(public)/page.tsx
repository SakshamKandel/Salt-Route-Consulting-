import { prisma } from "@/lib/db"
import HomeClient from "@/components/public/HomeClient"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [featured, allActive] = await Promise.all([
    prisma.property
      .findMany({
        where: { status: "ACTIVE" },
        include: { images: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }], take: 1 } },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: 4,
      })
      .catch((err) => {
        console.error("[home] featured fetch failed:", err)
        return []
      }),
    prisma.property
      .findMany({
        where: { status: "ACTIVE" },
        select: { title: true, slug: true, location: true },
        orderBy: [{ featured: "desc" }, { title: "asc" }],
      })
      .catch((err) => {
        console.error("[home] all-active fetch failed:", err)
        return []
      }),
  ])

  const serializedFeatured = featured.map((p) => ({
    ...p,
    pricePerNight: Number(p.pricePerNight),
  }))

  return <HomeClient featured={serializedFeatured} allProperties={allActive} />
}
