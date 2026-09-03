import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"
import { journalArticles } from "@/lib/journal"
import type {
  NavCategory,
  NavLink,
  NavPayload,
  NavProperty,
  NavSectionData,
  NavShowcase,
} from "@/lib/nav-types"
import { OWNER_SERVICES } from "@/lib/owner-services"
import { siteConfig } from "@/lib/site.config"

/**
 * Navigation payload for the public mega-menu.
 *
 * The header is a client component that lives in the persistent public layout,
 * so it cannot query the database directly. This route is the single source of
 * truth for "what actually exists on the site": live properties (grouped by
 * destination), the services those properties really offer, published journal
 * articles, and the routable owner-service pages.
 *
 * Cached for 5 minutes, with a stale-while-revalidate window so a cold cache
 * never blocks the header.
 */
export const revalidate = 300

const FALLBACK_IMAGE = "/images/marketing/himalayan-retreat-exterior.png"

function firstSentence(text: string, max = 150) {
  const trimmed = (text ?? "").trim()
  if (!trimmed) return ""
  const sentenceEnd = trimmed.search(/(?<=[.!?])\s/)
  const cut = sentenceEnd === -1 ? trimmed : trimmed.slice(0, sentenceEnd)
  return cut.length > max ? `${cut.slice(0, max).trimEnd()}...` : cut
}

function truncateLabel(text: string, max = 46) {
  const trimmed = (text ?? "").trim().replace(/\s+/g, " ")
  return trimmed.length > max ? `${trimmed.slice(0, max).trimEnd()}...` : trimmed
}

function cityOf(location: string) {
  return (location ?? "").split(",")[0]?.trim() || "Nepal"
}

function regionOf(location: string) {
  const parts = (location ?? "").split(",").map((part) => part.trim()).filter(Boolean)
  return parts[parts.length - 1] || "Nepal"
}

function propertyShowcase(
  property: NavProperty,
  tag?: string,
): NavShowcase {
  return {
    image: property.image || FALLBACK_IMAGE,
    title: property.title,
    copy: property.tagline?.trim() || firstSentence(property.description),
    href: `/properties/${property.slug}`,
    tag: tag ?? property.propertyType,
  }
}

async function getProperties(): Promise<NavProperty[]> {
  const rows = await prisma.property.findMany({
    where: { status: "ACTIVE" },
    select: {
      title: true,
      slug: true,
      location: true,
      propertyType: true,
      description: true,
      tagline: true,
      services: true,
      featured: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
        take: 1,
        select: { url: true },
      },
    },
    orderBy: [{ featured: "desc" }, { title: "asc" }],
    take: 24,
  })

  return rows.map((row) => ({
    title: row.title,
    slug: row.slug,
    location: row.location,
    propertyType: row.propertyType,
    description: row.description,
    tagline: row.tagline,
    services: row.services ?? [],
    featured: row.featured,
    image: row.images[0]?.url ?? FALLBACK_IMAGE,
  }))
}

function buildDestinations(properties: NavProperty[]): NavSectionData {
  if (properties.length === 0) {
    return {
      featured: {
        image: FALLBACK_IMAGE,
        title: "The Salt Route Collection",
        copy: "Our portfolio is being curated right now. Speak with the concierge for private, off-market stays across Nepal.",
        href: "/properties",
        tag: "Coming Soon",
      },
      categories: [],
    }
  }

  const byCity = new Map<string, NavProperty[]>()
  for (const property of properties) {
    const city = cityOf(property.location)
    const bucket = byCity.get(city)
    if (bucket) bucket.push(property)
    else byCity.set(city, [property])
  }

  const categories: NavCategory[] = [...byCity.entries()].slice(0, 4).map(([city, list]) => {
    const lead = list[0]
    return {
      title: city,
      href: `/properties?location=${encodeURIComponent(city)}`,
      preview: {
        image: lead.image,
        title: `${city}, ${regionOf(lead.location)}`,
        copy: firstSentence(lead.description),
        href: `/properties?location=${encodeURIComponent(city)}`,
        tag: `${list.length} ${list.length === 1 ? "stay" : "stays"}`,
      },
      links: [
        { href: `/properties?location=${encodeURIComponent(city)}`, label: `All stays in ${city}` },
        ...list.slice(0, 5).map((property) => ({
          href: `/properties/${property.slug}`,
          label: property.title,
          preview: propertyShowcase(property, city),
        })),
      ],
    }
  })

  const hero = properties.find((property) => property.featured) ?? properties[0]

  return {
    featured: propertyShowcase(hero, hero.featured ? "Featured Sanctuary" : hero.propertyType),
    categories,
  }
}

