import type { Metadata } from "next"
import Image, { type StaticImageData } from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, CircleCheck, Compass, ShieldCheck } from "lucide-react"
import { CompactContainer } from "@/components/public/Compact"
import { OWNER_SERVICES, type OwnerServiceMeta } from "@/lib/owner-services"
import imgVilla from "@/public/images/marketing/nepal-villa.jpg"
import imgRetreat from "@/public/images/marketing/nepal-residence.jpg"
import imgTeam from "@/public/images/marketing/boutique-office-team.png"
import imgDining from "@/public/images/saltroute/garden-breakfast.webp"
import imgInterior from "@/public/images/marketing/nepal-interior.jpg"

type OwnerService = OwnerServiceMeta & {
  image: StaticImageData
  promise: string
  capabilities: { title: string; copy: string }[]
  process: { title: string; copy: string }[]
  outcomes: string[]
}

// Slug / eyebrow / summary / nav label come from the shared metadata so the
// public navigation always lists exactly the services that are routable here.
// `title` is overridden per-entry with the long editorial headline.
const OWNER_META = new Map(OWNER_SERVICES.map((entry) => [entry.slug, entry]))

const services: OwnerService[] = [
  {
    ...OWNER_META.get("brand-marketing")!,
    title: "Give the property a point of view—and a reason to travel.",
    summary: "We define the idea at the heart of your property, express it through exceptional content, and bring it to the audiences most likely to value it.",
    image: imgVilla,
    promise: "Luxury marketing works when every touchpoint tells the same, specific story. We build that story from the property outward: its architecture, setting, people, rituals, and ambitions.",
    capabilities: [
      { title: "Positioning & identity", copy: "Audience definition, market position, naming, visual direction, tone of voice, and a clear guest promise." },
      { title: "Editorial production", copy: "Architecture and lifestyle photography, cinematic film, interviews, property writing, room narratives, and destination stories." },
      { title: "Digital presence", copy: "Conversion-led website content, search foundations, booking journeys, campaign landing pages, and an owned content library." },
      { title: "Campaigns & PR", copy: "Seasonal launches, social storytelling, press materials, familiarisation stays, embassy introductions, and private-network outreach." },
    ],
    process: [
      { title: "Discover", copy: "A working session and site immersion uncover the most valuable truths about the place." },
      { title: "Define", copy: "We shape the positioning, identity, guest promise, and creative brief before production begins." },
      { title: "Create", copy: "Photography, film, writing, and digital assets are produced as one connected body of work." },
      { title: "Launch & learn", copy: "Campaigns go live with measurable goals, then evolve around demand and guest response." },
    ],
    outcomes: ["A recognisable luxury position", "A complete owned content library", "Higher-quality direct enquiries", "Consistent communication across every channel"],
  },
  {
    ...OWNER_META.get("revenue-distribution")!,
    title: "Build demand without surrendering the value of the stay.",
    summary: "Pricing, distribution, direct sales, and channel decisions work together to improve profitable occupancy while protecting long-term brand value.",
    image: imgRetreat,
    promise: "We do not chase occupancy at any cost. Each decision balances rate integrity, seasonality, guest fit, channel cost, and the experience your team can deliver beautifully.",
    capabilities: [
      { title: "Rate architecture", copy: "Room hierarchy, seasonal bands, minimum stays, packages, restrictions, and dynamic pricing rules." },
      { title: "Channel strategy", copy: "A deliberate mix of direct booking, selected OTAs, luxury advisors, private networks, and trade partnerships." },
      { title: "Reservation sales", copy: "Fast, informed enquiry handling with tailored proposals, considered upselling, and personal follow-through." },
      { title: "Performance insight", copy: "Pickup, pace, source, conversion, ADR, occupancy, and net revenue translated into practical monthly decisions." },
    ],
    process: [
      { title: "Audit", copy: "We assess current rates, calendars, channel costs, booking patterns, and lost opportunities." },
      { title: "Architect", copy: "A clear commercial plan defines rate logic, distribution priorities, and reporting measures." },
      { title: "Activate", copy: "Channels, content, sales responses, and direct-booking tools are aligned and launched." },
      { title: "Optimise", copy: "Weekly trading decisions and monthly owner reviews keep the plan responsive." },
    ],
    outcomes: ["Stronger average daily rate", "More profitable direct business", "Better channel mix", "Clear monthly performance visibility"],
  },
  {
    ...OWNER_META.get("guest-operations")!,
    title: "Turn a beautiful property into a stay guests remember.",
    summary: "We translate the brand promise into practical standards, warm hosting, thoughtful communication, and a calm operating rhythm for the team.",
    image: imgDining,
    promise: "Great hospitality should feel effortless to the guest, even when it is carefully choreographed behind the scenes. We design the systems and train the people who make that possible.",
    capabilities: [
      { title: "Guest journey", copy: "Pre-arrival planning, transfers, welcome rituals, in-stay communication, departure, and post-stay follow-up." },
      { title: "Service standards", copy: "Room readiness, housekeeping, food and beverage, complaint recovery, privacy, safety, and quality audits." },
      { title: "Host development", copy: "Practical coaching, scripts, role play, local storytelling, service confidence, and leadership support." },
      { title: "Concierge design", copy: "A trusted network of guides, drivers, makers, cooks, wellness practitioners, and place-led experiences." },
    ],
    process: [
      { title: "Experience map", copy: "We document every guest touchpoint and identify where service can become more natural and memorable." },
      { title: "Standards", copy: "Simple, usable operating guides are built around the property and its existing team." },
      { title: "Training", copy: "On-site practice gives hosts the judgment and confidence to personalise without losing consistency." },
      { title: "Review", copy: "Guest feedback, audits, and team conversations create a steady improvement cycle." },
    ],
    outcomes: ["More consistent five-star stays", "Confident local teams", "Better guest recovery", "Experiences genuinely rooted in place"],
  },
  {
    ...OWNER_META.get("property-enhancement")!,
    title: "Improve what matters, while protecting what makes the place special.",
    summary: "From pre-opening readiness to seasonal maintenance, we prioritise improvements that strengthen the guest experience and the enduring value of the asset.",
    image: imgInterior,
    promise: "Not every property needs more. Often it needs clearer priorities, better flow, dependable maintenance, and a more coherent relationship between architecture, service, and landscape.",
    capabilities: [
      { title: "Property assessment", copy: "Guest-room, public-space, arrival, landscape, back-of-house, safety, and maintenance walkthroughs." },
      { title: "Design direction", copy: "Practical briefs for layout, lighting, materials, art, furniture, signage, amenities, and sensory details." },
      { title: "Procurement standards", copy: "Durable, locally relevant operating supplies, linens, tableware, guest amenities, and vendor guidance." },
      { title: "Preventive care", copy: "Seasonal plans, issue logs, priority grading, vendor coordination, and visible owner reporting." },
    ],
    process: [
      { title: "Walk", copy: "The assessment combines an owner conversation with a detailed guest-eye and operations-eye inspection." },
      { title: "Prioritise", copy: "Recommendations are ranked by guest impact, urgency, cost, and likely commercial return." },
      { title: "Deliver", copy: "Approved works and procurement are coordinated with clear responsibilities and checkpoints." },
      { title: "Care", copy: "A recurring plan protects standards after the launch or improvement programme is complete." },
    ],
    outcomes: ["A clearer investment roadmap", "Stronger room readiness", "Reduced maintenance surprises", "Improvements consistent with the property's character"],
  },
  {
    ...OWNER_META.get("owner-intelligence")!,
    title: "See what is happening, understand why, and decide what comes next.",
    summary: "A clear owner view brings reservations, revenue, guest sentiment, and asset priorities together—without dragging you into daily management.",
    image: imgTeam,
    promise: "Data is only useful when it creates confidence. Our reporting combines numbers with context, decisions, and named next actions so owners always understand the health of the property.",
    capabilities: [
      { title: "Live visibility", copy: "Reservations, occupancy, room mix, guest details, owner stays, and important operational updates." },
      { title: "Monthly statements", copy: "Revenue, channel costs, management fees, expenses, payouts, and an executive performance commentary." },
      { title: "Guest intelligence", copy: "Review themes, service recovery, repeat interest, preference patterns, and reputation trends." },
      { title: "Asset reporting", copy: "Maintenance status, approved works, open priorities, seasonal preparation, and supporting documentation." },
    ],
    process: [
      { title: "Measure", copy: "The right commercial, guest, and property signals are captured consistently." },
      { title: "Explain", copy: "Monthly commentary separates important movements from ordinary operational noise." },
      { title: "Recommend", copy: "Each review closes with clear actions, owners, and the expected effect." },
      { title: "Decide", copy: "Owners retain approval over material investments, positioning, and protected-use periods." },
    ],
    outcomes: ["Fewer reporting surprises", "Faster owner decisions", "Transparent monthly payouts", "Full ownership and strategic control"],
  },
]

