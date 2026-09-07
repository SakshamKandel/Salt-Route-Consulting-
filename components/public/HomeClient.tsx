"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, BedDouble, Users } from "lucide-react"
import { getPrimaryImageUrl, type PropertyMediaLike } from "@/lib/property-media"
import { type ComboboxProperty } from "./LocationCombobox"
import { HomeHeroCarousel } from "./HomeHeroCarousel"
import { Reveal } from "./motion"
import { journalArticles } from "@/lib/journal"
import { formatNpr } from "@/lib/currency"
import imgRetreat from "@/public/images/marketing/nepal-residence.jpg"
import imgVilla from "@/public/images/marketing/nepal-villa.jpg"
import imgDining from "@/public/images/saltroute/garden-breakfast.webp"
import imgConnection from "@/public/images/saltroute/local-farmers.webp"
import imgLandscape from "@/public/images/marketing/nepal-landscape.jpg"
import logoSwissContact from "@/public/brand/Trusted By/SwissContact.png"
import logoRedPanda from "@/public/brand/Trusted By/Red Panda Network.png"
import logoNatureCoffee from "@/public/brand/Trusted By/Nature Coffee.png"
import logoSunshineVilla from "@/public/brand/Trusted By/Sunshine VIlla.png"

const TRUSTED_PARTNERS = [
  { name: "Swisscontact", logo: logoSwissContact, href: "https://www.swisscontact.org", external: true },
  { name: "Red Panda Network", logo: logoRedPanda, href: "https://redpandanetwork.org", external: true },
  { name: "Nature Coffee", logo: logoNatureCoffee, large: true },
  { name: "Sunshine Villa", logo: logoSunshineVilla, href: "/properties/sunshine-villa", external: false, large: true },
]

type FeaturedProperty = { id: string; title: string; slug: string; location: string; images: PropertyMediaLike[]; pricePerNight?: number; hidePrice?: boolean; description?: string; bedrooms?: number; maxGuests?: number }
type TestimonialItem = { id: string; quote: string; name: string; role: string | null; source: string | null; kind: "DIPLOMATIC" | "VERIFIED"; rating: number; location: string | null }
type GuestReviewItem = { id: string; rating: number; comment: string; guestName: string; propertyTitle: string; propertySlug: string; location: string; createdAt: string }

