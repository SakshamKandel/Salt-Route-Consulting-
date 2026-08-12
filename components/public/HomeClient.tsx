"use client"

import { useMemo, useState } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { Calendar, Users, MapPin } from "lucide-react"
import { getPrimaryImageUrl, type PropertyMediaLike } from "@/lib/property-media"
import { LuxuryButton } from "@/components/ui/luxury-button"
import { LuxuryLinkWithArrow } from "@/components/ui/luxury-link-with-arrow"
import { LocationCombobox, type ComboboxProperty } from "@/components/public/LocationCombobox"
import { journalArticles } from "@/lib/journal"
import {
  Reveal,
  RevealText,
  CurtainImage,
  ParallaxImage,
  KenBurns,
  EASE,
} from "@/components/public/motion"

// Lazy-load VisualJourney — it's a heavy below-the-fold section (framer-motion
// modal + lucide icons + 13-tile lightbox). Splitting it into its own chunk
// keeps the initial page JS lean and defers ~30KB until the user scrolls there.
const VisualJourney = dynamic(
  () => import("@/components/public/VisualJourney").then((m) => m.VisualJourney),
  {
    ssr: true,
    loading: () => <div className="py-10 md:py-16 bg-white" aria-hidden />,
  },
)

// Owned /public artwork — static imports give free blur placeholders.
import imgRetreatExterior from "@/public/luxury_himalayan_retreat_exterior_1777124225845.png"
import imgVillaMain from "@/public/Sunshine Villa Main.png"
import imgPrivateDining from "@/public/private_himalayan_dining_luxury_1777124309093.png"
import imgInteriorDetail from "@/public/luxury_nepalese_interior_details_1777124245155.png"
import imgTeam from "@/public/luxury_boutique_office_team.png"

type FeaturedProperty = {
  id: string
  title: string
  slug: string
  location: string
  images: PropertyMediaLike[]
  pricePerNight?: number
  description?: string
  propertyType?: string
  maxGuests?: number
  bedrooms?: number
  createdAt?: string | Date
}

// ─── HERO MEDIA ──────────────────────────────────────────────────────────────
// Poster-under-video pattern: the LCP frame ships as an eager next/image with
// fetchPriority=high; the muted video crossfades in on canplay. Both sit inside
// one shared Ken-Burns frame so they zoom in lockstep. Reduced-motion visitors
// get the still poster only.

const HERO_VIDEO =
  "https://res.cloudinary.com/diu4mp2f3/video/upload/f_auto,q_auto,c_limit,w_1920/v1780381657/salt-route/home-hero.mp4"
const HERO_POSTER =
  "https://res.cloudinary.com/diu4mp2f3/video/upload/f_auto,q_auto,so_0/v1780381657/salt-route/home-hero.jpg"

