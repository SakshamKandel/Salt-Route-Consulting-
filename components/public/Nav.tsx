"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, ChevronDown, Compass, House } from "lucide-react"
import { LanguageSwitcher } from "./LanguageSwitcher"
import type {
  NavCategory,
  NavPayload,
  NavSectionData,
  NavShowcase,
} from "@/lib/nav-types"

type Showcase = NavShowcase

type NavLink = {
  href: string
  label: string
  detail?: string
  preview?: Showcase
}

type NavCategoryNode = {
  title: string
  href?: string
  preview?: Showcase
  links: NavLink[]
}

type NavItem = {
  href: string
  label: string
  eyebrow: string
  description: string
  featured: Showcase
  categories: NavCategoryNode[]
}

const NAV_ENDPOINT = "/api/public/nav"

/**
 * Editorial scaffolding for each top-level entry.
 *
 * The live content (featured card + category columns) is fetched from
 * /api/public/nav so the menu always mirrors what actually exists on the site:
 * published properties grouped by destination, the services those properties
 * really list, journal articles, and the routable owner-service pages. These
 * objects are the fallback the menu renders before (or if) that fetch resolves.
 */
const guestLinks: NavItem[] = [
  {
    href: "/properties",
    label: "Destinations",
    eyebrow: "Curated Himalayan Sanctuaries",
    description:
      "Private addresses with an authentic sense of place, from the ancient Kathmandu Valley to high Himalayan valleys.",
    featured: {
      image: "/images/marketing/himalayan-retreat-exterior.png",
      tag: "Featured Sanctuary",
      title: "The Salt Route Collection",
      copy: "Perched along the serene pine ridges overlooking the Himalaya. Private sanctuaries crafted from local slate, timber, and Himalayan warmth.",
      href: "/properties",
    },
    categories: [
      {
        title: "Explore",
        href: "/properties",
        links: [
          { href: "/properties", label: "All Properties Collection" },
          { href: "/visual-journey", label: "A Tapestry of Nepal (13 Regions)" },
        ],
      },
    ],
  },
  {
    href: "/services",
    label: "Experiences",
    eyebrow: "Travel, Personally Shaped",
    description: "Quiet cultural access, private tables, and local encounters arranged around your pace.",
    featured: {
      image: "/images/marketing/private-himalayan-dining.png",
      tag: "Culinary & Culture",
      title: "Private Tables & Living Traditions",
      copy: "Rare private access to multi-generational Newari kitchens, secret courtyard dinners, and conversations with master artisans and spiritual custodians.",
      href: "/services",
    },
    categories: [
      {
        title: "Signature Services",
        href: "/services",
        links: [
          { href: "/properties", label: "Tailored Sanctuary Stays" },
          { href: "/contact", label: "Private Itinerary Design" },
          { href: "/services", label: "Cultural Immersion & Craft" },
          { href: "/visual-journey", label: "A Tapestry of Nepal (13 Regions)" },
        ],
      },
      {
        title: "Design A Journey",
        href: "/contact",
        links: [
          { href: "/contact", label: "Design a Bespoke Itinerary" },
          { href: "/contact", label: "Private Photography Journeys" },
          { href: "/contact", label: "Multi-Generation Family Travels" },
        ],
      },
    ],
  },
  {
    href: "/about",
    label: "Our Story",
    eyebrow: "Born in Nepal",
    description: "A hospitality collective built on considered design, local knowledge, and relationships that endure.",
    featured: {
      image: "/images/marketing/nepalese-interior-details.png",
      tag: "Salt Route Ethos",
      title: "Hospitality With Roots",
      copy: "Fewer places, known more deeply. We cultivate quiet luxury rooted in ancestral craftsmanship, intimate local relationships, and ecological reverence.",
      href: "/about",
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
          { href: "/journal", label: "Field Notes & Dispatches" },
          { href: "/faq", label: "Frequently Asked Questions" },
        ],
      },
    ],
  },
  {
    href: "/journal",
    label: "Journal",
    eyebrow: "Notes From The Route",
    description: "Plain-spoken field notes on Nepal's places, seasons, food, makers, and mountain communities.",
    featured: {
      image: "/images/marketing/himalayan-retreat-exterior.png",
      tag: "Field Dispatches",
      title: "Dispatches From The Route",
      copy: "Field notes on Nepal's quiet valleys, seasonal festivals, mountain kitchens, and conversations with the people shaping modern Himalayan culture.",
      href: "/journal",
    },
    categories: [
      {
        title: "Read",
        href: "/journal",
        links: [
          { href: "/journal", label: "All Field Dispatches" },
          { href: "/visual-journey", label: "Visual Journey of Nepal" },
        ],
      },
    ],
  },
  {
    href: "/for-owners",
    label: "For Owners",
    eyebrow: "Thoughtful Representation",
    description: "Strategy, positioning, distribution and guest care for remarkable independent sanctuaries.",
    featured: {
      image: "/images/marketing/sunshine-villa-main.png",
      tag: "Sanctuary Partnership",
      title: "Partner With Salt Route",
      copy: "We partner with visionary owners of boutique properties, historic estates, and luxury camps to elevate brand positioning, distribution, and guest experience.",
      href: "/for-owners",
    },
    categories: [
      {
        title: "Our Services",
        href: "/for-owners",
        links: [
          { href: "/for-owners", label: "Partnership Overview" },
          { href: "/for-owners/brand-marketing", label: "Brand & Storytelling" },
          { href: "/for-owners/revenue-distribution", label: "Revenue & Distribution" },
          { href: "/for-owners/guest-operations", label: "Guest Operations" },
        ],
      },
      {
        title: "Get Started",
        href: "/for-owners#owner-enquiry",
        links: [
          { href: "/for-owners#owner-enquiry", label: "Submit Your Property" },
          { href: "/login", label: "Owner Dashboard Login" },
          { href: "/contact", label: "Request Confidential Review" },
        ],
      },
    ],
  },
]

