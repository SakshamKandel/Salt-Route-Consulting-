import { prisma } from "@/lib/db"
import { getPrimaryImageUrl } from "@/lib/property-media"
import ForOwnersClient, { type ForOwnersPortfolioItem } from "./ForOwnersClient"

function firstSentence(text: string, max = 180) {
  const trimmed = text.trim()
  const sentenceEnd = trimmed.search(/(?<=[.!?])\s/)
  const cut = sentenceEnd === -1 ? trimmed : trimmed.slice(0, sentenceEnd)
  return cut.length > max ? cut.slice(0, max).trimEnd() + "…" : cut
}

export default async function ForOwnersPage() {
  const properties = await prisma.property.findMany({
    where: { status: "ACTIVE" },
    include: { images: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }], take: 1 } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 8,
  })

  const portfolio: ForOwnersPortfolioItem[] = properties.map((p) => ({
    slug: p.slug,
    name: p.title,
    location: p.location,
    desc: firstSentence(p.description),
    image: getPrimaryImageUrl(p.images),
  }))

  return <ForOwnersClient portfolio={portfolio} />
}
