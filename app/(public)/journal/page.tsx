import Link from "next/link"
import Image from "next/image"
import { journalArticles } from "@/lib/journal"
import { Reveal } from "@/components/public/motion"

export const metadata = {
  title: "Journal | Salt Route",
  description: "Stories, places, and slow journeys across Nepal.",
}

export default function JournalPage() {
  const [lead, ...rest] = journalArticles

  return (
    <div className="bg-background text-navy min-h-screen">
      {/* Header */}
      <section className="px-6 md:px-12 lg:px-20 pt-24 md:pt-28 pb-10 md:pb-16">
        <Reveal className="max-w-[90rem] mx-auto">
          <p className="type-eyebrow mb-6">The Journal</p>
          <h1 className="type-display max-w-3xl">Stories from Nepal.</h1>
        </Reveal>
      </section>

      {/* Lead article */}
      {lead && (
        <section className="px-6 md:px-12 lg:px-20 pb-10 md:pb-16">
          <Reveal className="max-w-[90rem] mx-auto">
            <Link
              href={`/journal/${lead.slug}`}
              className="group grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center"
            >
              <div className="lg:col-span-7 relative aspect-[16/10] overflow-hidden bg-beige">
                <Image
                  src={lead.image}
                  alt={lead.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover transition-transform duration-700 ease-[var(--ease-out-luxe)] group-hover:scale-[1.03]"
                />
              </div>
              <div className="lg:col-span-5 space-y-6">
                <p className="type-caption text-gold/80!">{lead.category}</p>
                <h2 className="type-h2 group-hover:text-gold transition-colors duration-500">
                  {lead.title}
                </h2>
                <p className="type-body max-w-lg">{lead.excerpt}</p>
                <div className="flex items-center gap-4 type-caption text-navy/50">
                  <span>{lead.date}</span>
                  <span className="w-6 h-px bg-navy/20" />
                  <span>{lead.readTime}</span>
                </div>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      {/* Remaining articles */}
      <section className="px-6 md:px-12 lg:px-20 pb-10 md:pb-16">
        <div className="max-w-[90rem] mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-16 gap-y-10">
          {rest.map((a, i) => (
            <Reveal key={a.slug} delay={i * 0.08}>
              <Link href={`/journal/${a.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden bg-beige mb-6">
                  <Image
                    src={a.image}
                    alt={a.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 45vw"
                    className="object-cover transition-transform duration-700 ease-[var(--ease-out-luxe)] group-hover:scale-[1.04]"
                  />
                </div>
                <p className="type-caption text-gold/80! mb-3">{a.category}</p>
                <h3 className="type-h3 group-hover:text-gold transition-colors duration-500">
                  {a.title}
                </h3>
                <p className="type-body mt-4 max-w-lg">{a.excerpt}</p>
                <div className="flex items-center gap-4 type-caption text-navy/50 mt-5">
                  <span>{a.date}</span>
                  <span className="w-6 h-px bg-navy/20" />
                  <span>{a.readTime}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  )
}