export default function HomeClient({ featured = [], testimonials = [], guestReviews = [] }: { featured?: FeaturedProperty[]; allProperties?: ComboboxProperty[]; testimonials?: TestimonialItem[]; guestReviews?: GuestReviewItem[] }) {
  const [collectionPage, setCollectionPage] = useState(0)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const quotes = [...guestReviews.map(review => ({ id: review.id, quote: review.comment, name: review.guestName, role: `Guest at ${review.propertyTitle}` })), ...testimonials]
  const quote = quotes[quoteIndex % Math.max(1, quotes.length)]
  const pages = Math.ceil(featured.length / 2)
  const stays = featured.slice(collectionPage * 2, collectionPage * 2 + 2)

  return <div className="editorial-home">
    <HomeHeroCarousel />

    <Reveal as="section" className="editorial-intro">
      <h2>Rooted in Nepal. Made personal.</h2>
      <p>Private houses, villas, and small retreats with quiet, wide views and a real connection to local life. Salt Route brings together distinctive places and the people who make them feel like home.</p>
      <p>From a slow morning in the hills to a table shared with your hosts, we shape stays around your pace, with thoughtful care in every detail.</p>
      <Link className="editorial-link" href="/about">Our story</Link>
    </Reveal>

    <Reveal as="section" className="editorial-trusted editorial-container" aria-label="Trusted by">
      <p className="editorial-trusted-label">Trusted by</p>
      <div className="editorial-trusted-grid">
        {TRUSTED_PARTNERS.map(partner => (
          partner.href ? (
            <Link
              key={partner.name}
              href={partner.href}
              className="editorial-trusted-item"
              title={partner.name}
              {...(partner.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                className={`editorial-trusted-logo ${partner.large ? "editorial-trusted-logo--lg" : ""}`}
                sizes="180px"
              />
            </Link>
          ) : (
            <div key={partner.name} className="editorial-trusted-item" title={partner.name}>
              <Image
                src={partner.logo}
                alt={partner.name}
                className={`editorial-trusted-logo ${partner.large ? "editorial-trusted-logo--lg" : ""}`}
                sizes="180px"
              />
            </div>
          )
        ))}
      </div>
    </Reveal>

    <section className="editorial-mosaic editorial-container" aria-label="Explore Salt Route">
      {[
        { image: imgVilla, title: "Stay somewhere special", label: "Our stays", href: "/properties" },
        { image: imgDining, title: "Locally rooted, thoughtfully shared", label: "Experiences", href: "/services" },
        { image: imgLandscape, title: "Follow your curiosity", label: "A visual journey", href: "/visual-journey" },
      ].map(item => <Link className="editorial-photo-link" key={item.href} href={item.href}><Image src={item.image} alt={item.title} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" /><div><p className="editorial-eyebrow">{item.label}</p><h2>{item.title}</h2></div></Link>)}
    </section>

    <Reveal as="section" className="editorial-journal editorial-container">
      <h2 className="editorial-section-title">Notes from the route</h2>
      <div className="editorial-journal-grid">{journalArticles.slice(0, 2).map(article => <article key={article.slug}>
        <Link className="editorial-journal-image" href={`/journal/${article.slug}`}><Image src={article.image} alt={article.title} fill sizes="(max-width:640px) 100vw, 50vw" className="object-cover" /></Link>
        <div><h3>{article.title}</h3><p>{article.excerpt}</p><Link className="editorial-link" href={`/journal/${article.slug}`}>Read story</Link></div>
      </article>)}</div>
    </Reveal>

    <section className="editorial-collection" id="stays">
      <div className="editorial-container">
        <h2>Places to stay.<br />Reasons to linger.</h2>
        {stays.length ? <div className="editorial-stay-grid">{stays.map(property => <article className="editorial-stay" key={property.id}>
          <Link className="editorial-stay-image" href={`/properties/${property.slug}`}><Image src={getPrimaryImageUrl(property.images) || imgRetreat} alt={property.title} fill sizes="(max-width:640px) 100vw, 50vw" className="object-cover" /></Link>
          <div className="editorial-stay-copy"><h3><Link href={`/properties/${property.slug}`}>{property.title}</Link></h3><p>{property.description || property.location}</p>
            <div className="editorial-stay-facts">{Boolean(property.bedrooms) && <span><BedDouble size={17} strokeWidth={1} /> {property.bedrooms} {property.bedrooms === 1 ? "bedroom" : "bedrooms"}</span>}{Boolean(property.maxGuests) && <span><Users size={17} strokeWidth={1} /> {property.maxGuests} {property.maxGuests === 1 ? "guest" : "guests"}</span>}</div>
            <Link className="editorial-link" href={`/properties/${property.slug}`}>{property.hidePrice ? "Enquire about this stay" : property.pricePerNight ? `From ${formatNpr(property.pricePerNight)} / night` : "Explore this stay"}</Link>
          </div>
        </article>)}</div> : <p className="editorial-collection-empty">Let us help you find a place that feels like yours.</p>}
        {pages > 1 && <div className="editorial-dots" aria-label="Collection pages">{Array.from({ length: pages }, (_, i) => <button key={i} aria-label={`Show collection page ${i + 1}`} aria-pressed={i === collectionPage} onClick={() => setCollectionPage(i)}><span /></button>)}</div>}
        <div className="editorial-center"><Link className="editorial-link" href="/properties">View all destinations</Link></div>
      </div>
    </section>

    <Reveal as="section" className="editorial-place editorial-container">
      <h2>A personal connection to Nepal.</h2><p>Landscape, craft, food, and people. Discover the places that draw you in, and let us bring them together in a journey of your own.</p>
      <Link href="/visual-journey" className="editorial-landscape"><Image src={imgConnection} alt="Farmers tending a field in Jitpur" fill sizes="(max-width:768px) 100vw, 900px" className="object-cover" /></Link>
      <Link href="/visual-journey" className="editorial-link">A visual journey</Link>
    </Reveal>

    {quote && <section className="editorial-guestbook">
      <h2>The feeling stays with you.</h2><figure aria-live="polite"><blockquote>“{quote.quote}”</blockquote><figcaption>{quote.name}{quote.role && <span>{quote.role}</span>}</figcaption></figure>
      {quotes.length > 1 && <div className="editorial-quote-controls"><button onClick={() => setQuoteIndex((quoteIndex - 1 + quotes.length) % quotes.length)} aria-label="Previous guest story"><ArrowLeft size={19} strokeWidth={1} /></button><span>{quoteIndex + 1} / {quotes.length}</span><button onClick={() => setQuoteIndex((quoteIndex + 1) % quotes.length)} aria-label="Next guest story"><ArrowRight size={19} strokeWidth={1} /></button></div>}
    </section>}

    <section className="editorial-closing"><h2>Come, make yourself at home.</h2><Link href="/contact" className="editorial-link">Begin a conversation</Link></section>
  </div>
}
