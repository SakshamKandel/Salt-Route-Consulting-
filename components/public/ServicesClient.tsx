"use client"

import Image from "next/image"
import Link from "next/link"
import { siteConfig } from "@/lib/site.config"
import { Reveal, CurtainImage, KenBurns, ParallaxImage } from "@/components/public/motion"

export type CollageProperty = {
  slug: string
  title: string
  location: string
  imageUrl: string | null
}

const guestServices = [
  {
    num: "01",
    title: "Tailored Property Stays",
    body: "Each property chosen for its soul. Its setting, its story, and the warmth of its welcome.",
    cta: "Browse Collection",
    href: "/properties",
  },
  {
    num: "02",
    title: "Personal Travel Planning",
    body: "Complete journeys shaped around Nepal's landscapes, cultures, and communities, with precision and care.",
    cta: "Plan Your Journey",
    href: "/contact",
  },
  {
    num: "03",
    title: "Nature Trails",
    body: "Low-impact outdoor experiences that connect travelers gently with Nepal's living landscape.",
    cta: "Enquire",
    href: "/contact",
  },
  {
    num: "04",
    title: "Cultural Journeys",
    body: "Immersive, community-rooted journeys celebrating Nepali heritage with honesty and depth.",
    cta: "Discover",
    href: "/contact",
  },
  {
    num: "05",
    title: "Community-Led Moments",
    body: "Travel moments designed to give back, supporting local businesses and sharing value with host communities.",
    cta: "Enquire",
    href: "/contact",
  },
  {
    num: "06",
    title: "Private Travel Care",
    body: "Smooth, attentive movement across Nepal, from private road journeys to flight coordination.",
    cta: "Get a Quote",
    href: "/contact",
  },
]

// Need-based clusters (plan §9 Services): the six experiences regrouped by
// what the guest is looking for, rendered as alternating editorial splits.
// Cluster 01 ("The Stay") renders a vertical collage of the latest 3
// properties (passed in from the server) instead of a static stock image.
// Prayer flags fluttering before the snowy Dhaulagiri range, shot from
// Ghorepani on the Annapurna trail — a recognisably Nepali hero scene.
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1751566477091-921125737d76?q=80&w=2400&auto=format&fit=crop"
const JOURNEY_IMAGE =
  "https://images.unsplash.com/photo-1600774841769-e7ac3da8fb99?q=80&w=1600&auto=format&fit=crop"
const CARE_IMAGE =
  "https://images.unsplash.com/photo-1757840600384-2a384321fa6d?q=80&w=1600&auto=format&fit=crop"
const QUOTE_IMAGE =
  "https://images.unsplash.com/photo-1752857015570-2fcc1c8a6350?q=80&w=2400&auto=format&fit=crop"
const CTA_IMAGE =
  "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=2400&auto=format&fit=crop"

const consultingServices = [
  {
    num: "01",
    title: "Opening Guidance",
    body: "Shaping a clear guest promise, a considered identity, and a confident path to opening day.",
  },
  {
    num: "02",
    title: "Day-to-Day Hospitality Care",
    body: "Supporting teams in caring for guests and homes with warmth, consistency, and quiet excellence.",
  },
  {
    num: "03",
    title: "Story & Brand Shaping",
    body: "Giving each property a memorable narrative and market presence grounded in local insight.",
  },
  {
    num: "04",
    title: "Sustainable Development",
    body: "Building environmental responsibility and lasting community value into every project.",
  },
]