const ownerLinks: NavItem[] = [
  guestLinks[0],
  { ...guestLinks[4], label: "Owner Services" },
  guestLinks[2],
  guestLinks[3],
]

function toCategories(data: NavCategory[] | undefined, fallback: NavCategoryNode[]): NavCategoryNode[] {
  if (!data || data.length === 0) return fallback
  return data
}

function withLiveData(items: NavItem[], payload: NavPayload | null): NavItem[] {
  if (!payload) return items

  const sections: NavSectionData[] = [
    payload.destinations,
    payload.experiences,
    payload.story,
    payload.journal,
    payload.owners,
  ]

  return items.map((item, index) => {
    const section = sections[index]
    if (!section) return item
    return {
      ...item,
      featured: section.featured ?? item.featured,
      categories: toCategories(section.categories, item.categories),
    }
  })
}

export function Nav() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [hoveredPreview, setHoveredPreview] = useState<Showcase | null>(null)
  const [payload, setPayload] = useState<NavPayload | null>(null)

  // The header is rendered by the persistent public layout, so this runs once
  // per full page load. Failures are silent: the static editorial tree above
  // stays on screen.
  useEffect(() => {
    let cancelled = false
    fetch(NAV_ENDPOINT, { headers: { Accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: NavPayload | null) => {
        if (!cancelled && data) setPayload(data)
      })
      .catch(() => {
        /* keep the static fallback */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const ownerSection = pathname?.startsWith("/for-owners")
  const baseLinks = ownerSection ? ownerLinks : guestLinks
  const links = useMemo(() => withLiveData(baseLinks, payload), [baseLinks, payload])
  const activeItem = links.find((item) => item.label === activeMenu) ?? null
  const authenticated = status === "authenticated" && Boolean(session?.user)
  const accountHref =
    session?.user?.role === "ADMIN"
      ? "/admin/dashboard"
      : session?.user?.role === "OWNER"
        ? "/owner/dashboard"
        : "/account"
  const reserveHref = pathname?.startsWith("/properties/") ? "#booking" : "/properties"

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMobileOpen(false)
      setActiveMenu(null)
      setHoveredPreview(null)
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileOpen])

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveMenu(null)
        setHoveredPreview(null)
        setMobileOpen(false)
      }
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [])

  // Active showcase is either the actively hovered item/category preview or the default featured item
  const currentShowcase = hoveredPreview || (activeItem ? activeItem.featured : null)

  const handleToggleMenu = useCallback((label: string) => {
    setActiveMenu((prev) => (prev === label ? null : label))
    setHoveredPreview(null)
  }, [])

  const closeMenu = () => {
    setActiveMenu(null)
    setHoveredPreview(null)
  }

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[10000] h-[72px] border-b bg-navy text-cream transition-colors duration-300 ${
          activeItem ? "border-gold/30" : "border-cream/12"
        }`}
        onMouseLeave={closeMenu}
      >
        <div className="mx-auto flex h-full max-w-[94rem] items-center justify-between px-5 sm:px-8 lg:px-12">
          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="flex h-11 w-16 items-center justify-start lg:hidden cursor-pointer"
          >
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-cream">
              {mobileOpen ? "Close" : "Menu"}
            </span>
          </button>

          {/* Left primary links */}
          <nav className="hidden h-full items-stretch gap-1 lg:flex" aria-label="Primary navigation">
            {links.slice(0, 3).map((item) => (
              <NavTrigger
                key={item.label}
                item={item}
                active={activeMenu === item.label}
                onActivate={() => {
                  setActiveMenu(item.label)
                  setHoveredPreview(null)
                }}
                onClick={() => handleToggleMenu(item.label)}
              />
            ))}
          </nav>

          {/* Centered Logo */}
          <Link
            href={ownerSection ? "/for-owners" : "/"}
            className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center py-2"
            aria-label="Salt Route Group home"
          >
            <Image
              src="/brand/logo-light.png"
              alt="Salt Route Group"
              width={960}
              height={399}
              priority
              className="h-9 w-auto object-contain transition-transform duration-500 hover:scale-[1.03] sm:h-10"
            />
          </Link>

          {/* Right secondary links & actions */}
          <div className="flex h-full items-center gap-4 lg:gap-6">
            <nav className="hidden h-full items-stretch gap-1 lg:flex" aria-label="Secondary navigation">
              {links.slice(3).map((item) => (
                <NavTrigger
                  key={item.label}
                  item={item}
                  active={activeMenu === item.label}
                  onActivate={() => {
                    setActiveMenu(item.label)
                    setHoveredPreview(null)
                  }}
                  onClick={() => handleToggleMenu(item.label)}
                />
              ))}

              <Link
                href={authenticated ? accountHref : "/login"}
                className="flex items-center px-3 font-sans text-[10.5px] font-semibold uppercase tracking-[0.18em] text-cream/70 transition-colors hover:text-cream"
              >
                {authenticated ? "Account" : "Sign In"}
              </Link>

              <div className="flex items-center px-1 text-cream/70">
                <LanguageSwitcher transparent />
              </div>
            </nav>

            {/* Reserve CTA button */}
            <Link
              href={ownerSection ? "/for-owners#owner-enquiry" : reserveHref}
              className="group inline-flex min-h-[38px] items-center gap-2 rounded-full bg-gold px-5 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-navy-dark shadow-sm transition-all duration-300 hover:bg-gold-light hover:shadow-md"
            >
              <span>{ownerSection ? "Enquire" : "Reserve"}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* ── NAVY LUXURY MEGA-MENU ──────────────────────────────── */}
        <AnimatePresence>
          {activeItem && currentShowcase ? (
            <motion.div
              key={activeItem.label}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-full hidden px-4 sm:px-6 lg:px-8 xl:px-12 lg:block"
            >
              {/* Deep navy pavilion card */}
              <div className="mx-auto max-w-[1380px] overflow-hidden rounded-b-2xl border-x border-b border-cream/12 bg-navy bg-gradient-to-b from-navy-light via-navy to-navy-dark shadow-[0_32px_75px_-10px_rgba(16,41,67,0.55)] backdrop-blur-md">
                <div className="grid grid-cols-1 gap-10 p-8 lg:grid-cols-[330px_1fr] lg:p-10 xl:grid-cols-[370px_1fr] xl:gap-14 xl:p-12">
                  {/* Left Column: Featured Landscape Photography & Storytelling Card */}
                  <div className="flex flex-col justify-between">
                    <div>
                      {/* Photo Thumbnail */}
                      <Link
                        href={currentShowcase.href}
                        onClick={closeMenu}
                        className="group relative block aspect-[16/10] w-full overflow-hidden rounded-md border border-cream/12 bg-navy-dark shadow-md"
                      >
                        <Image
                          src={currentShowcase.image}
                          alt={currentShowcase.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 370px"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/60 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />
                        {currentShowcase.tag ? (
                          <span className="absolute bottom-2.5 left-3 rounded-full bg-navy-dark/70 px-2.5 py-0.5 font-sans text-[8.5px] font-semibold uppercase tracking-[0.2em] text-gold backdrop-blur-md">
                            {currentShowcase.tag}
                          </span>
                        ) : null}
                      </Link>

                      {/* Title & Evocative Story */}
                      <div className="mt-4">
                        <Link
                          href={currentShowcase.href}
                          onClick={closeMenu}
                          className="group block"
                        >
                          <h3 className="font-display text-2xl font-normal tracking-wide text-cream transition-colors group-hover:text-gold xl:text-[26px]">
                            {currentShowcase.title}
                          </h3>
                        </Link>
                        <p className="mt-2.5 text-[12.5px] font-light leading-relaxed text-cream/75 xl:text-[13px]">
                          {currentShowcase.copy}
                        </p>
                      </div>
                    </div>

                    {/* Explore CTA link */}
                    <div className="mt-5 pt-2">
                      <Link
                        href={currentShowcase.href}
                        onClick={closeMenu}
                        className="group inline-flex items-center gap-2 font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-gold transition-colors hover:text-gold-light"
                      >
                        <span>Explore</span>
                        <ArrowRight className="h-3.5 w-3.5 text-gold transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: Multi-Column Clean Directory Grid */}
                  <div
                    className="grid grid-cols-2 gap-x-8 gap-y-7 md:grid-cols-4 xl:gap-x-10"
                    onMouseLeave={() => setHoveredPreview(null)}
                  >
                    {activeItem.categories.map((category) => (
                      <div
                        key={category.title}
                        onMouseEnter={() => {
                          if (category.preview) setHoveredPreview(category.preview)
                        }}
                      >
                        {/* Category Heading in tracked uppercase gold typography */}
                        {category.href ? (
                          <Link
                            href={category.href}
                            onClick={closeMenu}
                            className="group block pb-1 transition-colors"
                          >
                            <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-gold transition-colors group-hover:text-gold-light">
                              {category.title}
                            </h4>
                          </Link>
                        ) : (
                          <div className="pb-1">
                            <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
                              {category.title}
                            </h4>
                          </div>
                        )}

                        {/* Clean Sub-links list */}
                        <ul className="mt-2 space-y-2" role="list">
                          {category.links.map((link) => (
                            <li key={`${category.title}-${link.label}`}>
                              <Link
                                href={link.href}
                                onClick={closeMenu}
                                onMouseEnter={() => {
                                  if (link.preview) setHoveredPreview(link.preview)
                                  else if (category.preview) setHoveredPreview(category.preview)
                                }}
                                className="group block text-[13px] font-light leading-snug text-cream/78 transition-all duration-200 hover:translate-x-1 hover:text-cream"
                              >
                                <span>{link.label}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      {/* ── MOBILE SLIDEOUT MENU ──────────────────────────────────── */}
      {mobileOpen ? (
        <div data-lenis-prevent className="fixed inset-0 z-[9999] overflow-y-auto bg-navy px-6 pb-14 pt-24 text-cream lg:hidden">
          <div className="mx-auto max-w-xl">
            <div className="mb-7 flex items-center gap-3 border-b border-cream/12 pb-5 text-cream/60">
              <Compass className="h-4 w-4 text-gold" />
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-cream">
                Explore Salt Route
              </p>
            </div>

            <nav className="space-y-4" aria-label="Mobile navigation">
              {links.map((item) => (
                <div
                  key={item.href}
                  className="overflow-hidden rounded-xl border border-cream/12 bg-navy-light p-5 text-cream shadow-sm"
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between font-display text-[1.65rem] leading-tight text-cream"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="h-4 w-4 text-gold" />
                  </Link>

                  <p className="mt-2 text-xs font-light leading-relaxed text-cream/70">
                    {item.description}
                  </p>

                  <div className="mt-4 border-t border-cream/12 pt-3">
                    <div className="grid grid-cols-2 gap-2">
                      {item.categories.flatMap((cat) => cat.links.slice(0, 2)).map((link, index) => (
                        <Link
                          key={`${item.href}-${link.label}-${index}`}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="block text-[11px] font-medium uppercase tracking-[0.14em] text-cream/75 transition-colors hover:text-cream"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <Link
                href={authenticated ? accountHref : "/login"}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl border border-cream/12 bg-navy-light p-4 font-display text-xl text-cream"
              >
                <House className="h-4 w-4 text-gold" />
                <span>{authenticated ? "Your Account" : "Sign In"}</span>
              </Link>

              <div className="pt-2">
                <LanguageSwitcher variant="mobile" onSelect={() => setMobileOpen(false)} />
              </div>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  )
}

function NavTrigger({
  item,
  active,
  onActivate,
  onClick,
}: {
  item: NavItem
  active: boolean
  onActivate: () => void
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onMouseEnter={onActivate}
      onClick={onClick}
      onFocus={onActivate}
      aria-expanded={active}
      className={`relative flex h-full items-center gap-1.5 px-3.5 font-sans text-[10.5px] font-semibold uppercase tracking-[0.18em] transition-colors duration-200 cursor-pointer ${
        active ? "text-cream" : "text-cream/68 hover:text-cream"
      }`}
    >
      <span>{item.label}</span>
      <ChevronDown
        className={`h-3 w-3 transition-transform duration-300 ${
          active ? "rotate-180 text-gold" : "text-cream/40"
        }`}
      />
      <span
        aria-hidden
        className={`absolute inset-x-3 bottom-0 h-px origin-left bg-gold transition-transform duration-300 ease-out-quart ${
          active ? "scale-x-100" : "scale-x-0"
        }`}
      />
    </button>
  )
}
