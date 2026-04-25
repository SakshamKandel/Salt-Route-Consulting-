

export const metadata = {
  title: "Privacy Policy | Salt Route",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col pt-24">
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 mb-4 font-medium">Legal</p>
          <h1 className="font-display text-4xl md:text-5xl text-charcoal tracking-wide mb-6">Privacy Policy.</h1>
          <div className="w-12 h-[1px] bg-charcoal/10 mx-auto mb-6" />
          <p className="text-charcoal/40 text-sm font-sans tracking-wide">Last updated: January 2025</p>
        </div>

        <article className="bg-white border border-charcoal/5 p-10 md:p-16">
          <div className="space-y-12 text-charcoal/60 text-base leading-relaxed font-light">
            <Section title="1. Information We Collect">
              We collect information you provide directly to us, such as your name, email address, phone number, and payment information when you create an account or make a booking. We also collect usage data including pages visited, browser type, and IP address through standard server logs.
            </Section>
            <Section title="2. How We Use Your Information">
              We use your information to process bookings and communicate with you about them; to send service-related communications; to improve our platform; to comply with legal obligations; and to detect and prevent fraud.
            </Section>
            <Section title="3. Information Sharing">
              We do not sell your personal information. We share it only with: property owners to facilitate your stay; payment processors to handle transactions; service providers who assist our operations under strict confidentiality agreements; and when required by law.
            </Section>
            <Section title="4. Data Security">
              We implement industry-standard security measures including encryption in transit, hashed password storage, and access controls. However, no system is completely secure — please notify us immediately if you suspect any unauthorized access.
            </Section>
            <Section title="5. Cookies">
              We use essential session cookies for authentication. We do not use third-party advertising or tracking cookies. You can disable cookies in your browser settings, but this may affect your ability to log in.
            </Section>
            <Section title="6. Data Retention">
              We retain your account data for as long as your account is active. Booking records are retained for seven years as required by financial regulations. You may request deletion of your account at any time.
            </Section>
            <Section title="7. Your Rights">
              You have the right to access, correct, or delete your personal information. You may also request a copy of data we hold about you. Contact us at{" "}
              <a href="mailto:info@saltroutegroup.com" className="text-gold hover:text-charcoal transition-colors border-b border-gold/30 hover:border-charcoal">
                info@saltroutegroup.com
              </a>{" "}
              to exercise these rights.
            </Section>
            <Section title="8. Third-Party Links">
              Our platform may contain links to third-party websites. We are not responsible for the privacy practices of those sites. We encourage you to read their privacy policies.
            </Section>
            <Section title="9. Changes to This Policy">
              We may update this Privacy Policy from time to time. We will notify registered users of material changes by email. Continued use of the platform after changes constitutes acceptance.
            </Section>
            <Section title="10. Contact">
              For privacy-related queries, contact our team at{" "}
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
