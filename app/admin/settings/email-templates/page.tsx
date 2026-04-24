import { Mail, CheckCircle } from "lucide-react"

const TEMPLATES = [
  {
    name: "VerifyEmail",
    subject: "Verify your email - Salt Route",
    trigger: "User signs up",
    recipient: "New user",
  },
  {
    name: "ResetPassword",
    subject: "Reset your password - Salt Route",
    trigger: "User requests password reset",
    recipient: "User",
  },
  {
    name: "InvitationEmail",
    subject: "You're invited to join Salt Route",
    trigger: "Admin sends an invitation",
    recipient: "Invited owner/admin",
  },
  {
    name: "BookingReceived",
    subject: "Booking request received",
    trigger: "Guest submits a booking",
    recipient: "Guest",
  },
  {
    name: "NewBookingAdminAlert",
    subject: "New booking request — action required",
    trigger: "Guest submits a booking",
    recipient: "Admin",
  },
  {
    name: "BookingConfirmed",
    subject: "Your booking is confirmed",
    trigger: "Admin approves a booking",
    recipient: "Guest",
  },
  {
    name: "BookingRejected",
    subject: "Update on your booking",
    trigger: "Admin rejects a booking",
    recipient: "Guest",
  },
  {
    name: "OwnerNewBooking",
    subject: "New confirmed booking for your property",
    trigger: "Booking confirmed",
    recipient: "Property owner",
  },
  {
    name: "InquiryReceivedAuto",
    subject: "Thanks for your enquiry",
    trigger: "Contact form submitted",
    recipient: "Enquiry sender",
  },
  {
    name: "NewInquiryAdminAlert",
    subject: "New enquiry received",
    trigger: "Contact form submitted",
    recipient: "Admin",
  },
]

export default function EmailTemplatesPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-display text-navy">Email Templates</h2>
        <p className="text-slate-500">
          All transactional emails sent by Salt Route. Templates are built with React Email and rendered server-side.
        </p>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2">
          <Mail size={18} className="text-navy" />
          <h3 className="font-semibold text-navy">{TEMPLATES.length} Templates</h3>
        </div>
        <div className="divide-y">
          {TEMPLATES.map((t) => (
            <div key={t.name} className="flex items-start gap-4 px-5 py-4">
              <div className="w-8 h-8 rounded-full bg-navy/5 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle size={15} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-navy">{t.name}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">Subject: {t.subject}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-slate-400">Trigger: {t.trigger}</span>
                  <span className="text-xs text-slate-400">To: {t.recipient}</span>
                </div>
              </div>
              <span className="shrink-0 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Active</span>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 bg-slate-50 border-t text-xs text-slate-500">
          Templates are located in <code className="font-mono bg-slate-100 px-1 rounded">emails/</code>.
          Edit the <code className="font-mono bg-slate-100 px-1 rounded">.tsx</code> files to customise content and branding.
          SMTP settings are configured via environment variables.
        </div>
      </div>
    </div>
  )
}
