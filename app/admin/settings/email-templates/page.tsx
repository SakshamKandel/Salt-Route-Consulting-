import { Mail, CheckCircle } from "lucide-react"

const TEMPLATES = [
  { name: "BookingReceived",       subject: "Booking Request Received: [code]",       trigger: "Guest submits a booking",         recipient: "Guest"          },
  { name: "BookingConfirmed",      subject: "Booking Confirmed: [code]",               trigger: "Admin confirms a booking",        recipient: "Guest"          },
  { name: "BookingRejected",       subject: "Booking Update: [code]",                  trigger: "Admin cancels a booking",         recipient: "Guest"          },
  { name: "BookingCheckinReminder",subject: "Your Arrival Approaches: [property]",     trigger: "Cron: 2 days before check-in",    recipient: "Guest"          },
  { name: "BookingThankYou",       subject: "Thank You for Staying: [property]",       trigger: "Booking marked Completed",        recipient: "Guest"          },
  { name: "NewBookingAdminAlert",  subject: "New Booking Request: [code]",             trigger: "Guest submits a booking",         recipient: "Admin"          },
  { name: "OwnerNewBooking",       subject: "New Confirmed Booking: [code]",           trigger: "Booking confirmed",               recipient: "Property owner" },
  { name: "InquiryReceivedAuto",   subject: "We Received Your Enquiry",                trigger: "Contact form submitted",          recipient: "Enquiry sender" },
  { name: "NewInquiryAdminAlert",  subject: "New Enquiry: [subject]",                  trigger: "Contact form submitted",          recipient: "Admin"          },
  { name: "VerifyEmail",           subject: "Verify Your Email: Salt Route",           trigger: "User signs up",                   recipient: "New user"       },
  { name: "ResetPassword",         subject: "Password Reset Request: Salt Route",      trigger: "User requests password reset",    recipient: "User"           },
  { name: "InvitationEmail",       subject: "You Have Been Invited to Salt Route",     trigger: "Admin sends an invitation",       recipient: "Invited owner"  },
]

export default function EmailTemplatesPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-display text-navy">Email Templates</h2>
        <p className="text-slate-500 mt-1">
          Transactional emails sent automatically when a guest, owner, or admin event occurs.
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
                <p className="font-medium text-navy text-sm">{t.name}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">Subject: {t.subject}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-slate-400">Trigger: {t.trigger}</span>
                  <span className="text-xs text-slate-400">To: {t.recipient}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
