import { prisma } from "@/lib/db"
import { ServicesClient, type CollageProperty } from "@/components/public/ServicesClient"

// Revalidate every 5 minutes so the "The Stay" collage picks up newly
// published properties without needing a full redeploy.
export const revalidate = 300

async function getLatestPropertiesForCollage(limit = 3): Promise<CollageProperty[]> {
  const properties = await prisma.property.findMany({
    where: { status: "ACTIVE" },
    select: {
      slug: true,
      title: true,
      location: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
        take: 1,
        select: { url: true },
      },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
  })

  return properties.map((p) => ({
    slug: p.slug,
    title: p.title,
    location: p.location,
    imageUrl: p.images[0]?.url ?? null,
  }))
}

export default async function ServicesPage() {
  const latestProperties = await getLatestPropertiesForCollage(3).catch((err) => {
    console.error("[services] collage fetch failed:", err)
    return [] as CollageProperty[]
  })

  return <ServicesClient latestProperties={latestProperties} />
}
