import type { ReactNode } from "react"
import { CompactSection } from "./Compact"
import { Reveal } from "./motion"

export type LegalItem = { id: string; title: string; body: ReactNode }

export function LegalShell({
  title,
  updated,
  items,
  summary,
  eyebrow = "Legal",
}: {
  title: string
  updated: string
  items: LegalItem[]
  summary?: ReactNode
  eyebrow?: string
}) {
  return (
    <div className="editorial-plain min-h-screen bg-background text-navy">
      <CompactSection>
        <div className="editorial-legal-grid">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Reveal as="div">
              <p className="editorial-eyebrow">{eyebrow}</p>
              <h1 className="font-display text-4xl sm:text-5xl">{title}</h1>
            </Reveal>
            <p className="mt-4 font-sans text-[11px] uppercase tracking-[0.12em] text-navy/50">
              Last updated: {updated}
            </p>
            <nav className="mt-6 flex flex-col items-start gap-2.5" aria-label="On this page">
              {items.map((item) => (
                <a key={item.id} href={`#${item.id}`} className="font-sans text-sm text-navy/58 hover:text-navy">
                  {item.title}
                </a>
              ))}
            </nav>
          </div>

          <article>
            {summary ? (
              <Reveal as="div" className="mb-5 py-5">
                <p className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-navy/50">Summary</p>
                <div className="mt-2 font-sans text-base font-light leading-7 text-navy/70">{summary}</div>
              </Reveal>
            ) : null}
            <div className="space-y-4">
              {items.map((item, index) => (
                <Reveal
                  as="section"
                  key={item.id}
                  id={item.id}
                  delay={index * 0.05}
                  className="scroll-mt-24 py-5"
                >
                  <h2 className="font-display text-2xl leading-tight text-navy">{item.title}</h2>
                  <div className="mt-3 font-sans text-base font-light leading-7 text-navy/68">{item.body}</div>
                </Reveal>
              ))}
            </div>
          </article>
        </div>
      </CompactSection>
    </div>
  )
}
