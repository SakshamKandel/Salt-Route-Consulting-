export const metadata = {
  title: "Terms of Service | Salt Route",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-cream pt-16">
      <div className="bg-navy py-16 text-center px-4">
        <h1 className="font-display text-4xl text-cream">Terms of Service</h1>
        <p className="text-cream/50 mt-2 text-sm">Last updated: January 2025</p>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16 prose prose-slate">
        <div className="space-y-8 text-navy/70 text-sm leading-relaxed">
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
            <a href="mailto:info@saltroutegroup.com" className="text-gold hover:underline">
              info@saltroutegroup.com
            </a>.
          </Section>
        </div>
      </article>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-xl text-navy mb-3">{title}</h2>
      <p>{children}</p>
    </div>
  )
}