/** Tracked-uppercase text link with the left-grow hairline — the page's quiet CTA register. */
function HairlineLink({
  href,
  children,
  light = false,
}: {
  href: string
  children: React.ReactNode
  light?: boolean
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 font-sans uppercase text-[10px] tracking-[0.2em] transition-colors duration-300 ${
        light ? "text-white/80 hover:text-white" : "text-navy/60 hover:text-gold"
      }`}
    >
      {children}
      <span className="block h-px w-8 bg-current transition-all duration-300 ease-[var(--ease-out-quart)] group-hover:w-14" />
    </Link>
  )
}

/**
 * Vertical collage of the latest 3 properties. Each property occupies a
 * horizontal strip (1/3 height) with its primary image, a gradient veil, and
 * a small label (title + location). Each strip links to the property page.
 *
 * Falls back to a single stock image when fewer than 3 properties are
 * available so the layout never breaks on a fresh install.
 */
function PropertyCollage({ properties }: { properties: CollageProperty[] }) {
  const usable = properties.filter((p) => p.imageUrl)
  if (usable.length === 0) {
    return (
      <Image
        src={HERO_IMAGE}
        alt="A Salt Route property"
        fill
        sizes="(max-width: 1024px) 100vw, 58vw"
        className="object-cover"
      />
    )
  }

  return (
    <div className="flex h-full w-full flex-col">
      {usable.map((p, i) => (
        <Link
          key={p.slug}
          href={`/properties/${p.slug}`}
          className="group relative block flex-1 overflow-hidden"
        >
          <Image
            src={p.imageUrl as string}
            alt={p.title}
            fill
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-quart)] group-hover:scale-[1.04]"
          />
          {/* Bottom-up gradient for legibility of the label. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
          {/* Hairline divider between strips (skip on the last). */}
          {i < usable.length - 1 && (
            <div className="absolute bottom-0 left-0 right-0 h-px bg-white/15" />
          )}
          {/* Label */}
          <div className="absolute inset-x-0 bottom-0 px-5 py-4 sm:px-7 sm:py-5">
            <p className="font-sans text-[9px] uppercase tracking-[0.28em] text-gold/85 mb-1">
              {p.location}
            </p>
            <h3 className="font-display text-base sm:text-lg text-white/95 leading-tight">
              {p.title}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  )
}

export function ServicesClient({ latestProperties }: { latestProperties: CollageProperty[] }) {
  // Cluster 01 uses the live collage; 02 and 03 use curated stock imagery.
  const clusters = [
    {
      num: "01",
      label: "The Stay",
      imageAlt: "Latest Salt Route properties",
      items: [guestServices[0]],
      collage: true,
    },
    {
      num: "02",
      label: "The Journey",
      image: JOURNEY_IMAGE,
      imageAlt: "A journey through the Nepali hills",
      items: [guestServices[1], guestServices[2], guestServices[3]],
      collage: false,
    },
    {
      num: "03",
      label: "The Care",
      image: CARE_IMAGE,
      imageAlt: "The Salt Route team at work",
      items: [guestServices[4], guestServices[5]],
      collage: false,
    },
  ]

  return (
    <div className="bg-background text-navy">

      {/* ── HERO ── */}
      <section className="relative h-[92svh] min-h-[560px] overflow-hidden bg-navy">
        <div className="absolute inset-0 z-0">
          <KenBurns className="h-full w-full">
            <Image
              src={HERO_IMAGE}
              alt="Prayer flags over the Nepali Himalaya"
              fill
              className="object-cover opacity-55"
              priority
            />
          </KenBurns>
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/65" />
        </div>

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-5 sm:px-6">
          <Reveal>
            <p className="type-eyebrow text-white/50! mb-6">
              {siteConfig.brandName} &middot; {siteConfig.region}
            </p>
            <h1 className="type-display text-white!">
              Consulting &amp;<br />
              <em className="not-italic text-gold/85">Experiences</em>
            </h1>
            <div className="flex max-w-full items-center justify-center gap-3 sm:gap-6 mt-10">
              <span className="hidden w-10 h-px bg-white/15 min-[380px]:block" />
              <p className="type-caption text-white/40!">
                Responsible Stays &middot; Property Care
              </p>
              <span className="hidden w-10 h-px bg-white/15 min-[380px]:block" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── INTRO BREATH — quiet, centered, one lead voice ── */}
      <section className="py-10 md:py-16 px-6 border-b border-navy/5">
        <Reveal className="max-w-2xl mx-auto text-center space-y-8">
          <p className="type-eyebrow text-gold!">{siteConfig.name}</p>
          <p className="type-lead">
            Every journey we curate is a study in intention. Knowing a place deeply, and sharing it with rare generosity.
          </p>
        </Reveal>
      </section>

      {/* ── GUEST EXPERIENCES — need-based clusters as alternating splits ── */}
      <section className="pt-10 md:pt-16 px-6 md:px-12 lg:px-20">
        <Reveal className="max-w-[90rem] mx-auto flex items-center gap-6">
          <p className="type-eyebrow whitespace-nowrap">Guest Experiences</p>
          <div className="flex-1 h-px bg-navy/10" />
        </Reveal>
      </section>

      <section className="overflow-hidden py-10 md:py-16">
        <div className="space-y-16 md:space-y-24">
          {clusters.map((cluster, i) => {
            const imageLeft = i % 2 === 0
            return (
              <div
                key={cluster.num}
                className="grid grid-cols-1 lg:grid-cols-12 items-center gap-y-10 lg:gap-y-0"
              >
                {/* Image — bleeds to the viewport edge on its side */}
                <div className={`lg:col-span-7 ${imageLeft ? "lg:order-1" : "lg:order-2"}`}>
                  <CurtainImage
                    className="aspect-[4/3] lg:aspect-[16/11]"
                    direction={imageLeft ? "left" : "up"}
                  >
                    {cluster.collage ? (
                      <PropertyCollage properties={latestProperties} />
                    ) : (
                      <Image
                        src={cluster.image as string}
                        alt={cluster.imageAlt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 58vw"
                        className="object-cover"
                      />
                    )}
                  </CurtainImage>
                </div>

                {/* Text — ghost numeral, cluster label, hairline-divided items */}
                <div
                  className={`lg:col-span-5 px-6 md:px-12 ${
                    imageLeft ? "lg:order-2 lg:pl-16 xl:pl-24 lg:pr-12 xl:pr-20" : "lg:order-1 lg:pr-16 xl:pr-24 lg:pl-12 xl:pl-20"
                  }`}
                >
                  <Reveal>
                    <span className="font-display font-light text-5xl md:text-6xl text-navy/10 leading-none block">
                      {cluster.num}
                    </span>
                    <p className="type-eyebrow text-gold! mt-6">{cluster.label}</p>
                  </Reveal>
                  <Reveal delay={0.1} className="mt-6 md:mt-8 border-t border-navy/10 lg:max-w-xl">
                    {cluster.items.map((item) => (
                      <div key={item.num} className="py-8 border-b border-navy/10 space-y-3">
                        <h3 className="type-h3">{item.title}</h3>
                        <p className="type-body">{item.body}</p>
                        <div className="pt-2">
                          <HairlineLink href={item.href}>{item.cta}</HairlineLink>
                        </div>
                      </div>
                    ))}
                  </Reveal>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── PULL-QUOTE — the page's single quote moment ── */}
      <section className="relative h-[55vh] md:h-[65vh] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <ParallaxImage className="h-full w-full" speed={0.08}>
            <Image
              src={QUOTE_IMAGE}
              alt="A private dining moment"
              fill
              className="object-cover"
              sizes="100vw"
            />
          </ParallaxImage>
          <div className="absolute inset-0 bg-black/55" />
        </div>
        <Reveal className="relative z-10 text-center max-w-3xl px-6 space-y-8">
          <span className="w-10 h-px bg-gold/60 block mx-auto" />
          <blockquote className="font-display font-light italic text-2xl md:text-3xl lg:text-4xl text-white/90 leading-[1.5]">
            &ldquo;A private table in a courtyard. A guide who knows every name. A morning that asks nothing of you.&rdquo;
          </blockquote>
          <p className="type-caption text-gold/70!">The Salt Route Standard</p>
        </Reveal>
      </section>

      {/* ── PROPERTY CONSULTING — horizontal step rail (distinct from the
             sticky numbered lists on Home / For-Owners) ── */}
      <section className="py-10 md:py-16 px-6 md:px-12 lg:px-20 bg-sand">
        <div className="max-w-[90rem] mx-auto">
          <Reveal className="flex items-center gap-6 mb-6 md:mb-8">
            <p className="type-eyebrow whitespace-nowrap">Property Consulting</p>
            <div className="flex-1 h-px bg-navy/10" />
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 items-end mb-6 md:mb-10">
            <Reveal className="lg:col-span-7">
              <h2 className="type-h2">
                Growing Value <em className="not-italic text-gold">Through Care</em> &amp; Story.
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-4 lg:col-start-9">
              <p className="type-body">
                From first idea to everyday hosting, SRC works alongside owners to shape distinctive, responsible hospitality grounded in local insight.
              </p>
              <div className="mt-8">
                <HairlineLink href="/for-owners">Partner With SRC</HairlineLink>
              </div>
            </Reveal>
          </div>

          <Reveal stagger={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-8">
            {consultingServices.map((s) => (
              <Reveal.Item key={s.num} className="border-t border-navy/15 pt-8">
                <span className="font-display font-light text-5xl md:text-6xl text-navy/10 leading-none block">
                  {s.num}
                </span>
                <h3 className="type-h3 mt-8">{s.title}</h3>
                <p className="font-sans font-light text-[15px] leading-[1.75] text-navy/60 mt-4">
                  {s.body}
                </p>
              </Reveal.Item>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── FINAL CTA — one primary action ── */}
      <section className="relative overflow-hidden h-[60vh] md:h-[70vh] flex items-end">
        <Image
          src={CTA_IMAGE}
          alt="A Salt Route property"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

        <div className="relative z-10 px-6 md:px-12 lg:px-20 pb-16 md:pb-24 space-y-8 max-w-xl">
          <Reveal>
            <p className="type-eyebrow text-white/50!">Begin Your Journey</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display font-normal text-white leading-[1.05] tracking-[-0.02em] text-[clamp(2.5rem,5vw,4rem)]">
              Find Your Place<br />
              <em className="not-italic text-gold/90">in Nepal.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.2} className="flex flex-wrap items-center gap-x-10 gap-y-6 pt-2">
            <Link
              href="/properties"
              className="inline-flex w-full sm:w-auto items-center justify-center bg-gold hover:bg-gold-light text-navy text-[11px] md:text-xs uppercase tracking-[0.2em] font-medium px-10 py-5 transition-colors duration-300"
            >
              View Stays
            </Link>
            <HairlineLink href="/contact" light>
              Contact Concierge
            </HairlineLink>
          </Reveal>
        </div>
      </section>

    </div>
  )
}
