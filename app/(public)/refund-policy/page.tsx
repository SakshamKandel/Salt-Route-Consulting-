import { siteConfig } from "@/lib/site.config"
import { LegalShell, type LegalItem } from "@/components/public/LegalShell"

export const metadata = {
  title: "Refund Policy | Salt Route",
}

const items: LegalItem[] = [
  {
    id: "full-refund",
    title: "Full Refund: 48-Hour Window",
    body: "If you cancel within 48 hours of receiving your booking confirmation, you will receive a full refund regardless of the check-in date, provided check-in is at least 14 days away.",
  },
  {
    id: "30-plus",
    title: "Cancellation 30+ Days Before Check-In",
    body: "Cancellations made 30 or more days before the check-in date (outside the 48-hour window) will receive a 90% refund of the total booking amount. A 10% administrative fee is retained to cover processing costs.",
  },
  {
    id: "7-to-29",
    title: "Cancellation 7 to 29 Days Before Check-In",
    body: "Cancellations made between 7 and 29 days before check-in will receive a 50% refund of the total booking amount.",
  },
  {
    id: "within-7",
    title: "Cancellation Within 7 Days of Check-In",
    body: "Cancellations made within 7 days of the scheduled check-in date are non-refundable. We strongly recommend travel insurance for protection against unforeseen circumstances.",
  },
  {
    id: "no-show",
    title: "No-Show",
    body: "Guests who do not arrive on the check-in date and have not notified us in advance will be treated as a no-show and are not eligible for a refund.",
  },
  {
    id: "property-initiated",
    title: "Property-Initiated Cancellations",
    body: `In the rare event that a property cancellation is initiated by ${siteConfig.name} or the property owner, you will receive a full refund within 5 to 10 business days, plus our best effort to arrange an equivalent alternative property.`,
  },
  {
    id: "force-majeure",
    title: "Force Majeure",
    body: "In cases of extraordinary circumstances beyond either party's control (natural disasters, government travel restrictions, pandemics), we will work with you and the property to find a fair resolution, which may include a credit, rescheduling, or partial refund.",
  },
  {
    id: "processing",
    title: "Refund Processing",
    body: "Approved refunds are processed to the original payment method within 5 to 10 business days. Processing times may vary depending on your bank or card issuer.",
  },
  {
    id: "how-to-cancel",
    title: "How to Cancel",
    body: (
      <>
        To initiate a cancellation, please log in to your account and navigate to My Bookings, or contact us directly at{" "}
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

export default function RefundPolicyPage() {
  return (
    <LegalShell
      title="Refund Policy."
      updated="April 2026"
      items={items}
      summary="Free cancellation within 48 hours of confirmation. Cancellations 30 or more days before check-in receive a 90% refund; cancellations 7 to 29 days before check-in receive a 50% refund. No refund within 7 days of check-in."
    />
  )
}
