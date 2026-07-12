import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getArticle, journalArticles } from "@/lib/journal"
import { Reveal } from "@/components/public/motion"

export function generateStaticParams() {
  return journalArticles.map((a) => ({ slug: a.slug }))
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

  const more = journalArticles.filter((a) => a.slug !== slug).slice(0, 2)

  return (
    <div className="bg-background text-navy min-h-screen">
      {/* Header */}
      <section className="px-6 md:px-12 lg:px-20 pt-24 md:pt-28 pb-10 md:pb-16">
        <Reveal className="max-w-3xl mx-auto text-center">
          <p className="type-caption text-gold/80! mb-6">{article.category}</p>
          <h1 className="type-h1">{article.title}</h1>
          <div className="flex items-center justify-center gap-4 type-caption text-navy/50 mt-6">
            <span>{article.date}</span>
            <span className="w-6 h-px bg-navy/20" />
            <span>{article.readTime}</span>
          </div>
        </Reveal>
      </section>

      {/* Lead image */}
      <section className="px-6 md:px-12 lg:px-20 mb-10 md:mb-16">
        <div className="max-w-[80rem] mx-auto relative aspect-[16/9] overflow-hidden bg-beige">
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />
        </div>
      </section>

      {/* Body */}
      <section className="px-6 md:px-12 lg:px-20 pb-10 md:pb-16">
        <div className="max-w-[42rem] mx-auto space-y-7">
          {article.body.map((para, i) => (
            <p
              key={i}
              className={`font-sans text-lg text-navy/75 leading-[1.85] font-light ${
                i === 0
                  ? "first-letter:float-left first-letter:font-display first-letter:text-6xl first-letter:leading-[0.8] first-letter:pr-3 first-letter:pt-1 first-letter:text-navy"
                  : ""
              }`}
            >
              {para}
            </p>
          ))}
          <div className="pt-10">
            <Link
              href="/journal"
              className="group inline-flex items-center gap-3 type-caption text-navy"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" strokeWidth={1.4} />
              Back to the Journal
            </Link>
          </div>
        </div>
      </section>

      {/* More stories */}
      {more.length > 0 && (
        <section className="px-6 md:px-12 lg:px-20 pb-10 md:pb-16 border-t border-navy/10 pt-10 md:pt-16">
          <div className="max-w-[90rem] mx-auto">
            <Reveal>
              <p className="type-eyebrow mb-6 md:mb-8">Keep Reading</p>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-16 gap-y-10">
              {more.map((a, i) => (
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
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
