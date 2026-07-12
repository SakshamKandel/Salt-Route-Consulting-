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
        <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Settings</p>
        <h2 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Email Templates</h2>
        <p className="text-[12px] text-[#1B3A5C]/45 mt-1">
          Transactional emails sent automatically when a guest, owner, or admin event occurs.
        </p>
      </div>

      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1B3A5C]/8 flex items-center gap-2">
          <Mail size={16} className="text-[#C9A96E]" />
          <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#1B3A5C]/60"><span className="tabular-nums">{TEMPLATES.length}</span> Templates</h3>
        </div>
        <div className="divide-y divide-[#1B3A5C]/5">
          {TEMPLATES.map((t) => (
            <div key={t.name} className="flex items-start gap-4 px-5 py-4 hover:bg-[#FBF9F4] transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#1B3A5C]/5 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle size={15} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono font-medium text-[#1B3A5C] text-[13px]">{t.name}</p>
                <p className="text-[11px] text-[#1B3A5C]/50 mt-0.5 truncate">Subject: {t.subject}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-[11px] text-[#1B3A5C]/35">Trigger: {t.trigger}</span>
                  <span className="text-[11px] text-[#1B3A5C]/35">To: {t.recipient}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
