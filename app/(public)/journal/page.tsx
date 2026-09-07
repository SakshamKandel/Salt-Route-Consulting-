import Image from "next/image"
import Link from "next/link"
import { journalArticles } from "@/lib/journal"
import { EditorialHero } from "@/components/public/EditorialHero"
import { CompactSection } from "@/components/public/Compact"

export const metadata = {
  title: "Journal | Salt Route",
  description: "Stories, places, and slow journeys across Nepal.",
}

export default function JournalPage() {
  const [lead, ...rest] = journalArticles

  return (
    <div className="min-h-screen bg-background text-navy">
      <EditorialHero image="/images/marketing/nepal-residence.jpg" title="Notes from the route" eyebrow="The journal" />
      <div className="editorial-properties-intro">Notes on places, people, hospitality, and the slower journeys that connect them.</div>

      {lead ? (
        <CompactSection className="pt-0">
          <Link href={`/journal/${lead.slug}`} className="grid items-center gap-7 lg:grid-cols-12 lg:gap-10">
            <div className="relative aspect-[16/10] overflow-hidden bg-sand-dark lg:col-span-7">
              <Image src={lead.image} alt={lead.title} fill priority sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover" />
            </div>
            <div className="lg:col-span-5 lg:px-4">
              <p className="font-sans text-[10px] uppercase tracking-[0.14em] text-navy/52">{lead.category}</p>
              <h2 className="mt-2 font-display text-[clamp(2rem,3.2vw,3.15rem)] leading-[1.08] text-navy">{lead.title}</h2>
              <p className="mt-4 font-sans text-base font-light leading-7 text-navy/70">{lead.excerpt}</p>
              <p className="mt-4 font-sans text-xs text-navy/50">{lead.date} · {lead.readTime}</p>
            </div>
          </Link>
        </CompactSection>
      ) : null}

      {rest.length ? (
        <CompactSection className="bg-background">
          <div className="editorial-two-column grid md:grid-cols-2">
            {rest.map((article) => (
              <article key={article.slug}>
                <Link href={`/journal/${article.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-sand-dark">
                  <Image src={article.image} alt={article.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 hover:scale-[1.02]" />
                </Link>
                <p className="mt-4 font-sans text-[10px] uppercase tracking-[0.14em] text-navy/52">{article.category}</p>
                <h2 className="mt-1 font-display text-2xl leading-tight text-navy">{article.title}</h2>
                <p className="mt-2 font-sans text-[15px] font-light leading-6 text-navy/68">{article.excerpt}</p>
                <p className="mt-3 font-sans text-xs text-navy/50">{article.date} · {article.readTime}</p>
              </article>
            ))}
          </div>
        </CompactSection>
      ) : null}
    </div>
  )
}
