import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getArticle, journalArticles } from "@/lib/journal"
import { EditorialHero } from "@/components/public/EditorialHero"
import { CompactSection } from "@/components/public/Compact"

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
      <EditorialHero image={article.image} title={article.title} eyebrow={article.category}><p>{article.date} · {article.readTime}</p></EditorialHero>

      <CompactSection>
        <div className="mx-auto max-w-[44rem] space-y-6">
          {article.body.map((paragraph, index) => (
            <p key={index} className="font-sans text-[17px] font-light leading-8 text-navy/74">{paragraph}</p>
          ))}
          <Link href="/journal" className="inline-block pt-3 font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-navy hover:text-gold-dark">Back to the journal</Link>
        </div>
      </CompactSection>

      {more.length ? (
        <CompactSection className="bg-background">
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
