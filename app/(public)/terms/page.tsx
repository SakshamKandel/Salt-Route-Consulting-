

export const metadata = {
  title: "Terms of Service | Salt Route",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col pt-24">
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 mb-4 font-medium">Legal</p>
          <h1 className="font-display text-4xl md:text-5xl text-charcoal tracking-wide mb-6">Terms of Service.</h1>
          <div className="w-12 h-[1px] bg-charcoal/10 mx-auto mb-6" />
          <p className="text-charcoal/40 text-sm font-sans tracking-wide">Last updated: January 2025</p>
        </div>

        <article className="bg-white border border-charcoal/5 p-10 md:p-16">
          <div className="space-y-12 text-charcoal/60 text-base leading-relaxed font-light">
            <Section title="1. Acceptance of Terms">
              By accessing or using the Salt Route Consulting platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
            </Section>
            <Section title="2. Booking and Reservations">
              All bookings are subject to availability and confirmation by our team. A booking is only confirmed once you receive written confirmation from Salt Route Consulting. We reserve the right to decline any booking request at our discretion.
            </Section>
            <Section title="3. Payment">
              Full payment is required at the time of booking confirmation unless otherwise agreed in writing. Prices are displayed in USD and are subject to change without notice prior to confirmation. Confirmed bookings are charged at the agreed rate.
            </Section>
            <Section title="4. Cancellation and Refunds">
              Cancellations are subject to our Refund Policy. Please review the Refund Policy page for full details on cancellation windows and applicable charges.
            </Section>
            <Section title="5. User Accounts">
              You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. Salt Route Consulting is not liable for any loss resulting from unauthorized use of your account.
            </Section>
            <Section title="6. Prohibited Conduct">
              You agree not to use our platform to transmit any unlawful, fraudulent, or harmful content; to interfere with the operation of the platform; to collect or harvest data about other users; or to impersonate any person or entity.
            </Section>
            <Section title="7. Intellectual Property">
              All content on the Salt Route platform — including text, images, logos, and design — is the property of Salt Route Consulting or its licensors and is protected by applicable intellectual property laws.
            </Section>
            <Section title="8. Limitation of Liability">
              Salt Route Consulting is not liable for any indirect, incidental, or consequential damages arising from your use of the platform or our services. Our total liability to you shall not exceed the amount paid for the relevant booking.
            </Section>
            <Section title="9. Governing Law">
              These Terms are governed by the laws of Nepal. Any disputes shall be subject to the exclusive jurisdiction of the courts of Kathmandu, Nepal.
            </Section>
            <Section title="10. Contact">
              For any questions regarding these Terms, please contact us at{" "}
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
