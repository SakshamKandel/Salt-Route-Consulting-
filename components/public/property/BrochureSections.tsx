"use client"

import { FadeUp, Prose, SafeImage } from "./primitives"
import type { SectionData } from "./types"

export function BrochureSections({ sections }: { sections: SectionData[]; startIndex?: number }) {
  if (!sections?.length) return null
  return <>{sections.map((section, index) => <section key={section.id} className="editorial-property-story">
    <div className={section.imageUrl ? "editorial-story-spread" : "editorial-story-text"}>
      {section.imageUrl && <div className={`editorial-story-photo ${index % 2 ? "editorial-story-photo-right" : ""}`}><SafeImage src={section.imageUrl} alt={section.title} fill sizes="(max-width:700px) 100vw, 50vw" className="object-cover" /></div>}
      <FadeUp><h2>{section.title}</h2><Prose text={section.body} className="editorial-story-prose" /></FadeUp>
    </div>
  </section>)}</>
}
