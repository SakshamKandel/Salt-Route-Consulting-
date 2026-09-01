import { prisma } from "@/lib/db"
import HomeClient from "@/components/public/HomeClient"

// ISR: the homepage content (featured properties) changes infrequently.
// Cache the rendered page for 1 hour, then revalidate in the background.
// This eliminates a DB round-trip on every visit → near-instant reloads.
export const revalidate = 3600

export default async function HomePage() {
  const [featured, allActive] = await Promise.all([
    prisma.property
      .findMany({
        where: { status: "ACTIVE" },
        include: { images: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }], take: 1 } },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
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
