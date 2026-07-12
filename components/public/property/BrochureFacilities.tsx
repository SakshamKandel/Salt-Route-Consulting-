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
    <section className="bg-sand py-10 md:py-16">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12">
        {/* Header row — eyebrow + title over a hairline. */}
        <FadeUp className="border-b border-charcoal/10 pb-5">
          <Eyebrow>The Experience</Eyebrow>
          <h2 className="mt-3 font-display font-normal text-[clamp(2rem,4vw,3.25rem)] leading-[1.1] tracking-[-0.01em] text-charcoal">
            Facilities & Services
          </h2>
        </FadeUp>

        {/* Hairline columns — one per group, divided vertically on md+. */}
        <div
          className={`mt-8 grid grid-cols-1 gap-10 md:gap-0 ${
            COLS[groups.length] ?? "md:grid-cols-3"
          } md:divide-x md:divide-charcoal/10`}
        >
          {groups.map((group, gi) => (
            <FadeUp
              key={group.key}
              delay={gi * 0.06}
              className={`md:px-8 ${gi === 0 ? "md:pl-0" : ""} ${
                gi === groups.length - 1 ? "md:pr-0" : ""
              }`}
            >
              <p className="font-sans text-[10px] uppercase tracking-[0.24em] font-bold text-charcoal/45">
                {group.label}
              </p>
              <ul className="mt-3">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="border-b border-charcoal/10 py-2.5 font-sans text-[13px] font-light leading-relaxed text-charcoal/70"
                  >
                    {item}
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
