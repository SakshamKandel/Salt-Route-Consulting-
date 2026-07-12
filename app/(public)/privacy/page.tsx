import { LegalShell, type LegalItem } from "@/components/public/LegalShell"

export const metadata = {
  title: "Privacy Policy | Salt Route",
}

const items: LegalItem[] = [
  {
    id: "collect",
    title: "Information We Collect",
    body: "We collect information you provide directly to us, such as your name, email address, phone number, and payment information when you create an account or make a booking. We also collect usage data including pages visited, browser type, and IP address through standard server logs.",
  },
  {
    id: "use",
    title: "How We Use Your Information",
    body: "We use your information to process bookings and communicate with you about them; to send service-related communications; to improve our platform; to comply with legal obligations; and to detect and prevent fraud.",
  },
  {
    id: "sharing",
    title: "Information Sharing",
    body: "We do not sell your personal information. We share it only with: property owners to facilitate your stay; payment processors to handle transactions; service providers who assist our operations under strict confidentiality agreements; and when required by law.",
  },
  {
    id: "security",
    title: "Data Security",
    body: "We implement industry-standard security measures including encryption in transit, hashed password storage, and access controls. However, no system is completely secure. Please notify us immediately if you suspect any unauthorized access.",
  },
  {
    id: "cookies",
    title: "Cookies",
    body: "We use essential session cookies for authentication. We do not use third-party advertising or tracking cookies. You can disable cookies in your browser settings, but this may affect your ability to log in.",
  },
  {
    id: "retention",
    title: "Data Retention",
    body: "We retain your account data for as long as your account is active. Booking records are retained for seven years as required by financial regulations. You may request deletion of your account at any time.",
  },
  {
    id: "rights",
    title: "Your Rights",
    body: (
      <>
        You have the right to access, correct, or delete your personal information. You may also request a copy of data we hold about you. Contact us at{" "}
        <a
          href="mailto:connect@saltroutecorp.com"
          className="text-gold hover:text-navy transition-colors border-b border-gold/30 hover:border-navy"
        >
          connect@saltroutecorp.com
        </a>{" "}
        to exercise these rights.
      </>
    ),
  },
  {
    id: "links",
    title: "Third-Party Links",
    body: "Our platform may contain links to third-party websites. We are not responsible for the privacy practices of those sites. We encourage you to read their privacy policies.",
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. We will notify registered users of material changes by email. Continued use of the platform after changes constitutes acceptance.",
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <>
        For privacy-related queries, contact our team at{" "}
        <a
          href="mailto:connect@saltroutecorp.com"
          className="text-gold hover:text-navy transition-colors border-b border-gold/30 hover:border-navy"
        >
          connect@saltroutecorp.com
        </a>
        .
      </>
    ),
  },
]

export default function PrivacyPage() {
  return <LegalShell title="Privacy Policy." updated="April 2026" items={items} />
}
