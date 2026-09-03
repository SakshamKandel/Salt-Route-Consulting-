import { CompactButton, CompactHeading, CompactSection } from "@/components/public/Compact"
import { Reveal } from "@/components/public/motion"

const FAQ_GROUPS = [
  {
    label: "Reservations",
    items: [
      {
        q: "How does the booking process work?",
        a: "Browse the collection and submit a request with your preferred dates. Our team reviews availability and contacts you to coordinate the stay.",
      },
      {
        q: "Can I cancel or modify a booking?",
        a: "Yes. Cancellation and modification terms are shown with your booking, and our team can help with any change request.",
      },
      {
        q: "Do I need to create an account to book?",
        a: "Yes. A private account keeps your stay details, messages, and reservations together in one secure guest area.",
      },
    ],
  },
  {
    label: "Rates and inclusions",
    items: [
      {
        q: "Are prices per night or for the entire stay?",
        a: "Displayed property rates are per night. Your estimated total is calculated from the selected room, dates, units, and number of guests before you submit a request.",
      },
      {
        q: "What is included in the price?",
        a: "Each property page lists its included amenities and services. Meals, transfers, and additional experiences are identified separately where applicable.",
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background text-navy">
      <CompactSection>
        <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:gap-12">
          <Reveal as="div">
            <CompactHeading
              eyebrow="Stays and enquiries"
              title="Common questions."
              copy="Useful details before you reserve. If your question is not covered, speak directly with our team."
            />
            <CompactButton href="/contact" className="mt-6">Contact us</CompactButton>
          </Reveal>

          <div className="space-y-8">
            {FAQ_GROUPS.map((group, groupIndex) => (
              <Reveal as="section" key={group.label} delay={0.1 + groupIndex * 0.08}>
                <h2 className="font-display text-2xl text-navy">{group.label}</h2>
                <div className="mt-4 space-y-3">
                  {group.items.map((item, itemIndex) => (
                    <Reveal key={item.q} as="div" delay={itemIndex * 0.06}>
                      <details className="group bg-sand px-5 py-4 sm:px-6">
                        <summary className="cursor-pointer list-none pr-7 font-display text-xl leading-7 text-navy marker:content-none">
                          {item.q}
                        </summary>
                        <p className="mt-3 max-w-2xl font-sans text-[15px] font-light leading-6 text-navy/70">{item.a}</p>
                      </details>
                    </Reveal>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </CompactSection>
    </div>
  )
}
