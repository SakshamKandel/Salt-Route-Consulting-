import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Map, Compass, Camera, Utensils, Car, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Services | Salt Route",
  description: "From property stays to bespoke itineraries — Salt Route's full range of travel services in Nepal."
}

const services = [
  {
    icon: Home,
    title: "Curated Property Stays",
    desc: "Browse and book from our handpicked collection of heritage villas, boutique retreats, and eco-lodges across Nepal's most sought-after destinations.",
    cta: "Browse Properties",
    href: "/properties",
  },
  {
    icon: Map,
    title: "Bespoke Itineraries",
    desc: "Tell us your travel dates, interests, and budget — our consultants design a complete Nepal journey tailored exclusively to you.",
    cta: "Plan My Trip",
    href: "/contact",
  },
  {
    icon: Compass,
    title: "Guided Trekking",
    desc: "From Everest Base Camp to the Annapurna Circuit, we arrange private guided treks with experienced local guides and all logistics handled.",
    cta: "Enquire Now",
    href: "/contact",
  },
  {
    icon: Camera,
    title: "Cultural Experiences",
    desc: "Private temple visits, Tharu cultural evenings, cooking classes with local families, and immersive craft workshops across Nepal.",
    cta: "Discover More",
    href: "/contact",
  },
  {
    icon: Utensils,
    title: "Culinary Journeys",
    desc: "Guided food tours of Kathmandu's backstreets, farm-to-table dinners at our partner properties, and exclusive cooking experiences.",
    cta: "Learn More",
    href: "/contact",
  },
  {
    icon: Car,
    title: "Private Transfers",
    desc: "Door-to-door transfers from Tribhuvan Airport, inter-city private vehicles, and domestic flight bookings — we handle every leg.",
    cta: "Get a Quote",
    href: "/contact",
  },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-cream pt-16">
      {/* Header */}
      <div className="bg-navy py-20 text-center px-4">
        <p className="text-gold text-xs uppercase tracking-widest font-semibold mb-3">What We Offer</p>
        <h1 className="font-display text-4xl md:text-6xl text-cream mb-4">Our Services</h1>
        <p className="text-cream/60 max-w-xl mx-auto text-lg">
          From a single night in a heritage villa to a month-long Nepal odyssey — we take care of every detail.
        </p>
      </div>

      {/* Services grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(({ icon: Icon, title, desc, cta, href }) => (
            <div key={title} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-beige group">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-5 group-hover:bg-gold/20 transition-colors">
                <Icon size={22} className="text-gold" />
              </div>
              <h3 className="font-display text-xl text-navy mb-3">{title}</h3>
              <p className="text-navy/60 text-sm leading-relaxed mb-6">{desc}</p>
              <Button asChild variant="outline" size="sm" className="border-navy/20 text-navy hover:bg-navy hover:text-cream">
                <Link href={href}>{cta} <ArrowRight size={14} className="ml-1" /></Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-beige py-20 text-center px-4">
        <h2 className="font-display text-3xl md:text-4xl text-navy mb-4">Not sure where to start?</h2>
        <p className="text-navy/60 max-w-xl mx-auto mb-8">
          A 15-minute conversation with one of our consultants is enough to sketch the outline of your perfect Nepal trip.
        </p>
        <Button asChild size="lg" className="bg-gold hover:bg-gold-dark text-navy font-semibold px-10">
          <Link href="/contact">Speak to a Consultant</Link>
        </Button>
      </section>
    </div>
  )
}
