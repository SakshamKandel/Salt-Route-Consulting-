/**
 * Shared shape of the public navigation payload.
 *
 * Lives outside the route handler so the client <Nav /> can import the types
 * without pulling server-only code (Prisma) into the browser bundle.
 */

export type NavShowcase = {
  image: string
  title: string
  copy: string
  href: string
  tag?: string
}

export type NavLink = {
  href: string
  label: string
  preview?: NavShowcase
}

export type NavCategory = {
  title: string
  href?: string
  preview?: NavShowcase
  links: NavLink[]
}

export type NavSectionData = {
  featured: NavShowcase | null
  categories: NavCategory[]
}

export type NavPayload = {
  destinations: NavSectionData
  experiences: NavSectionData
  story: NavSectionData
  journal: NavSectionData
  owners: NavSectionData
  meta: {
    propertyCount: number
    destinationCount: number
    phone: string
    phoneHref: string
    email: string
    brandName: string
  }
}

/** Stable ids so the client can merge API data into its static nav tree. */
export type NavSectionId = "destinations" | "experiences" | "story" | "journal" | "owners"

/** Shape returned by the property query inside app/api/public/nav/route.ts. */
export type NavProperty = {
  title: string
  slug: string
  location: string
  propertyType: string
  description: string
  tagline: string | null
  services: string[]
  featured: boolean
  image: string
}
