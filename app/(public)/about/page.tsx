import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mountain, Heart, Globe, Award } from "lucide-react"

export const metadata = {
  title: "About Us | Salt Route",
  description: "Learn about Salt Route — Nepal's bespoke luxury travel consultancy."
}

const values = [
  {
    icon: Heart,
    title: "Authentic Experiences",
    desc: "We believe travel should deepen your understanding of a place, not just tick boxes. Every stay is designed to create genuine connection."
  },
  {
    icon: Mountain,
    title: "Local Expertise",
    desc: "Our team has explored every corner of Nepal for decades. We know which lodges have the best sunrise views and which trails are worth every step."
  },
  {
    icon: Globe,
    title: "Sustainable Tourism",
    desc: "We partner exclusively with properties that invest in their communities and minimise their environmental footprint."
  },
  {
    icon: Award,
    title: "Uncompromising Standards",
    desc: "Every property in our collection is personally inspected. If we wouldn't stay there ourselves, it doesn't make the list."
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream pt-16">
      {/* Hero */}
      <div className="relative h-80 md:h-[500px] bg-navy">
        <Image
          src="https://placehold.co/1920x500/1B3A5C/C9A96E?text=Our+Story"
          alt="About Salt Route"
          fill
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p className="text-gold text-xs uppercase tracking-widest font-semibold mb-3">Our Story</p>
          <h1 className="font-display text-4xl md:text-6xl text-cream">About Salt Route</h1>
        </div>
      </div>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center">
          <p className="text-gold text-xs uppercase tracking-widest font-semibold mb-4">Our Mission</p>
          <h2 className="font-display text-3xl md:text-4xl text-navy mb-8">
            Connecting discerning travelers with Nepal&apos;s most extraordinary places
          </h2>
          <p className="text-navy/70 text-lg leading-relaxed mb-6">
            Salt Route was founded by a team of seasoned Nepal travelers and hospitality professionals who shared one frustration: finding truly special accommodations shouldn&apos;t require weeks of research. We created the curated collection we wished had existed when we first fell in love with this extraordinary country.
          </p>
          <p className="text-navy/70 leading-relaxed">
            Today, we work with a handpicked selection of heritage villas, boutique retreats, and eco-lodges across Nepal&apos;s most captivating destinations. Every property is personally vetted, and every guest is supported by a dedicated consultant who knows these places intimately.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-navy py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-gold text-xs uppercase tracking-widest font-semibold mb-3">What We Stand For</p>
            <h2 className="font-display text-4xl text-cream">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-5 p-6 rounded-2xl border border-white/10 hover:border-gold/30 transition-colors">
                <div className="shrink-0 w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                  <Icon size={22} className="text-gold" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-cream mb-2">{title}</h3>
                  <p className="text-cream/60 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team note */}
      <section className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gold text-xs uppercase tracking-widest font-semibold mb-4">The Team</p>
        <h2 className="font-display text-3xl text-navy mb-6">People Who Love Nepal as Much as You Will</h2>
        <p className="text-navy/70 leading-relaxed mb-10">
          Our consultants aren&apos;t travel agents reading from a brochure — they&apos;re people who have hiked these trails, eaten in these kitchens, and slept under these skies. When you speak with us, you get first-hand knowledge, not guesswork.
        </p>
        <Button asChild size="lg" className="bg-navy text-cream hover:bg-navy/90">
          <Link href="/contact">Get in Touch</Link>
        </Button>
      </section>
    </div>
  )
}
