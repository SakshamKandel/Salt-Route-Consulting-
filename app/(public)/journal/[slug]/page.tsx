import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getArticle, journalArticles } from "@/lib/journal"
import { CompactContainer, CompactSection } from "@/components/public/Compact"

export function generateStaticParams() {
  return journalArticles.map((article) => ({ slug: article.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticle(slug)
  return {
    title: article ? `${article.title} | Salt Route Journal` : "Journal | Salt Route",
    description: article?.excerpt,
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) notFound()
  const more = journalArticles.filter((item) => item.slug !== slug).slice(0, 2)

  return (
    <article className="min-h-screen bg-background text-navy">
      <CompactSection className="pb-7 text-center sm:pb-8">
        <div className="mx-auto max-w-4xl">
          <p className="font-sans text-[10px] uppercase tracking-[0.14em] text-navy/52">{article.category}</p>
          <h1 className="mt-3 font-display text-[clamp(2.5rem,4.7vw,4.5rem)] leading-[1.04] tracking-[-0.02em] text-navy">{article.title}</h1>
          <p className="mt-4 font-sans text-sm text-navy/50">{article.date} · {article.readTime}</p>
        </div>
      </CompactSection>

      <CompactContainer>
        <div className="relative aspect-[16/8] min-h-[280px] overflow-hidden bg-sand-dark">
          <Image src={article.image} alt={article.title} fill priority sizes="100vw" className="object-cover" />
        </div>
      </CompactContainer>

      <CompactSection>
        <div className="mx-auto max-w-[44rem] space-y-6">
          {article.body.map((paragraph, index) => (
            <p key={index} className="font-sans text-[17px] font-light leading-8 text-navy/74">{paragraph}</p>
          ))}
          <Link href="/journal" className="inline-block pt-3 font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-navy hover:text-gold-dark">Back to the journal</Link>
        </div>
      </CompactSection>

      {more.length ? (
        <CompactSection className="bg-beige">
          <h2 className="font-display text-3xl text-navy">Continue reading</h2>
          <div className="mt-6 grid gap-7 md:grid-cols-2">
            {more.map((item) => (
              <Link key={item.slug} href={`/journal/${item.slug}`} className="grid grid-cols-[120px_1fr] gap-4 sm:grid-cols-[180px_1fr]">
                <div className="relative aspect-[4/3] overflow-hidden bg-sand-dark"><Image src={item.image} alt={item.title} fill sizes="180px" className="object-cover" /></div>
                <div><p className="font-sans text-[10px] uppercase tracking-[0.14em] text-navy/52">{item.category}</p><h3 className="mt-1 font-display text-2xl leading-tight text-navy">{item.title}</h3></div>
              </Link>
            ))}
          </div>
        </CompactSection>
      ) : null}
    </article>
  )
}
