import { siteConfig } from "@/lib/site.config"
import { LegalShell, type LegalItem } from "@/components/public/LegalShell"

export const metadata = {
  title: "Terms of Service | Salt Route",
}

const items: LegalItem[] = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    body: `By accessing or using the ${siteConfig.name} platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.`,
  },
  {
    id: "booking",
    title: "Booking and Reservations",
    body: `All bookings are subject to availability and confirmation by our team. A booking is only confirmed once you receive written confirmation from ${siteConfig.name}. We reserve the right to decline any booking request at our discretion.`,
  },
  {
    id: "payment",
    title: "Payment",
    body: "Full payment is required at the time of booking confirmation unless otherwise agreed in writing. Prices are displayed in NPR (Nepalese Rupees) and are subject to change without notice prior to confirmation. Confirmed bookings are charged at the agreed rate.",
  },
  {
    id: "cancellation",
    title: "Cancellation and Refunds",
    body: "Cancellations are subject to our Refund Policy. Please review the Refund Policy page for full details on cancellation windows and applicable charges.",
  },
  {
    id: "accounts",
    title: "User Accounts",
    body: `You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. ${siteConfig.name} is not liable for any loss resulting from unauthorized use of your account.`,
  },
  {
    id: "conduct",
    title: "Prohibited Conduct",
    body: "You agree not to use our platform to transmit any unlawful, fraudulent, or harmful content; to interfere with the operation of the platform; to collect or harvest data about other users; or to impersonate any person or entity.",
  },
  {
    id: "ip",
    title: "Intellectual Property",
    body: `All content on the ${siteConfig.name} platform, including text, images, logos, and design, is the property of ${siteConfig.name} or its licensors and is protected by applicable intellectual property laws.`,
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    body: `${siteConfig.name} is not liable for any indirect, incidental, or consequential damages arising from your use of the platform or our services. Our total liability to you shall not exceed the amount paid for the relevant booking.`,
  },
  {
    id: "law",
    title: "Governing Law",
    body: "These Terms are governed by the laws of Nepal. Any disputes shall be subject to the exclusive jurisdiction of the courts of Kathmandu, Nepal.",
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <>
        For any questions regarding these Terms, please contact us at{" "}
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

export default function TermsPage() {
  return <LegalShell title="Terms of Service." updated="April 2026" items={items} />
}
