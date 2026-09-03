import { prisma } from "@/lib/db"
import HomeClient from "@/components/public/HomeClient"

// ISR: the homepage content (featured properties, guestbook) changes infrequently.
// Cache the rendered page for 1 hour, then revalidate in the background.
// This eliminates a DB round-trip on every visit → near-instant reloads.
export const revalidate = 3600

const DEFAULT_TESTIMONIALS = [
  {
    id: "t1",
    quote: "A beautiful tea-country base with the comfort and service needed for a truly memorable stay in Nepal.",
    name: "Véronique Lorenzo",
    role: "European Union Ambassador to Nepal",
    source: "Diplomatic Delegation",
    kind: "DIPLOMATIC" as const,
    rating: 5,
    location: "Ilam",
  },
  {
    id: "t2",
    quote: "A new favourite place in Nepal—and in the world. Serene, majestic, and warmly hosted with exquisite attention to detail.",
    name: "Dean & Jane Thompson",
    role: "United States Embassy, Kathmandu",
    source: "Diplomatic Delegation",
    kind: "DIPLOMATIC" as const,
    rating: 5,
    location: "Kathmandu Valley",
  },
  {
    id: "t3",
    quote: "An outstanding vision for calm, character, and sustainable opportunity in Nepal's historic hill towns.",
    name: "Dr. Swarnim Wagle",
    role: "Economist & Member of Parliament",
    source: "Distinguished Guest",
    kind: "DIPLOMATIC" as const,
    rating: 5,
    location: "Nepal",
  },
  {
    id: "t4",
    quote: "What an unforgettable stay! Sunshine Villa was definitely the highlight of our trip to Nepal. Beautifully located in nature, with outstanding rooms and the kindest staff out there.",
    name: "Evangelos Athanasiadis",
    role: "Guest",
    source: "Google Review",
    kind: "VERIFIED" as const,
    rating: 5,
    location: "Greece",
  },
  {
    id: "t5",
    quote: "We had an absolutely wonderful stay at Sunshine Villa, Fikkal! From the moment we arrived, we were welcomed with warm hospitality that made us feel right at home. The villa itself is beautifully maintained.",
    name: "Dr. Kanchan Ghimire",
    role: "Guest",
    source: "Google Review",
    kind: "VERIFIED" as const,
    rating: 5,
    location: "Nepal",
  },
  {
    id: "t6",
    quote: "The views of the Himalayas at dawn and the sunset over the tea gardens are breathtaking. Exemplary service, quiet luxury, and extraordinary culinary care.",
    name: "Adhish B.",
    role: "Guest",
    source: "Tripadvisor Review",
    kind: "VERIFIED" as const,
    rating: 5,
    location: "India",
  },
]

async function safeQuery<T>(label: string, run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run()
  } catch (err) {
    console.error(`[home] ${label} failed:`, err)
    return fallback
  }
}

export default async function HomePage() {
  const [featured, allActive, testimonials, guestReviews] = await Promise.all([
    safeQuery(
      "featured",
      () =>
        prisma.property.findMany({
          where: { status: "ACTIVE" },
          include: {
            images: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }], take: 1 },
            reviews: { where: { status: "PUBLISHED" }, select: { rating: true } },
          },
          orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        }),
      [],
    ),

    safeQuery(
      "all-active",
      () =>
        prisma.property.findMany({
          where: { status: "ACTIVE" },
          select: { title: true, slug: true, location: true },
          orderBy: [{ featured: "desc" }, { title: "asc" }],
        }),
      [],
    ),

    safeQuery(
      "testimonials",
      async () => {
        const delegate = (prisma as unknown as { testimonial?: { findMany: (args: unknown) => Promise<unknown[]> } }).testimonial
        if (delegate?.findMany) {
          const rows = (await delegate.findMany({
            where: { published: true },
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          })) as typeof DEFAULT_TESTIMONIALS
          if (rows && rows.length > 0) return rows
        }
        return DEFAULT_TESTIMONIALS
      },
      DEFAULT_TESTIMONIALS,
    ),

    // Genuine guest reviews submitted after a completed stay.
    safeQuery(
      "reviews",
      () =>
        prisma.review.findMany({
          where: { status: "PUBLISHED" },
          include: {
            guest: { select: { name: true } },
            property: { select: { title: true, slug: true, location: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 6,
        }),
      [],
    ),
  ])

  const serializedFeatured = featured.map(({ reviews, ...p }) => ({
    ...p,
    pricePerNight: Number(p.pricePerNight),
    rating: reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null,
    reviewCount: reviews.length,
  }))

  const finalTestimonials = testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS

  return (
    <HomeClient
      featured={serializedFeatured}
      allProperties={allActive}
      testimonials={finalTestimonials}
      guestReviews={guestReviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        guestName: r.guest.name ?? "Verified Guest",
        propertyTitle: r.property.title,
        propertySlug: r.property.slug,
        location: r.property.location,
        createdAt: r.createdAt.toISOString(),
      }))}
    />
  )
}
