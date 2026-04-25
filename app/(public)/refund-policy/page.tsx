

export const metadata = {
  title: "Refund Policy | Salt Route",
}

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col pt-24">
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 mb-4 font-medium">Legal</p>
          <h1 className="font-display text-4xl md:text-5xl text-charcoal tracking-wide mb-6">Refund Policy.</h1>
          <div className="w-12 h-[1px] bg-charcoal/10 mx-auto mb-6" />
          <p className="text-charcoal/40 text-sm font-sans tracking-wide">Last updated: January 2025</p>
        </div>

        <article className="bg-white border border-charcoal/5 p-10 md:p-16">
          <div className="space-y-12 text-charcoal/60 text-base leading-relaxed font-light">
            <div className="bg-[#FAFAFA] border border-charcoal/10 p-6 text-charcoal/80 text-sm">
              <p className="font-semibold mb-2 uppercase tracking-[0.1em] text-[10px]">Summary</p>
              <p>Free cancellation within 48 hours of confirmation. Partial refunds apply for cancellations 7–30 days before check-in. No refund within 7 days of check-in.</p>
            </div>

            <Section title="Full Refund — 48-Hour Window">
              If you cancel within 48 hours of receiving your booking confirmation, you will receive a full refund regardless of the check-in date, provided check-in is at least 14 days away.
            </Section>

            <Section title="Cancellation 30+ Days Before Check-In">
              Cancellations made 30 or more days before the check-in date (outside the 48-hour window) will receive a 90% refund of the total booking amount. A 10% administrative fee is retained to cover processing costs.
            </Section>

            <Section title="Cancellation 7–29 Days Before Check-In">
              Cancellations made between 7 and 29 days before check-in will receive a 50% refund of the total booking amount.
            </Section>

            <Section title="Cancellation Within 7 Days of Check-In">
              Cancellations made within 7 days of the scheduled check-in date are non-refundable. We strongly recommend travel insurance for protection against unforeseen circumstances.
            </Section>

            <Section title="No-Show">
              Guests who do not arrive on the check-in date and have not notified us in advance will be treated as a no-show and are not eligible for a refund.
            </Section>

            <Section title="Property-Initiated Cancellations">
              In the rare event that a property cancellation is initiated by Salt Route Consulting or the property owner, you will receive a full refund within 5–10 business days, plus our best effort to arrange an equivalent alternative property.
            </Section>

            <Section title="Force Majeure">
              In cases of extraordinary circumstances beyond either party&apos;s control (natural disasters, government travel restrictions, pandemics), we will work with you and the property to find a fair resolution, which may include a credit, rescheduling, or partial refund.
            </Section>

            <Section title="Refund Processing">
              Approved refunds are processed to the original payment method within 5–10 business days. Processing times may vary depending on your bank or card issuer.
            </Section>

            <Section title="How to Cancel">
              To initiate a cancellation, please log in to your account and navigate to My Bookings, or contact us directly at{" "}
              <a href="mailto:info@saltroutegroup.com" className="text-gold hover:text-charcoal transition-colors border-b border-gold/30 hover:border-charcoal">
                info@saltroutegroup.com
              </a>.
            </Section>
          </div>
        </article>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-2xl text-charcoal mb-4 tracking-wide">{title}</h2>
      <p>{children}</p>
    </div>
  )
}