function HeroMedia() {
  const reduce = useReducedMotion()
  const [videoReady, setVideoReady] = useState(false)

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-navy">
      <KenBurns className="h-full w-full" duration={20} scale={1.06}>
        <Image
          src={HERO_POSTER}
          alt=""
          fill
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          className="object-cover"
        />
        {!reduce && (
          <video
            src={HERO_VIDEO}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-hidden
            onCanPlay={() => setVideoReady(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
              videoReady ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </KenBurns>
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/60" />
    </div>
  )
}

// ─── HERO SEARCH (LOGIC — restyle classNames only) ──────────────────────────

function HeroSearch({ properties }: { properties: ComboboxProperty[] }) {
  const router = useRouter()
  const today = new Date()
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)

  const [location, setLocation] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(2)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (location) params.set("location", location)
    if (checkIn) params.set("checkIn", checkIn)
    if (checkOut) params.set("checkOut", checkOut)
    if (guests > 0) params.set("guests", String(guests))
    const qs = params.toString()
    router.push(qs ? `/properties?${qs}` : "/properties")
  }

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white border border-navy/15 flex flex-col md:flex-row items-stretch"
    >
      {/* Location */}
      <label className="flex-1 w-full md:w-auto p-5 md:p-6 border-b md:border-b-0 md:border-r border-charcoal/10 group hover:bg-[#FBF9F4] transition-colors duration-500 cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border border-charcoal/10 flex items-center justify-center shrink-0">
            <MapPin className="w-3 h-3 text-charcoal/50" strokeWidth={1} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40 mb-1 font-medium">Location</p>
            <LocationCombobox
              value={location}
              onChange={setLocation}
              properties={properties}
              placeholder="Anywhere in Nepal"
              inputClassName="w-full font-sans text-sm text-charcoal font-medium tracking-wide bg-transparent border-0 outline-none placeholder:text-charcoal/30 placeholder:font-light"
            />
          </div>
        </div>
      </label>

      {/* Stay Period */}
      <label className="flex-1 w-full md:w-auto p-5 md:p-6 border-b md:border-b-0 md:border-r border-charcoal/10 group hover:bg-[#FBF9F4] transition-colors duration-500 cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border border-charcoal/10 flex items-center justify-center shrink-0">
            <Calendar className="w-3 h-3 text-charcoal/50" strokeWidth={1} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40 mb-1 font-medium">Stay Period</p>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <input
                type="date"
                value={checkIn}
                min={fmt(today)}
                onChange={(e) => {
                  setCheckIn(e.target.value)
                  if (checkOut && e.target.value && checkOut <= e.target.value) {
                    setCheckOut("")
                  }
                }}
                className="font-sans text-xs text-charcoal font-medium bg-transparent border-0 outline-none min-w-0 flex-1 basis-[7.5rem]"
              />
              <span className="text-charcoal/30 text-xs">to</span>
              <input
                type="date"
                value={checkOut}
                min={checkIn || fmt(tomorrow)}
                onChange={(e) => setCheckOut(e.target.value)}
                className="font-sans text-xs text-charcoal font-medium bg-transparent border-0 outline-none min-w-0 flex-1 basis-[7.5rem]"
              />
            </div>
          </div>
        </div>
      </label>

      {/* Guests */}
      <label className="flex-1 w-full md:w-auto p-5 md:p-6 group hover:bg-[#FBF9F4] transition-colors duration-500 cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border border-charcoal/10 flex items-center justify-center shrink-0">
            <Users className="w-3 h-3 text-charcoal/50" strokeWidth={1} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40 mb-1 font-medium">Guests</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGuests(Math.max(1, guests - 1))}
                disabled={guests <= 1}
                className="w-6 h-6 flex items-center justify-center border border-charcoal/20 text-charcoal/50 hover:border-charcoal/40 hover:text-charcoal disabled:opacity-30 transition-colors"
                aria-label="Decrease guests"
              >
                <span className="text-xs leading-none">&minus;</span>
              </button>
              <input
                type="number"
                min={1}
                max={20}
                value={guests}
                onChange={(e) => setGuests(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                className="w-10 font-sans text-sm text-charcoal font-medium tracking-wide bg-transparent border-0 outline-none text-center"
              />
              <button
                type="button"
                onClick={() => setGuests(Math.min(20, guests + 1))}
                disabled={guests >= 20}
                className="w-6 h-6 flex items-center justify-center border border-charcoal/20 text-charcoal/50 hover:border-charcoal/40 hover:text-charcoal disabled:opacity-30 transition-colors"
                aria-label="Increase guests"
              >
                <span className="text-xs leading-none">+</span>
              </button>
            </div>
          </div>
        </div>
      </label>

      {/* Search Button */}
      <button
        type="submit"
        className="w-full md:w-auto self-stretch bg-charcoal text-white px-8 lg:px-16 py-6 md:py-0 text-sm md:text-sm uppercase tracking-[0.18em] sm:tracking-[0.3em] font-sans hover:bg-gold transition-all duration-700 flex items-center justify-center min-h-[72px] md:min-h-[90px]"
      >
        Discover
      </button>
    </form>
  )
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

type VipReview = {
  id: string
  dateLines: string[]
  dateTime: string
  title?: string
  paragraphs: string[]
  emphasizedParagraphs?: number[]
  name: string
  credentials: string[]
  image: string
  imageAlt: string
  imageClassName: string
}

// Curated notes left by distinguished guests at Sunshine Villa. These are kept
// separate from booking-linked ratings because they are dated guestbook entries
// with their own attribution and imagery rather than scored platform reviews.
const VIP_REVIEWS: VipReview[] = [
  {
    id: "veronique-lorenzo",
    dateLines: ["04/11/24"],
    dateTime: "2024-11-04",
    title: "A perfect weekend retreat!",
    paragraphs: [
      "Great base to explore the beautiful tea country. This is an area of Nepal that needs to be more publicised. The landscapes are amazing and well worth developing a network of trails — but Sunshine Villa has the right level of comfort and service to attract higher-end tourists, so necessary for Nepal’s economy.",
      "A very pleasant surprise!",
      "Many thanks for the warm hospitality —",
    ],
    name: "Véronique Lorenzo",
    credentials: ["European Union", "Ambassador to Nepal"],
    image: "/vip-reviews/veronique-lorenzo.jpg",
    imageAlt: "Véronique Lorenzo standing before international flags",
    imageClassName: "object-cover object-center",
  },
  {
    id: "asian-trekking",
    dateLines: ["05/12/2024"],
    dateTime: "2024-12-05",
    paragraphs: [
      "Bedankt voor de hartelijke ontvangst op deze prachtige, rustige, bloemrijke locatie",
      "VILLA SUNSHINE.",
      "Vriendelijk personeel en fijne maaltijden.",
      "Leerrijke excursies.",
      "Succes in de onderneming.",
    ],
    emphasizedParagraphs: [1],
    name: "Noorweegse familie Dogghe",
    credentials: ["“Asian Trekking”"],
    image: "/vip-reviews/asian-trekking.jpg",
    imageAlt: "An Asian Trekking mountaineer holding the company sign",
    imageClassName: "object-cover object-center",
  },
  {
    id: "dean-jane-thompson",
    dateLines: ["7 APRIL 2025"],
    dateTime: "2025-04-07",
    paragraphs: [
      "SUNSHINE VILLA! A NEW FAVOURITE PLACE IN NEPAL. IN FACT, THE WORLD! BEAUTIFUL SETTING, SERENE ENVIRONMENT, AND AMAZING HOSPITALITY. WE’LL SPREAD THE WORD AND HOPE TO BE BACK SOON. THANK YOU FOR A GREAT STAY AND QUICK TOUR. WISHING YOU MUCH CONTINUED SUCCESS!",
    ],
    name: "Dean Jane Thompson",
    credentials: ["U.S. Ambassador to Nepal", "U.S. Embassy Kathmandu"],
    image: "/vip-reviews/dean-jane-thompson.jpg",
    imageAlt: "Official portrait supplied with the Dean Jane Thompson review",
    imageClassName: "object-contain object-center p-5 md:p-8",
  },
  {
    id: "jane-thompson",
    dateLines: ["7 April, 2025"],
    dateTime: "2025-04-07",
    paragraphs: [
      "What a lovely place to stop and take in the peace and beauty of Ilam. We so enjoyed the gracious hospitality. Comfortable accommodations and detailed furnishings and artwork. The kitchen sent out fresh delicious food for every meal.",
      "Thank you for a lovely retreat,",
    ],
    name: "Jane Thompson",
    credentials: ["USA"],
    image: "/vip-reviews/jane-thompson.png",
    imageAlt: "Jane Thompson",
    imageClassName: "object-cover object-[center_35%]",
  },
  {
    id: "imf-nepal",
    dateLines: ["December 15, 2025"],
    dateTime: "2025-12-15",
    paragraphs: [
      "Our stay here has been one of the best. The rooms are spacious with required amenities.",
      "Apart from that, the staffs here are courteous, helpful and always there when needed. They do everything asked.",
      "The food is good, fresh and healthy and the cooking staff can prepare most of the food asked. Their Bhutanese meal is tasty, different.",
      "The ambience is out of this world, the service is top-notch, the locality is near to many local tourist areas.",
      "Best wishes to the team for your future ventures.",
    ],
    name: "IMF Team (Nepal)",
    credentials: [],
    image: "/vip-reviews/imf-nepal.jpg",
    imageAlt: "International Monetary Fund emblem",
    imageClassName: "object-contain object-center p-7 md:p-10",
  },
  {
    id: "swarnim-wagle",
    dateLines: ["New Year 2081", "Baisakh 1", "April 13, 2024"],
    dateTime: "2024-04-13",
    paragraphs: [
      "Amazing location, outstanding taste and vision to transform a rustic property into a pleasant, verdant fragment of calm charm.",
      "Gracious and warm hospitality — this is exactly the model of what our hilltops across the country can become — a source of high-paying jobs and opportunities to stem the epic outflow of youth, revive local products and culture, and build prosperous, sustainable Nepali towns from places that folks fled decades ago in search of better lives.",
      "A renaissance moment for Nepal!",
    ],
    emphasizedParagraphs: [2],
    name: "Swarnim Wagle",
    credentials: [
      "Finance Minister of Nepal",
      "Member of Parliament (Tanahu)",
      "VP, Rastriya Swatantra Party",
    ],
    image: "/vip-reviews/swarnim-wagle.jpg",
    imageAlt: "Dr Swarnim Wagle in a formal portrait",
    imageClassName: "object-cover object-top",
  },
]

export default function HomeClient({
  featured = [],
  allProperties = [],
}: {
  featured?: FeaturedProperty[]
  allProperties?: ComboboxProperty[]
}) {
  const estates = useMemo(
    () =>
      featured.slice(0, 6).map((p) => ({
        id: p.id,
        name: p.title,
        location: p.location,
        image: getPrimaryImageUrl(p.images),
        href: `/properties/${p.slug}`,
        type: "Tailored Residence",
      })),
    [featured]
  )

  // Tailored Journeys — the arc of a stay, as a horizontal step-rail.
  const journeys = [
    {
      num: "01",
      title: "Arrive",
      desc: "Step into spaces crafted to harmonize with the local landscape. Leave the transit behind and let the quiet, unhurried pace of the environment set your new rhythm.",
    },
    {
      num: "02",
      title: "Feel",
      desc: "Engage deeply with your surroundings — from the warmth of natural architecture to the terroir of a morning pour-over, immerse yourself in the region's sensory detail.",
    },
    {
      num: "03",
      title: "Remember",
      desc: "Depart with more than a destination checked off. Carry forward a sense of renewal and a lasting, personal connection to the heritage and beauty of Nepal.",
    },
  ]

  // The Salt Route Standard — what every stay holds.
  const pillars = [
    {
      num: "01",
      kicker: "Stay",
      title: "Accommodations",
      image: imgInteriorDetail,
      alt: "Heritage interior detail",
      detail:
        "Handpicked homes and boutique retreats — from tea-country villas to mountain-view apartments. Every room considered, every view earned.",
    },
    {
      num: "02",
      kicker: "Taste",
      title: "Dining",
      image: imgPrivateDining,
      alt: "A private dining moment",
      detail:
        "Seasonal kitchens rooted in place — Nepali and Bhutanese cooking, produce from the hillside, and a private table whenever you wish.",
    },
    {
      num: "03",
      kicker: "Breathe",
      title: "Wellness & Nature",
      image: imgRetreatExterior,
      alt: "A retreat at altitude",
      detail:
        "Mornings that begin slowly. Gardens, trails, and quiet corners built into each property's natural setting.",
    },
    {
      num: "04",
      kicker: "Belong",
      title: "Service",
      image: imgTeam,
      alt: "The Salt Route team",
      detail:
        "Attentive local hosts who know every name and every shortcut — concierge care from first enquiry to last farewell.",
    },
  ]

  // Discover Nepal — destinations link into the properties filter.
  const destinations = [
    {
      name: "Ilam",
      note: "Tea country in the far east — misted hills, quiet mornings.",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop",
      href: "/properties?location=Ilam",
    },
    {
      name: "Kathmandu",
      note: "Living heritage — temples, courtyards, and old trade routes.",
      image: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1200&auto=format&fit=crop",
      href: "/properties?location=Kathmandu",
    },
    {
      name: "Pokhara",
      note: "Lakeside calm beneath the Annapurna skyline.",
      image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
      href: "/properties?location=Pokhara",
    },
    {
      name: "Chitwan",
      note: "Lowland jungle, slow rivers, and first light on the plains.",
      image: "https://images.unsplash.com/photo-1549366021-9f761d450615?q=80&w=1200&auto=format&fit=crop",
      href: "/properties?location=Chitwan",
    },
  ]

  // Journal teaser — three most recent stories, one lead + two side entries.
  const stories = journalArticles.slice(0, 3)

  // Featured-stay spotlight — always the LATEST property added (owner request),
  // so new listings surface on the homepage immediately.
  const spotlight = useMemo(() => {
    if (featured.length === 0) return null
    const latest = [...featured].sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    )[0]
    return {
      name: latest.title,
      location: latest.location,
      image: getPrimaryImageUrl(latest.images),
      href: `/properties/${latest.slug}`,
      price: latest.pricePerNight,
      description: latest.description,
      type: latest.propertyType,
      guests: latest.maxGuests,
      bedrooms: latest.bedrooms,
    }
  }, [featured])

  const [activeVipReviewId, setActiveVipReviewId] = useState(VIP_REVIEWS[0].id)
  const activeVipReview =
    VIP_REVIEWS.find((review) => review.id === activeVipReviewId) ?? VIP_REVIEWS[0]

  return (
    <div className="bg-background relative overflow-x-hidden">

      {/* ─── 1 · CINEMATIC HERO (92vh, Ken-Burns, docked search) ─── */}
      <section className="relative h-[92vh] w-full flex flex-col pt-24">
        <HeroMedia />

        {/* Staged text — eyebrow → line-masked H1 → sub. Fired once. */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-5 sm:px-6 pt-24 pb-96 md:pb-40 pointer-events-none">
          <div>
            <Reveal delay={0.2} y={16}>
              <span className="block w-12 h-px bg-gold/55 mx-auto mb-8" aria-hidden />
              <p className="text-[11px] md:text-[13px] uppercase tracking-[0.28em] text-white/90 font-sans font-light mb-6 md:mb-8">
                Nepal&rsquo;s Most Loved Luxury Stays
              </p>
            </Reveal>
            <RevealText
              as="h1"
              lines={["Stays with Soul"]}
              delay={0.35}
              clipPad="0.12em"
              className="font-display uppercase text-white leading-[0.96] tracking-[0.08em] sm:tracking-[0.14em] text-[clamp(2.1rem,7vw,6.5rem)] pb-2 mb-6 md:mb-8"
            />
            <Reveal delay={0.65} y={16}>
              <div className="flex max-w-full items-center justify-center gap-3 text-white/70 sm:gap-6">
                <span className="hidden w-8 h-[1px] bg-white/40 min-[380px]:block" />
                <p className="text-[10px] uppercase tracking-[0.16em] font-sans sm:text-xs sm:tracking-[0.28em]">Salt Route Corp</p>
                <span className="hidden w-8 h-[1px] bg-white/40 min-[380px]:block" />
              </div>
              <div className="mt-12 hidden md:flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.28em] text-white/40">
                <span className="block w-8 h-px bg-white/25" />
                <span>Scroll</span>
                <span className="block w-8 h-px bg-white/25" />
              </div>
            </Reveal>
          </div>
        </div>

        {/* Docked search — fully inside the hero for a decisive bottom seam. */}
        <div className="relative z-30 w-full max-w-screen-xl mx-auto px-6 md:px-12 mt-auto mb-8 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.8, ease: EASE.outSoft }}
          >
            <HeroSearch properties={allProperties} />
          </motion.div>
        </div>
      </section>

      {/* ─── 2 · MISSION BREATH ─── */}
      <section className="bg-white py-12 md:py-16 px-6">
        <div className="max-w-[42rem] mx-auto text-center space-y-8">
          <Reveal>
            <p className="type-eyebrow">Our Story</p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="type-lead">
              We shape thoughtful stays and property partnerships across Nepal —
              helping each home carry its own sense of place, warmth, and quiet
              refinement.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── 3 · EDITORIAL SPLIT, VARIANT A (image bleeds to left edge) ─── */}
      <section className="bg-white pb-10 md:pb-16 overflow-hidden cv-auto">
        <div className="grid lg:grid-cols-12 lg:items-center gap-y-10">
          <div className="lg:col-span-7">
            <CurtainImage direction="left" className="aspect-[4/5] sm:aspect-[16/11] w-full">
              <Image
                src={imgRetreatExterior}
                alt="A Salt Route property at altitude"
                fill
                placeholder="blur"
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
              />
            </CurtainImage>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 px-6 md:px-12 lg:px-0 lg:pr-16 space-y-8">
            <Reveal>
              <h2 className="type-h2">
                Local roots,
                <br />
                global routes.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="type-body max-w-md">
                Salt Route Corp is the hospitality and development arm of Salt
                Route Group — from tea country retreats to mountain-view
                apartments.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <LuxuryLinkWithArrow href="/about">More About Us</LuxuryLinkWithArrow>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── 4 · FULL-BLEED BREATH BAND (text-free) ─── */}
      <section className="relative h-[38vh] md:h-[52vh] w-full overflow-hidden bg-navy cv-auto">
        <ParallaxImage speed={0.1} className="absolute inset-0">
          <Image
            src={imgVillaMain}
            alt="Sunshine Villa amid the Ilam hills"
            fill
            placeholder="blur"
            sizes="100vw"
            className="object-cover"
          />
        </ParallaxImage>
      </section>

      {/* ─── 5 · THE COLLECTION (horizontal snap rail — the page's one rail) ─── */}
      <section className="bg-sand py-10 md:py-16 overflow-hidden cv-auto">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <Reveal className="space-y-5 max-w-2xl">
            <p className="type-eyebrow">The Collection</p>
            <h2 className="type-h2">Tailored stays.</h2>
            <p className="type-body max-w-xl pt-1">
              From Sunshine Villa in Ilam to intimate city and nature-led retreats, places chosen for comfort, character, and care.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <LuxuryLinkWithArrow href="/properties">View All Stays</LuxuryLinkWithArrow>
          </Reveal>
        </div>

        {estates.length === 0 ? (
          <Reveal className="mx-6 md:mx-12">
            <div className="py-24 md:py-32 px-8 text-center border border-navy/10 bg-white max-w-screen-xl mx-auto space-y-8">
              <p className="font-display text-2xl md:text-3xl text-navy/40">Coming Soon</p>
              <p className="type-body max-w-xl mx-auto">
                Our collection is being prepared. New stays will appear here as they are ready to welcome guests.
              </p>
              <div className="pt-4">
                <LuxuryButton href="/contact">Speak to Our Team</LuxuryButton>
              </div>
            </div>
          </Reveal>
        ) : (
          <Reveal stagger={0.08} className="hide-scrollbar flex overflow-x-auto snap-x snap-mandatory gap-6 md:gap-8 px-6 md:px-12 pb-4">
            {estates.map((estate, i) => (
              <Reveal.Item
                key={estate.id}
                className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-[38vw] xl:w-[30vw]"
              >
                <Link href={estate.href} className="group block">
                  <div className="relative overflow-hidden mb-5 bg-beige aspect-[4/5]">
                    {estate.image ? (
                      <Image
                        src={estate.image}
                        alt={estate.name}
                        fill
                        sizes="(max-width: 768px) 80vw, 38vw"
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-navy/30">No Image</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="font-display text-2xl md:text-3xl text-gold/55 leading-none shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-navy/50 font-medium">{estate.location}</p>
                      <h3 className="type-h3 group-hover:text-gold transition-colors duration-700">
                        {estate.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              </Reveal.Item>
            ))}
          </Reveal>
        )}
      </section>

      {/* ─── 6 · IN NUMBERS (compact hairline ledger band) ─── */}
      <section className="bg-white py-12 md:py-16 border-b border-navy/10 cv-auto">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-[220px_1fr] items-center gap-8 md:gap-12">
            <Reveal className="space-y-3">
              <p className="type-eyebrow">In Numbers</p>
              <p className="type-body text-[13px] max-w-[200px] hidden md:block">
                The route so far, measured quietly.
              </p>
            </Reveal>
            <Reveal stagger={0.08} className="grid grid-cols-3 divide-x divide-navy/10">
              <Reveal.Item className="px-4 md:px-10 first:pl-0">
                <p className="font-display font-normal text-navy leading-none tracking-[-0.02em] text-4xl md:text-6xl">
                  {String(VIP_REVIEWS.length).padStart(2, "0")}
                </p>
                <p className="font-sans uppercase text-navy/50 text-[10px] tracking-[0.2em] mt-3">
                  VIP guest notes
                </p>
                <p className="font-sans text-navy/40 text-[11px] mt-1">
                  Sunshine Villa
                </p>
              </Reveal.Item>
              <Reveal.Item className="px-4 md:px-10">
                <p className="font-display font-normal text-navy leading-none tracking-[-0.02em] text-4xl md:text-6xl">
                  {String(Math.max(allProperties.length, estates.length)).padStart(2, "0")}
                </p>
                <p className="font-sans uppercase text-navy/50 text-[10px] tracking-[0.2em] mt-3">
                  Tailored stays
                </p>
                <p className="font-sans text-navy/40 text-[11px] mt-1">
                  Handpicked across Nepal
                </p>
              </Reveal.Item>
              <Reveal.Item className="px-4 md:px-10">
                <p className="font-display font-normal text-navy leading-none tracking-[-0.02em] text-4xl md:text-6xl">
                  04
                </p>
                <p className="font-sans uppercase text-navy/50 text-[10px] tracking-[0.2em] mt-3">
                  Regions
                </p>
                <p className="font-sans text-navy/40 text-[11px] mt-1">
                  Ilam to Mustang
                </p>
              </Reveal.Item>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── 7 · FEATURED STAY (latest property, spotlight + full details) ─── */}
      {spotlight && (
        <section className="bg-sand py-10 md:py-16 overflow-hidden cv-auto">
          <div className="max-w-screen-xl mx-auto px-6 md:px-12">
            <div className="grid lg:grid-cols-12 gap-y-8 lg:gap-x-12 lg:items-center">
              <div className="lg:col-span-5 lg:col-start-1 order-2 lg:order-1 space-y-7">
                <Reveal className="space-y-5">
                  <p className="type-eyebrow">Featured Stay · Just Added</p>
                  <h2 className="type-h2">{spotlight.name}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-navy/55">
                    <span className="text-[10px] uppercase tracking-[0.24em] font-medium">{spotlight.location}</span>
                    {spotlight.type ? (
                      <>
                        <span className="w-8 h-px bg-navy/20" />
                        <span className="text-[10px] uppercase tracking-[0.24em] font-medium">{spotlight.type}</span>
                      </>
                    ) : null}
                  </div>
                </Reveal>
                {spotlight.description ? (
                  <Reveal delay={0.1}>
                    <p className="type-body text-[15px] max-w-lg line-clamp-4">
                      {spotlight.description}
                    </p>
                  </Reveal>
                ) : null}
                <Reveal delay={0.15}>
                  <div className="grid grid-cols-3 border-y border-navy/10 divide-x divide-navy/10">
                    {spotlight.guests ? (
                      <div className="py-5 pr-4">
                        <p className="font-display text-2xl md:text-3xl text-navy leading-none">
                          {String(spotlight.guests).padStart(2, "0")}
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-navy/50 font-medium mt-2">
                          Guests
                        </p>
                      </div>
                    ) : null}
                    {spotlight.bedrooms ? (
                      <div className="py-5 px-4">
                        <p className="font-display text-2xl md:text-3xl text-navy leading-none">
                          {String(spotlight.bedrooms).padStart(2, "0")}
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-navy/50 font-medium mt-2">
                          Bedrooms
                        </p>
                      </div>
                    ) : null}
                    {spotlight.price ? (
                      <div className="py-5 pl-4">
                        <p className="font-display text-2xl md:text-3xl text-navy leading-none">
                          {spotlight.price.toLocaleString()}
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-navy/50 font-medium mt-2">
                          NPR / Night
                        </p>
                      </div>
                    ) : null}
                  </div>
                </Reveal>
                <Reveal delay={0.2}>
                  <LuxuryLinkWithArrow href={spotlight.href}>Discover This Stay</LuxuryLinkWithArrow>
                </Reveal>
              </div>
              <div className="lg:col-span-6 lg:col-start-7 order-1 lg:order-2">
                <CurtainImage className="aspect-[4/3] lg:aspect-[3/4] xl:aspect-[4/3] w-full">
                  <Image
                    src={spotlight.image || "/Sunshine Villa Main.png"}
                    alt={spotlight.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </CurtainImage>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── 8 · CONSCIOUS HOSPITALITY (variant C — dark panel overlaps image) ─── */}
      <section className="bg-white py-10 md:py-16 overflow-hidden cv-auto">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-12 md:items-center">
            <div className="md:col-span-8 md:col-start-5 md:row-start-1">
              <ParallaxImage speed={0.08} className="aspect-[4/3] w-full">
                <Image
                  src={imgInteriorDetail}
                  alt="Heritage interior detail"
                  fill
                  placeholder="blur"
                  sizes="(max-width: 768px) 100vw, 66vw"
                  className="object-cover"
                />
              </ParallaxImage>
            </div>
            <div className="md:col-span-6 md:col-start-1 md:row-start-1 relative z-10 bg-navy text-white p-8 sm:p-10 md:p-14 -mt-16 mx-4 sm:mx-8 md:m-0">
              <Reveal className="space-y-7">
                <p className="font-sans font-medium uppercase text-white/50 text-[11px] md:text-[12px] tracking-[0.24em]">
                  Conscious Hospitality
                </p>
                <h2 className="font-display font-normal text-white leading-[1.1] tracking-[-0.01em] text-[clamp(1.85rem,3.2vw,2.9rem)]">
                  Spaces with purpose.
                </h2>
                <p className="font-sans font-light text-white/65 leading-[1.75] text-[15px] md:text-base">
                  We believe hospitality should preserve, not disrupt. Salt Route Group is committed to sustainable operational practices, honoring regional architecture, and sourcing local materials. By integrating our stays seamlessly into their natural and cultural environments, we ensure our growth respects the heritage of Nepal.
                </p>
                <div className="pt-1">
                  <LuxuryLinkWithArrow href="/about" color="white">Read Our Philosophy</LuxuryLinkWithArrow>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9 · TAILORED JOURNEYS (horizontal step-rail on one hairline track) ─── */}
      <section className="bg-sand py-10 md:py-16 overflow-hidden cv-auto">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-12 items-end gap-y-6 mb-6 md:mb-10">
            <Reveal className="lg:col-span-6 space-y-5">
              <p className="type-eyebrow">Tailored Journeys</p>
              <h2 className="type-h2">Awaken the senses.</h2>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-5 lg:col-start-8 space-y-6">
              <p className="type-body">
                Travel through Nepal at your own pace. Curated stays, gentle encounters, and the kind of routes that honour both people and place.
              </p>
              <LuxuryLinkWithArrow href="/services">Explore Experiences</LuxuryLinkWithArrow>
            </Reveal>
          </div>

          <Reveal stagger={0.1} className="grid md:grid-cols-3">
            {journeys.map((j) => (
              <Reveal.Item
                key={j.num}
                className="relative border-t border-navy/15 pt-8 pb-8 md:pb-0 md:pr-10 lg:pr-16"
              >
                <span
                  className="absolute -top-5 left-0 bg-sand pr-5 font-display text-3xl md:text-4xl text-gold/60 leading-none"
                  aria-hidden
                >
                  {j.num}
                </span>
                <h3 className="type-h3">{j.title}</h3>
                <p className="type-body text-[14px] md:text-[15px] mt-4 max-w-sm">{j.desc}</p>
              </Reveal.Item>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ─── 10 · DISCOVER NEPAL (uneven columns, staggered baselines) ─── */}
      <section className="bg-white py-10 md:py-16 overflow-hidden cv-auto">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <Reveal className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="space-y-5 max-w-xl">
              <p className="type-eyebrow">Discover Nepal</p>
              <h2 className="type-h2">Where you might stay.</h2>
            </div>
            <LuxuryLinkWithArrow href="/properties">Browse All Regions</LuxuryLinkWithArrow>
          </Reveal>

          <Reveal
            stagger={0.08}
            className="grid grid-cols-2 md:grid-cols-[1.25fr_0.85fr_0.85fr_1.25fr] gap-4 md:gap-6"
          >
            {destinations.map((d) => (
              <Reveal.Item key={d.name}>
                <Link href={d.href} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-beige mb-5">
                    <Image
                      src={d.image}
                      alt={d.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />
                  </div>
                  <h3 className="type-h3 group-hover:text-gold transition-colors duration-500">
                    {d.name}
                  </h3>
                  <p className="type-body text-[13px] md:text-sm mt-2">{d.note}</p>
                </Link>
              </Reveal.Item>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ─── 11 · THE SALT ROUTE STANDARD (illustrated editorial list) ─── */}
      <section className="bg-sand py-10 md:py-16 overflow-hidden cv-auto">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-x-20">
            {/* Left: sticky heading */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <Reveal className="space-y-6">
                  <p className="type-eyebrow">The Salt Route Standard</p>
                  <h2 className="type-h2">
                    The art of
                    <br />
                    staying well.
                  </h2>
                  <p className="type-body max-w-sm">
                    More than a place to sleep — a way of being looked after. Every Salt Route home is shaped around comfort, character, and care.
                  </p>
                  <div className="pt-2">
                    <LuxuryLinkWithArrow href="/services">Explore the Experience</LuxuryLinkWithArrow>
                  </div>
                </Reveal>
              </div>
            </div>

            {/* Right: illustrated hairline rows — image · kicker · title · prose */}
            <Reveal stagger={0.08} className="lg:col-span-8 border-t border-navy/10">
              {pillars.map((p) => (
                <Reveal.Item key={p.title}>
                  <Link
                    href="/services"
                    className="group grid grid-cols-[110px_1fr] md:grid-cols-[190px_1fr] gap-5 md:gap-10 items-center py-6 md:py-7 border-b border-navy/10"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-beige">
                      <Image
                        src={p.image}
                        alt={p.alt}
                        placeholder="blur"
                        fill
                        sizes="(max-width: 768px) 110px, 190px"
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.24em] text-gold font-medium">
                        {p.num} · {p.kicker}
                      </p>
                      <h3 className="type-h3 mt-2 transition-colors duration-500 group-hover:text-gold">
                        {p.title}
                      </h3>
                      <p className="type-body text-[14px] md:text-[15px] mt-2.5 max-w-xl">
                        {p.detail}
                      </p>
                    </div>
                  </Link>
                </Reveal.Item>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── 12 · VISUAL JOURNEY (editorial mosaic + split-panel lightbox) ─── */}
      <VisualJourney />

      {/* ─── 13 · PULL-QUOTE (near-empty field, one per page) ─── */}
      <section className="bg-sand py-14 md:py-20 px-6 overflow-hidden cv-auto">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <RevealText
            as="p"
            lines={["Stays where the place,", "and the people, stay with you."]}
            className="font-display font-normal text-navy leading-[1.15] tracking-[-0.01em] text-[clamp(1.9rem,4.5vw,3.5rem)]"
          />
          <Reveal delay={0.3}>
            <p className="font-sans uppercase text-navy/45 text-[10px] tracking-[0.2em]">
              A Quiet Promise · Salt Route
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── 14 · FROM THE JOURNAL (one lead + two side entries) ─── */}
      <section className="bg-white py-10 md:py-16 overflow-hidden cv-auto">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <Reveal className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="space-y-5 max-w-xl">
              <p className="type-eyebrow">From the Journal</p>
              <h2 className="type-h2">Stories from Nepal.</h2>
            </div>
            <LuxuryLinkWithArrow href="/journal">Read the Journal</LuxuryLinkWithArrow>
          </Reveal>

          <div className="grid lg:grid-cols-12 gap-y-12 lg:gap-x-16">
            {stories[0] && (
              <Reveal className="lg:col-span-7">
                <Link href={`/journal/${stories[0].slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-beige mb-7">
                    <Image
                      src={stories[0].image}
                      alt={stories[0].title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-gold/80 font-medium mb-3">
                    {stories[0].category}
                  </p>
                  <h3 className="font-display text-2xl md:text-4xl text-navy tracking-[-0.01em] leading-[1.15] group-hover:text-gold transition-colors duration-500">
                    {stories[0].title}
                  </h3>
                  <p className="type-body text-[15px] mt-4 max-w-xl">{stories[0].excerpt}</p>
                </Link>
              </Reveal>
            )}
            <Reveal delay={0.15} className="lg:col-span-4 lg:col-start-9 flex flex-col justify-center divide-y divide-navy/10">
              {stories.slice(1).map((a) => (
                <Link key={a.slug} href={`/journal/${a.slug}`} className="group block py-8 first:pt-0 last:pb-0">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-gold/80 font-medium mb-3">
                    {a.category}
                  </p>
                  <h3 className="type-h3 group-hover:text-gold transition-colors duration-500">
                    {a.title}
                  </h3>
                  <p className="type-body text-[14px] mt-3">{a.excerpt}</p>
                </Link>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── 15 · VIP REVIEWS (curated Sunshine Villa guestbook) ─── */}
      <section
        aria-labelledby="vip-reviews-heading"
        className="bg-sand py-10 md:py-14 overflow-hidden cv-auto"
      >
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-5 lg:gap-x-16 mb-7 md:mb-9">
            <Reveal className="lg:col-span-5 space-y-3">
              <p className="type-eyebrow">Sunshine Villa Guestbook</p>
              <h2 id="vip-reviews-heading" className="type-h2">
                VIP Reviews
              </h2>
            </Reveal>
            <Reveal
              delay={0.1}
              className="lg:col-span-5 lg:col-start-8 lg:pt-2"
            >
              <p className="type-body text-[14px] max-w-lg">
                Personal notes from distinguished guests who found warmth,
                stillness, and a memorable welcome in the tea hills of Ilam.
              </p>
            </Reveal>
          </div>

          <Reveal>
            <div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-t border-l border-navy/15"
              role="group"
              aria-label="Choose a VIP guestbook entry"
            >
              {VIP_REVIEWS.map((review, reviewIndex) => {
                const active = review.id === activeVipReview.id
                return (
                  <button
                    key={review.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setActiveVipReviewId(review.id)}
                    className={`min-h-20 border-r border-b border-navy/15 px-4 py-3 text-left transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-gold ${
                      active
                        ? "bg-navy text-cream"
                        : "bg-transparent text-navy hover:bg-white"
                    }`}
                  >
                    <span
                      className={`block font-sans text-[9px] uppercase tracking-[0.2em] ${
                        active ? "text-gold-light" : "text-gold-dark/80"
                      }`}
                    >
                      {String(reviewIndex + 1).padStart(2, "0")} · {review.dateLines.at(-1)}
                    </span>
                    <span className="mt-2 block font-display text-sm leading-tight">
                      {review.name}
                    </span>
                  </button>
                )
              })}
            </div>

            <article
              key={activeVipReview.id}
              aria-live="polite"
              aria-label={`Review by ${activeVipReview.name}`}
              className="border-x border-b border-navy/15 bg-cream/45 p-5 md:p-8 lg:p-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-[12rem_minmax(0,1fr)] gap-7 md:gap-10 lg:gap-12 items-start">
                <div className="relative aspect-[4/3] md:aspect-[4/5] overflow-hidden bg-white">
                  <Image
                    src={activeVipReview.image}
                    alt={activeVipReview.imageAlt}
                    fill
                    sizes="(max-width: 767px) calc(100vw - 3rem), 192px"
                    className={activeVipReview.imageClassName}
                  />
                </div>

                <div className="min-w-0">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <time
                      dateTime={activeVipReview.dateTime}
                      className="type-caption text-gold-dark/90"
                    >
                      {activeVipReview.dateLines.join(" · ")}
                    </time>
                    <p className="type-caption">
                      Entry {String(VIP_REVIEWS.findIndex((review) => review.id === activeVipReview.id) + 1).padStart(2, "0")} of {String(VIP_REVIEWS.length).padStart(2, "0")}
                    </p>
                  </div>

                  {activeVipReview.title && (
                    <h3 className="font-display text-xl md:text-2xl leading-[1.2] text-navy mb-4">
                      {activeVipReview.title}
                    </h3>
                  )}

                  <blockquote className="space-y-3 border-l border-gold/45 pl-5 md:pl-7">
                    {activeVipReview.paragraphs.map((paragraph, paragraphIndex) => (
                      <p
                        key={paragraph}
                        className={
                          activeVipReview.emphasizedParagraphs?.includes(paragraphIndex)
                            ? "font-display text-lg md:text-xl leading-[1.4] text-navy"
                            : "font-sans text-[14px] md:text-[15px] font-light leading-[1.7] text-navy/75"
                        }
                      >
                        {paragraph}
                      </p>
                    ))}
                  </blockquote>

                  <footer className="mt-5 flex flex-col gap-2 border-t border-navy/10 pt-4 sm:flex-row sm:items-end sm:justify-between">
                    <p className="font-display text-lg text-navy">
                      {activeVipReview.name}
                    </p>
                    {activeVipReview.credentials.length > 0 && (
                      <div className="space-y-0.5 sm:text-right">
                        {activeVipReview.credentials.map((credential) => (
                          <p
                            key={credential}
                            className="text-[9px] uppercase tracking-[0.18em] text-navy/50 font-medium"
                          >
                            {credential}
                          </p>
                        ))}
                      </div>
                    )}
                  </footer>
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      {/* ─── 16 · YOUR INVITATION (quiet CTA — the page's one primary button) ─── */}
      <section className="bg-sand-dark border-t border-navy/10 py-14 md:py-20 px-6 text-center overflow-hidden cv-auto">
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
          <Reveal>
            <p className="type-eyebrow">Your Invitation</p>
          </Reveal>
          <RevealText
            as="h2"
            lines={["Find your", "place in Nepal."]}
            delay={0.1}
            className="type-h1"
          />
          <Reveal delay={0.25}>
            <p className="type-body max-w-md mx-auto">
              A quiet stay, a curated journey, or a long-term partnership. We&rsquo;ll meet you wherever your story begins.
            </p>
          </Reveal>
          <Reveal delay={0.35}>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-8">
              <Link href="/properties" className="btn-primary">
                Plan Your Stay
              </Link>
              <LuxuryLinkWithArrow href="/contact">Speak With Us</LuxuryLinkWithArrow>
            </div>
          </Reveal>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  )
}
