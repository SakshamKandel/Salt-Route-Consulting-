import { EditorialHero } from "@/components/public/EditorialHero"
import {
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
        <EditorialHero image={lead.cover} title="A visual journey through Nepal" />
      ) : null}

      <CompactSection>
        <CompactHeading
          eyebrow="The chapters"
          title="Choose what draws you in."
          copy="Each chapter can stand alone or become part of a longer private itinerary shaped around your time and interests."
        />
        <div className="mt-7 grid gap-x-7 gap-y-10 editorial-two-column md:grid-cols-2">
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