function buildExperiences(properties: NavProperty[]): NavSectionData {
  const featured: NavShowcase = {
    image: "/images/marketing/private-himalayan-dining.png",
    title: "Experiences, Arranged Around You",
    copy: `Private cultural access, mountain expeditions, and restorative rituals — shaped by our concierge around the ${properties.length} stays we represent.`,
    href: "/services",
    tag: "Travel, Personally Shaped",
  }

  // Real services recorded against the live properties — de-duplicated, case
  // insensitive, and linked back to the stay that offers them.
  const seen = new Set<string>()
  const serviceLinks: NavLink[] = []
  for (const property of properties) {
    for (const service of property.services) {
      const name = service.trim()
      if (!name) continue
      const key = name.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      serviceLinks.push({
        href: `/properties/${property.slug}#experiences`,
        label: truncateLabel(name),
        preview: propertyShowcase(property, property.title),
      })
      if (serviceLinks.length >= 6) break
    }
    if (serviceLinks.length >= 6) break
  }

  const categories: NavCategory[] = [
    {
      title: "Signature Services",
      href: "/services",
      preview: {
        image: "/images/marketing/private-himalayan-dining.png",
        title: "Private Tables & Living Traditions",
        copy: "Rare private access to multi-generational Newari kitchens, secret courtyard dinners, and conversations with master artisans.",
        href: "/services",
        tag: "Culinary & Culture",
      },
      links: [
        { href: "/properties", label: "Tailored Sanctuary Stays" },
        { href: "/contact", label: "Private Itinerary Design" },
        { href: "/services", label: "Cultural Immersion & Craft" },
        { href: "/visual-journey", label: "A Tapestry of Nepal (13 Regions)" },
      ],
    },
    ...(serviceLinks.length > 0
      ? [
          {
            title: "At Our Stays",
            href: "/properties",
            preview: serviceLinks[0].preview,
            links: serviceLinks,
          } satisfies NavCategory,
        ]
      : []),
    {
      title: "Where To Go",
      href: "/properties",
      preview: properties[0] ? propertyShowcase(properties[0]) : undefined,
      links: properties.slice(0, 5).map((property) => ({
        href: `/properties/${property.slug}`,
        label: property.title,
        preview: propertyShowcase(property, cityOf(property.location)),
      })),
    },
    {
      title: "Design A Journey",
      href: "/contact",
      preview: {
        image: "/images/marketing/private-himalayan-dining.png",
        title: "Tell Us How You Want To Feel",
        copy: "Share your dates, pace, and appetite for adventure — our concierge builds the days around you.",
        href: "/contact",
        tag: "Crafted For You",
      },
      links: [
        { href: "/contact", label: "Design a Bespoke Itinerary" },
        { href: "/contact", label: "Private Photography Journeys" },
        { href: "/contact", label: "Multi-Generation Family Travel" },
        { href: `mailto:${siteConfig.contact.email}`, label: "Email the concierge" },
      ],
    },
  ]

  return { featured, categories }
}

function buildStory(properties: NavProperty[]): NavSectionData {
  const regions = new Set(properties.map((property) => regionOf(property.location)))

  return {
    featured: {
      image: "/images/marketing/nepalese-interior-details.png",
      title: "Hospitality With Roots",
      copy: `Fewer places, known more deeply. Today we represent ${properties.length} ${properties.length === 1 ? "stay" : "stays"} across ${regions.size || 1} ${regions.size === 1 ? "region" : "regions"} of Nepal.`,
      href: "/about",
      tag: "Salt Route Ethos",
    },
    categories: [
      {
        title: "Who We Are",
        href: "/about",
        links: [
          { href: "/about", label: "The Salt Route Story" },
          { href: "/about", label: "Purpose-Led Hospitality" },
          { href: "/about", label: "Our Guiding Values" },
          { href: "/about", label: "Sustainable Stewardship" },
        ],
      },
      {
        title: "The Portfolio",
        href: "/properties",
        links: properties.slice(0, 5).map((property) => ({
          href: `/properties/${property.slug}`,
          label: property.title,
          preview: propertyShowcase(property, cityOf(property.location)),
        })),
      },
      {
        title: "What We Do",
        href: "/services",
        links: [
          { href: "/properties", label: "Curated Stays" },
          { href: "/services", label: "Experiences & Itineraries" },
          { href: "/for-owners", label: "Owner Representation" },
          { href: "/visual-journey", label: "Visual Journey of Nepal" },
        ],
      },
      {
        title: "Talk To Us",
        href: "/contact",
        links: [
          { href: "/contact", label: "Speak With Our Concierge" },
          { href: `mailto:${siteConfig.contact.email}`, label: siteConfig.contact.email },
          { href: siteConfig.contact.phoneHref, label: siteConfig.contact.phone },
          { href: "/faq", label: "Frequently Asked Questions" },
        ],
      },
    ],
  }
}

