import { prisma } from "@/lib/db"
import { getPrimaryImageUrl } from "@/lib/property-media"
import { siteConfig } from "@/lib/site.config"
import ForOwnersClient, { type ForOwnersPortfolioItem } from "./ForOwnersClient"

// Marketing page with rarely-changing DB data — cache via ISR (refresh hourly).
export const revalidate = 3600

function firstSentence(text: string, max = 180) {
  const trimmed = text.trim()
  const sentenceEnd = trimmed.search(/(?<=[.!?])\s/)
  const cut = sentenceEnd === -1 ? trimmed : trimmed.slice(0, sentenceEnd)
  return cut.length > max ? `${cut.slice(0, max).trimEnd()}...` : cut
}

export default async function ForOwnersPage() {
  const properties = await prisma.property
    .findMany({
      where: { status: "ACTIVE" },
      include: { images: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }], take: 1 } },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 12,
    })
    .catch((err) => {
      console.error("[for-owners] property fetch failed:", err)
      return []
    })

  const portfolio: ForOwnersPortfolioItem[] = properties.map((p) => ({
    slug: p.slug,
    name: p.title,
    location: p.location,
    desc: firstSentence(p.description),
    image: getPrimaryImageUrl(p.images),
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    maxGuests: p.maxGuests,
    featured: p.featured,
  }))

  const contact = {
    siteName: siteConfig.name,
    email: siteConfig.contact.email,
    phone: siteConfig.contact.phone,
    phoneHref: siteConfig.contact.phoneHref,
    address: siteConfig.contact.address,
  }

  return <ForOwnersClient portfolio={portfolio} contact={contact} />
}
