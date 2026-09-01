import Image from "next/image"
import {
  CompactButton,
  CompactContainer,
  CompactHeading,
  CompactMediaCard,
  CompactSection,
} from "@/components/public/Compact"
import { VISUAL_JOURNEY_TILES } from "@/lib/visual-journey-tiles"

export function VisualJourneyPage() {
  const lead = VISUAL_JOURNEY_TILES[0]

  return (
    <div className="min-h-screen bg-background text-navy">
      {lead ? (
        <section className="relative min-h-[500px] overflow-hidden sm:min-h-[580px]">
          <Image src={lead.cover} alt={lead.title} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-black/36" />
          <CompactContainer className="relative flex min-h-[500px] items-end pb-9 text-cream sm:min-h-[580px] sm:pb-12">
            <div className="max-w-2xl">
              <p className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-cream/80">A visual journey</p>
              <h1 className="mt-3 font-display text-[clamp(2.75rem,5vw,5rem)] leading-[1] tracking-[-0.02em]">Nepal, one chapter at a time.</h1>
              <p className="mt-4 max-w-xl font-sans text-base font-light leading-7 text-cream/88 sm:text-lg">
                Landscapes, craft, food, people, and quiet stays brought together in a simple route through the country.
              </p>
              <CompactButton href="/contact" className="mt-6">Plan a journey</CompactButton>
            </div>
          </CompactContainer>
        </section>
      ) : null}

      <CompactSection>
        <CompactHeading
          eyebrow="The chapters"
          title="Choose what draws you in."
          copy="Each chapter can stand alone or become part of a longer private itinerary shaped around your time and interests."
        />
        <div className="mt-7 grid gap-x-7 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {VISUAL_JOURNEY_TILES.map((tile) => (
            <CompactMediaCard
              key={tile.num}
              image={tile.cover}
              alt={tile.title}
              title={tile.title}
              copy={tile.narrative}
              href="/contact"
              action="Plan this chapter"
            />
          ))}
        </div>
      </CompactSection>
    </div>
  )
}