function buildJournal(): NavSectionData {
  const articles = journalArticles
  if (articles.length === 0) {
    return {
      featured: null,
      categories: [],
    }
  }

  const lead = articles[0]
  const featured: NavShowcase = {
    image: lead.image,
    title: lead.title,
    copy: lead.excerpt,
    href: `/journal/${lead.slug}`,
    tag: lead.category,
  }

  const byCategory = new Map<string, NavLink[]>()
  for (const article of articles) {
    const key = article.category || "Field Notes"
    const bucket = byCategory.get(key)
    const link: NavLink = {
      href: `/journal/${article.slug}`,
      label: article.title,
      preview: {
        image: article.image,
        title: article.title,
        copy: article.excerpt,
        href: `/journal/${article.slug}`,
        tag: article.readTime,
      },
    }
    if (bucket) bucket.push(link)
    else byCategory.set(key, [link])
  }

  const categories: NavCategory[] = [...byCategory.entries()].slice(0, 4).map(([category, links]) => ({
    title: category,
    href: "/journal",
    preview: links[0].preview,
    links: [{ href: "/journal", label: `All ${category} Dispatches` }, ...links.slice(0, 4)],
  }))

  return { featured, categories }
}

function buildOwners(properties: NavProperty[]): NavSectionData {
  return {
    featured: {
      image: "/images/marketing/sunshine-villa-main.png",
      title: "Partner With Salt Route",
      copy: "We partner with visionary owners of boutique properties, historic estates, and luxury camps to elevate brand positioning, distribution, and guest experience.",
      href: "/for-owners",
      tag: "Sanctuary Partnership",
    },
    categories: [
      {
        title: "Our Services",
        href: "/for-owners",
        preview: {
          image: "/images/marketing/boutique-office-team.png",
          title: "Five Disciplines, One Team",
          copy: "Brand, commercial strategy, operations, asset care, and owner reporting — delivered as one connected programme.",
          href: "/for-owners",
          tag: "Partnership",
        },
        links: OWNER_SERVICES.map((service) => ({
          href: `/for-owners/${service.slug}`,
          label: service.navLabel,
          preview: {
            image: "/images/marketing/boutique-office-team.png",
            title: service.title,
            copy: service.summary,
            href: `/for-owners/${service.slug}`,
            tag: service.eyebrow,
          },
        })),
      },
      {
        title: "Represented Stays",
        href: "/for-owners#portfolio",
        preview: properties[0] ? propertyShowcase(properties[0]) : undefined,
        links: properties.slice(0, 5).map((property) => ({
          href: `/properties/${property.slug}`,
          label: property.title,
          preview: propertyShowcase(property, cityOf(property.location)),
        })),
      },
      {
        title: "How We Work",
        href: "/for-owners#owner-enquiry",
        links: [
          { href: "/for-owners#owner-enquiry", label: "Submit Your Property" },
          { href: "/for-owners", label: "Partnership Overview" },
          { href: "/contact", label: "Request a Confidential Review" },
          { href: siteConfig.contact.phoneHref, label: siteConfig.contact.phone },
        ],
      },
      {
        title: "Owner Access",
        href: "/login",
        links: [
          { href: "/login", label: "Owner Dashboard Login" },
          { href: "/contact", label: "Schedule a Video Call" },
          { href: `mailto:${siteConfig.contact.email}`, label: siteConfig.contact.email },
          { href: "/faq", label: "Owner FAQ" },
        ],
      },
    ],
  }
}

function emptyPayload(): NavPayload {
  return {
    destinations: { featured: null, categories: [] },
    experiences: { featured: null, categories: [] },
    story: { featured: null, categories: [] },
    journal: buildJournal(),
    owners: { featured: null, categories: [] },
    meta: {
      propertyCount: 0,
      destinationCount: 0,
      phone: siteConfig.contact.phone,
      phoneHref: siteConfig.contact.phoneHref,
      email: siteConfig.contact.email,
      brandName: siteConfig.brandName,
    },
  }
}

export async function GET() {
  let properties: NavProperty[] = []
  try {
    properties = await getProperties()
  } catch (error) {
    // A cold database must never break the site header — fall back to the
    // editorial content, which has no database dependency.
    console.error("[nav] property fetch failed:", error)
    const fallback = emptyPayload()
    fallback.destinations = buildDestinations([])
    fallback.story = buildStory([])
    fallback.experiences = buildExperiences([])
    fallback.owners = buildOwners([])
    return NextResponse.json(fallback, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    })
  }

  const destinations = new Set(properties.map((property) => cityOf(property.location)))

  const payload: NavPayload = {
    destinations: buildDestinations(properties),
    experiences: buildExperiences(properties),
    story: buildStory(properties),
    journal: buildJournal(),
    owners: buildOwners(properties),
    meta: {
      propertyCount: properties.length,
      destinationCount: destinations.size,
      phone: siteConfig.contact.phone,
      phoneHref: siteConfig.contact.phoneHref,
      email: siteConfig.contact.email,
      brandName: siteConfig.brandName,
    },
  }

  return NextResponse.json(payload, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" },
  })
}
