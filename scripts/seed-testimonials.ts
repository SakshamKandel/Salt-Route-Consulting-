/**
 * Seed the curated guestbook / testimonials shown on public marketing pages.
 *
 * Idempotent — matches on `name` and never overwrites rows an editor has since
 * updated, so it is safe to re-run. No guest photography is stored: the
 * editorial design presents words only.
 *
 *   npx tsx scripts/seed-testimonials.ts
 */
import dotenv from "dotenv"
dotenv.config({ path: ".env" })
dotenv.config({ path: ".env.local", override: true })

type Seed = {
  quote: string
  name: string
  role?: string
  source?: string
  kind: "DIPLOMATIC" | "VERIFIED"
  rating: number
  location?: string
  featured: boolean
  order: number
}

const TESTIMONIALS: Seed[] = [
  {
    kind: "DIPLOMATIC",
    name: "Véronique Lorenzo",
    role: "European Union Ambassador to Nepal",
    quote:
      "A beautiful tea-country base with the comfort and service needed for a truly memorable stay in Nepal.",
    rating: 5,
    featured: true,
    order: 1,
  },
  {
    kind: "DIPLOMATIC",
    name: "Dean & Jane Thompson",
    role: "United States Embassy, Kathmandu",
    quote:
      "A new favourite place in Nepal—and in the world. Serene, majestic, and warmly hosted with exquisite attention to detail.",
    rating: 5,
    featured: true,
    order: 2,
  },
  {
    kind: "DIPLOMATIC",
    name: "Dr. Swarnim Wagle",
    role: "Economist & Member of Parliament",
    quote:
      "An outstanding vision for calm, character, and sustainable opportunity in Nepal's historic hill towns.",
    rating: 5,
    featured: true,
    order: 3,
  },
  {
    kind: "VERIFIED",
    name: "Evangelos Athanasiadis",
    source: "Verified Google Review",
    quote:
      "What an unforgettable stay! Sunshine Villa was definitely the highlight of our trip to Nepal. Beautifully located in nature, with outstanding rooms and the kindest staff out there.",
    rating: 5,
    location: "Sunshine Villa",
    featured: false,
    order: 4,
  },
  {
    kind: "VERIFIED",
    name: "Dr. Kanchan Ghimire",
    source: "Verified Google Review",
    quote:
      "We had an absolutely wonderful stay at Sunshine Villa, Fikkal! From the moment we arrived, we were welcomed with warm hospitality that made us feel right at home. The villa itself is beautifully maintained.",
    rating: 5,
    location: "Sunshine Villa",
    featured: false,
    order: 5,
  },
  {
    kind: "VERIFIED",
    name: "Adhish B.",
    source: "Verified Tripadvisor Review",
    quote:
      "The views of the Himalayas at dawn and the sunset over the tea gardens are breathtaking. Exemplary service, quiet luxury, and extraordinary culinary care.",
    rating: 5,
    featured: false,
    order: 6,
  },
]

async function main() {
  const { prisma } = await import("../lib/db")

  let created = 0
  let skipped = 0

  for (const item of TESTIMONIALS) {
    const existing = await prisma.testimonial.findFirst({ where: { name: item.name } })
    if (existing) {
      skipped += 1
      continue
    }
    await prisma.testimonial.create({ data: item })
    created += 1
  }

  const total = await prisma.testimonial.count()
  console.log(`testimonials: created=${created} skipped=${skipped} total=${total}`)
}

main()
  .catch((e) => {
    console.error("SEED ERROR:", e?.message ?? e)
    process.exitCode = 1
  })
  .finally(async () => {
    const { prisma } = await import("../lib/db")
    await prisma.$disconnect()
  })
