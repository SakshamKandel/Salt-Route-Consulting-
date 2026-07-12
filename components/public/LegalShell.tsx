import type { ReactNode } from "react"

export type LegalItem = { id: string; title: string; body: ReactNode }

/**
 * Shared editorial chrome for the legal pages (privacy / terms / refund).
 * Two-column: a sticky title rail with an "on this page" anchor nav (the
 * desktop running header), a slim sticky title strip below lg (the mobile
 * running header), and a hairline-divided article at a readable measure —
 * no boxed card. Server component; keep it that way so the routes stay static.
 */
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
      <section className="px-6 md:px-12 lg:px-20 pt-24 md:pt-28 pb-10 md:pb-16">
        <div className="max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-x-10 xl:gap-x-24">
          {/* Sticky title rail + anchor nav (desktop running header) */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <p className="type-eyebrow mb-6">{eyebrow}</p>
              <h1 className="type-h1 mb-6">{title}</h1>
              <p className="font-sans uppercase text-[10px] tracking-[0.15em] text-navy/50 mb-6 md:mb-8">
                Last updated: {updated}
              </p>
              <nav className="hidden lg:block border-t border-navy/10 pt-6">
                {items.map((it, i) => (
                  <a
                    key={it.id}
                    href={`#${it.id}`}
                    className="group flex items-baseline gap-4 py-1.5 text-navy/55 hover:text-navy transition-colors duration-300"
                  >
                    <span className="font-sans uppercase text-[10px] tracking-[0.15em] text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-sans">{it.title}</span>
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Article */}
          <div className="lg:col-span-7 lg:col-start-6">
            {/* Mobile running header: slim sticky strip with the page title and
                section anchors; sits just below the fixed site nav (h-20). */}
            <div className="lg:hidden sticky top-20 z-30 -mx-6 md:-mx-12 mb-6 md:mb-8 border-y border-navy/10 bg-background">
              <div className="flex items-center gap-6 overflow-x-auto px-6 md:px-12 py-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <span className="shrink-0 font-display text-base text-navy leading-none">
                  {title}
                </span>
                <span className="h-4 w-px shrink-0 bg-navy/15" aria-hidden />
                {items.map((it, i) => (
                  <a
                    key={it.id}
                    href={`#${it.id}`}
                    className="shrink-0 whitespace-nowrap font-sans uppercase text-[10px] tracking-[0.15em] text-navy/50 hover:text-navy transition-colors duration-300"
                  >
                    <span className="text-gold mr-2">{String(i + 1).padStart(2, "0")}</span>
                    {it.title}
                  </a>
                ))}
              </div>
            </div>

            {summary && (
              <div className="mb-8 md:mb-10 border-l-2 border-gold/50 pl-6 py-1">
                <p className="font-sans uppercase text-[10px] tracking-[0.15em] text-navy/50 mb-2">
                  Summary
                </p>
                <p className="font-sans text-base text-navy/70 leading-[1.75] font-light">
                  {summary}
                </p>
              </div>
            )}
            <div className="divide-y divide-navy/10">
              {items.map((it, i) => (
                <section key={it.id} id={it.id} className="py-7 first:pt-0 scroll-mt-36">
                  <p className="font-sans uppercase text-[10px] tracking-[0.15em] text-gold mb-3">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 className="type-h3 mb-4">{it.title}</h2>
                  <div className="font-sans text-base text-navy/65 leading-[1.8] font-light">
                    {it.body}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
