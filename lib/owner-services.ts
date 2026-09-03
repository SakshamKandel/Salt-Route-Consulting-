/**
 * Owner-service metadata shared by the /for-owners/[service] pages and the
 * public navigation.
 *
 * The service pages own the long-form content (image, capabilities, process,
 * outcomes); this module owns only the routing + labelling metadata so the nav
 * can list the real services without importing page-level image assets into a
 * route handler.
 */
export type OwnerServiceMeta = {
  slug: string
  /** Short marketing eyebrow shown above the title. */
  eyebrow: string
  /** Long editorial title used on the service page. */
  title: string
  /** One-line summary. */
  summary: string
  /** Short navigation label (menu-friendly). */
  navLabel: string
}

export const OWNER_SERVICES: OwnerServiceMeta[] = [
  {
    slug: "brand-marketing",
    eyebrow: "Brand, content & demand",
    title: "Global Marketing & Storytelling",
    summary:
      "We define the idea at the heart of your property, express it through exceptional content, and bring it to the audiences most likely to value it.",
    navLabel: "Brand & Storytelling",
  },
  {
    slug: "revenue-distribution",
    eyebrow: "Commercial strategy",
    title: "Revenue & Yield Distribution",
    summary:
      "Pricing, distribution, direct sales, and channel decisions work together to improve profitable occupancy while protecting long-term brand value.",
    navLabel: "Revenue & Distribution",
  },
  {
    slug: "guest-operations",
    eyebrow: "Hospitality & operations",
    title: "Guest Experience & Operations",
    summary:
      "We translate the brand promise into practical standards, warm hosting, thoughtful communication, and a calm operating rhythm for the team.",
    navLabel: "Guest Operations",
  },
  {
    slug: "property-enhancement",
    eyebrow: "Asset care & enhancement",
    title: "Property Enhancement & Care",
    summary:
      "From pre-opening readiness to seasonal maintenance, we prioritise improvements that strengthen the guest experience and the enduring value of the asset.",
    navLabel: "Asset Enhancement",
  },
  {
    slug: "owner-intelligence",
    eyebrow: "Reporting & owner control",
    title: "Owner Intelligence & Reporting",
    summary:
      "A clear owner view brings reservations, revenue, guest sentiment, and asset priorities together — without dragging you into daily management.",
    navLabel: "Owner Intelligence",
  },
]

export function getOwnerService(slug: string) {
  return OWNER_SERVICES.find((service) => service.slug === slug)
}