export function generateStaticParams() {
  return services.map(({ slug }) => ({ service: slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }): Promise<Metadata> {
  const { service } = await params
  const item = services.find((entry) => entry.slug === service)
  return item ? { title: `${item.eyebrow} | For Owners`, description: item.summary } : {}
}

export default async function OwnerServicePage({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params
  const item = services.find((entry) => entry.slug === service)
  if (!item) notFound()
  const related = services.filter((entry) => entry.slug !== item.slug).slice(0, 3)

  return (
    <main className="bg-background text-navy">
      <section className="editorial-page-hero relative flex min-h-[650px] items-end overflow-hidden text-cream lg:min-h-[760px]">
        <Image src={item.image} alt={item.eyebrow} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/42 to-navy/20" />
        <CompactContainer className="relative z-10 pb-16 lg:pb-24">
          <Link href="/for-owners" className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/68 hover:text-gold"><ArrowLeft className="h-3.5 w-3.5" /> For owners</Link>
          <p className="mt-10 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">{item.eyebrow}</p>
          <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.7rem,5.5vw,5.5rem)] leading-[1] tracking-[-0.02em]">{item.title}</h1>
          <p className="mt-7 max-w-2xl text-base font-light leading-8 text-cream/82 sm:text-lg">{item.summary}</p>
        </CompactContainer>
      </section>

      <section className="py-20 lg:py-28"><CompactContainer><div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24"><div><p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-dark">Our point of view</p><h2 className="mt-4 font-display text-4xl">Specific to the property. Clear to the owner.</h2></div><p className="font-display text-[clamp(1.5rem,2.8vw,2.4rem)] leading-[1.35] text-navy/80">{item.promise}</p></div></CompactContainer></section>

      <section className=" bg-background py-20 lg:py-28"><CompactContainer>
        <div className="max-w-2xl"><p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-dark">What we do</p><h2 className="mt-4 font-display text-4xl">The work, in detail.</h2></div>
        <div className="mt-12 grid gap-10 md:grid-cols-2">{item.capabilities.map((capability, index) => <article key={capability.title} className="bg-beige p-7 sm:p-10"><p className="text-[10px] tracking-[0.18em] text-gold-dark">0{index + 1}</p><h3 className="mt-4 font-display text-2xl">{capability.title}</h3><p className="mt-4 text-sm font-light leading-7 text-navy/65">{capability.copy}</p></article>)}</div>
      </CompactContainer></section>

      <section className="py-20 lg:py-28"><CompactContainer><div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-dark">How we work</p><h2 className="mt-4 font-display text-4xl">A disciplined path from insight to action.</h2><p className="mt-5 text-sm font-light leading-7 text-navy/64">The exact programme is shaped after the property walkthrough, but every engagement follows a transparent sequence.</p></div>
        <div className="">{item.process.map((step, index) => <article key={step.title} className="grid gap-4  py-7 sm:grid-cols-[70px_0.7fr_1.3fr]"><span className="text-[10px] tracking-[0.18em] text-gold-dark">0{index + 1}</span><h3 className="font-display text-xl">{step.title}</h3><p className="text-sm font-light leading-7 text-navy/62">{step.copy}</p></article>)}</div>
      </div></CompactContainer></section>

      <section className="bg-navy py-20 text-cream lg:py-24"><CompactContainer><div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20"><div><CircleCheck className="h-7 w-7 text-gold" /><h2 className="mt-5 font-display text-4xl">What this creates.</h2></div><div className="grid gap-5 sm:grid-cols-2">{item.outcomes.map((outcome) => <p key={outcome} className="flex gap-3  pt-5 text-sm text-cream/72"><Check className="h-4 w-4 shrink-0 text-gold" />{outcome}</p>)}</div></div></CompactContainer></section>

      <section className="bg-beige py-20 lg:py-24"><CompactContainer><div className="flex items-end justify-between gap-6"><div><p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-dark">Explore the partnership</p><h2 className="mt-4 font-display text-4xl">Related owner services.</h2></div><Compass className="hidden h-7 w-7 text-gold-dark sm:block" /></div><div className="mt-10 grid gap-6 editorial-two-column md:grid-cols-2">{related.map((entry) => <Link key={entry.slug} href={`/for-owners/${entry.slug}`} className="group bg-transparent py-7"><p className="text-[9px] uppercase tracking-[0.18em] text-gold-dark">{entry.eyebrow}</p><h3 className="mt-4 font-display text-2xl">{entry.title}</h3><span className="mt-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]">Read more <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span></Link>)}</div></CompactContainer></section>

      <section className="py-20 text-center lg:py-24"><CompactContainer><ShieldCheck className="mx-auto h-6 w-6 text-gold-dark" /><h2 className="mx-auto mt-5 max-w-3xl font-display text-[clamp(2.2rem,4vw,4rem)]">Let us walk the property with you.</h2><p className="mx-auto mt-5 max-w-xl text-sm font-light leading-7 text-navy/62">A confidential first conversation helps us understand the property, your ambitions, and where our work can create the most value.</p><Link href="/for-owners#owner-enquiry" className="mt-8 inline-flex min-h-12 items-center gap-3 bg-navy px-7 text-[10px] font-semibold uppercase tracking-[0.2em] text-cream hover:bg-gold-dark">Begin a conversation <ArrowRight className="h-4 w-4" /></Link></CompactContainer></section>
    </main>
  )
}
