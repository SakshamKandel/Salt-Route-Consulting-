"use client"

// ── BrochureFacilities — organized hairline columns ─────────────────────────
// Banyan-style: amenities / services / what-to-expect grouped into 2-3
// hairline-divided columns under tiny kicker headers, each item a compact
// hairline row. Highlights now live in BrochureStory. Falls back to one quiet
// prose line when there is very little to show. No icon grids — type and
// hairlines carry it. Every admin field keeps a visible home.

import { FadeUp, Eyebrow } from "@/components/public/property/primitives"

type FacilityGroup = { key: string; label: string; items: string[] }

const COLS: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
}

export function BrochureFacilities({
  whatToExpect,
  services,
  amenities,
  amenitiesTitle,
}: {
  whatToExpect?: string[]
  services?: string[]
  amenities: string[]
  amenitiesTitle?: string | null
  featureIcons?: Record<string, string> | null
}) {
  const expect = whatToExpect ?? []
  const svc = services ?? []
  const amen = amenities ?? []

  const total = expect.length + svc.length + amen.length
  if (total === 0) return null

  // ── Non-degenerate fallback: too few items → one quiet prose line. ──
  if (total < 4) {
    const line = [...expect, ...svc, ...amen].join(" · ")
    return (
      <section className="bg-sand py-10 md:py-16">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12">
          <FadeUp className="max-w-[42rem]">
            <Eyebrow>The Experience</Eyebrow>
            <p className="mt-5 font-sans text-[15px] leading-loose font-light text-charcoal/65">
              {line}
            </p>
          </FadeUp>
        </div>
      </section>
    )
  }

  const groups: FacilityGroup[] = [
    ...(amen.length > 0
      ? [{ key: "amenities", label: amenitiesTitle || "Amenities", items: amen }]
      : []),
    ...(svc.length > 0 ? [{ key: "services", label: "Services", items: svc }] : []),
    ...(expect.length > 0 ? [{ key: "expect", label: "What to Expect", items: expect }] : []),
  ]

  return (
    <section className="bg-sand py-20 md:py-28">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12">
        {/* Header row */}
        <FadeUp className="mb-12">
          <p className="text-[10px] uppercase tracking-[0.26em] text-gold font-semibold mb-2">
            The Experience
          </p>
          <h2 className="font-display uppercase tracking-[0.16em] text-navy text-2xl sm:text-3xl md:text-4xl font-normal">
            Facilities and Services
          </h2>
        </FadeUp>

        {/* Clean columns — one per group */}
        <div
          className={`grid grid-cols-1 gap-10 sm:grid-cols-2 ${
            COLS[groups.length] ?? "md:grid-cols-3"
          } gap-8 lg:gap-12`}
        >
          {groups.map((group, gi) => (
            <FadeUp
              key={group.key}
              delay={gi * 0.06}
              className="bg-white p-8 shadow-sm"
            >
              <p className="font-sans text-[10px] uppercase tracking-[0.24em] font-semibold text-gold mb-6">
                {group.label}
              </p>
              <ul className="space-y-3">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 font-sans text-xs sm:text-sm font-light text-navy/80"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}
