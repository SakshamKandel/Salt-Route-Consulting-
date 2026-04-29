/**
 * Site-wide configuration — single source of truth.
 *
 * Sensitive values (SMTP credentials, secret keys) live in .env only.
 * Public/branding values that appear in UI or emails live here as
 * env-overridable constants so they can be changed in one place.
 */

export const siteConfig = {
  /** Canonical name used in UI, emails, and meta tags */
  name: process.env.SITE_NAME ?? "Salt Route Consulting",

  /** Short group/brand name used in bylines and compact labels */
  brandName: process.env.SITE_BRAND_NAME ?? "Salt Route Group",

  /** One-line tagline */
  tagline: process.env.SITE_TAGLINE ?? "Boutique Stays & Consulting · Nepal",

  /** The country / region descriptor used in public copy */
  region: process.env.SITE_REGION ?? "Nepal",

  /** Production base URL — NEXTAUTH_URL is the canonical env var */
  url: process.env.NEXTAUTH_URL ?? process.env.SITE_URL ?? "https://saltroutegroup.com",

  /** Contact details — override via .env */
  contact: {
    email: process.env.INFO_EMAIL ?? process.env.ENQUIRIES_EMAIL ?? "info@saltroutegroup.com",
    supportEmail: process.env.SUPPORT_EMAIL ?? "support@saltroutegroup.com",
    /** The "From" address used in all outgoing emails */
    fromEmail: process.env.SMTP_FROM ?? `"Salt Route Consulting" <noreply@saltroutegroup.com>`,
    /** Fallback admin notification recipient if no admin users in DB */
    adminEmail: process.env.ADMIN_EMAIL ?? "admin@saltroutegroup.com",
    phone: process.env.CONTACT_PHONE ?? "+977 980 130 0001",
    phoneHref: process.env.CONTACT_PHONE_HREF ?? "tel:+9779801300001",
    address: process.env.CONTACT_ADDRESS ?? "P8FW+78R, Kathmandu 44600, Nepal",
    addressFull: process.env.CONTACT_ADDRESS_FULL ?? "Salt Route Group HQ, P8FW+78R, Kathmandu 44600, Nepal",
    /** Google Maps or embed URL for the office location */
    mapUrl: process.env.CONTACT_MAP_URL ?? "https://maps.google.com/?q=P8FW%2B78R,Kathmandu+44600,Nepal",
  },

  /** Social media links — override via .env or set to "" to hide */
  social: {
    instagram: process.env.SOCIAL_INSTAGRAM ?? "",
    facebook: process.env.SOCIAL_FACEBOOK ?? "",
    whatsapp: process.env.SOCIAL_WHATSAPP ?? "https://wa.me/9779801300001",
  },

  /** Currency configuration */
  currency: {
    code: process.env.CURRENCY_CODE ?? "NPR",
    symbol: process.env.CURRENCY_SYMBOL ?? "NPR",
    locale: process.env.CURRENCY_LOCALE ?? "en-NP",
  },

  /** Email subjects — override to customise tone */
  emailSubjects: {
    bookingReceived: (code: string) =>
      process.env.EMAIL_SUBJECT_BOOKING_RECEIVED
        ? process.env.EMAIL_SUBJECT_BOOKING_RECEIVED.replace("{code}", code)
        : `Booking Request Received: ${code}`,
    inquiryReceived: () =>
      process.env.EMAIL_SUBJECT_INQUIRY_RECEIVED ?? "We Received Your Enquiry: Salt Route",
    newBookingAdmin: (code: string, property: string) =>
      `New Booking Request: ${code} | ${property}`,
    newInquiryAdmin: (subject: string) => `New Enquiry: ${subject}`,
  },

  /** Rate limits — tune per environment */
  rateLimits: {
    bookingsPerHour: Number(process.env.RATE_LIMIT_BOOKINGS_PER_HOUR ?? 10),
    inquiriesPerHour: Number(process.env.RATE_LIMIT_INQUIRIES_PER_HOUR ?? 15),
    reviewsPerDay: Number(process.env.RATE_LIMIT_REVIEWS_PER_DAY ?? 3),
  },

  /** Pagination defaults */
  pagination: {
    defaultPageSize: Number(process.env.DEFAULT_PAGE_SIZE ?? 25),
  },

  /** Analytics cache TTL in seconds */
  cache: {
    analyticsTtl: Number(process.env.ANALYTICS_CACHE_TTL ?? 300),
  },
} as const

/** Convenience getter — admin URL for a given path */
export function adminUrl(path: string) {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`
}

export default siteConfig
