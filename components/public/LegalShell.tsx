import type { ReactNode } from "react"
import { CompactHeading, CompactSection } from "./Compact"

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
    <div className="min-h-screen bg-background text-navy">
      <CompactSection>
        <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:gap-12">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <CompactHeading eyebrow={eyebrow} title={title} />
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
              <div className="mb-5 bg-beige p-5 sm:p-6">
                <p className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-navy/50">Summary</p>
                <div className="mt-2 font-sans text-base font-light leading-7 text-navy/70">{summary}</div>
              </div>
            ) : null}
            <div className="space-y-4">
              {items.map((item) => (
                <section key={item.id} id={item.id} className="scroll-mt-24 bg-sand p-5 sm:p-6">
                  <h2 className="font-display text-2xl leading-tight text-navy">{item.title}</h2>
                  <div className="mt-3 font-sans text-base font-light leading-7 text-navy/68">{item.body}</div>
                </section>
              ))}
            </div>
          </article>
        </div>
      </CompactSection>
    </div>
  )
}
