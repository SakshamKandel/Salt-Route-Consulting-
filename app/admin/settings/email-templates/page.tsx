"use client"

import { useState } from "react"
import { Mail, CheckCircle, Send, Loader2 } from "lucide-react"
import { sendTestEmailAction, sendAllTestEmailsAction } from "./actions"
import { toast } from "sonner"

const TEMPLATES = [
  { name: "BookingReceived",       subject: "Booking Request Received — [code]",       trigger: "Guest submits a booking",         recipient: "Guest"          },
  { name: "BookingConfirmed",      subject: "Booking Confirmed — [code]",               trigger: "Admin confirms a booking",        recipient: "Guest"          },
  { name: "BookingRejected",       subject: "Booking Update — [code]",                  trigger: "Admin cancels a booking",         recipient: "Guest"          },
  { name: "BookingCheckinReminder",subject: "Your Arrival Approaches — [property]",     trigger: "Cron: 2 days before check-in",    recipient: "Guest"          },
  { name: "BookingThankYou",       subject: "Thank You for Staying — [property]",       trigger: "Booking marked Completed",        recipient: "Guest"          },
  { name: "NewBookingAdminAlert",  subject: "New Booking Request — [code]",             trigger: "Guest submits a booking",         recipient: "Admin"          },
  { name: "OwnerNewBooking",       subject: "New Confirmed Booking — [code]",           trigger: "Booking confirmed",               recipient: "Property owner" },
  { name: "InquiryReceivedAuto",   subject: "We Received Your Enquiry",                 trigger: "Contact form submitted",          recipient: "Enquiry sender" },
  { name: "NewInquiryAdminAlert",  subject: "New Enquiry: [subject]",                   trigger: "Contact form submitted",          recipient: "Admin"          },
  { name: "VerifyEmail",           subject: "Verify Your Email — Salt Route",           trigger: "User signs up",                   recipient: "New user"       },
  { name: "ResetPassword",         subject: "Password Reset Request — Salt Route",      trigger: "User requests password reset",    recipient: "User"           },
  { name: "InvitationEmail",       subject: "You Have Been Invited to Salt Route",      trigger: "Admin sends an invitation",       recipient: "Invited owner"  },
]

export default function EmailTemplatesPage() {
  const [testEmail, setTestEmail] = useState("sakshamkandeladobe@gmail.com")
  const [sending, setSending] = useState<string | null>(null)

  async function handleSendOne(templateName: string) {
    if (!testEmail) { toast.error("Enter a recipient email"); return }
    setSending(templateName)
    const result = await sendTestEmailAction(templateName, testEmail)
    setSending(null)
    if (result.error) toast.error(result.error)
    else toast.success(`Test sent: ${templateName}`)
  }

  async function handleSendAll() {
    if (!testEmail) { toast.error("Enter a recipient email"); return }
    setSending("all")
    const result = await sendAllTestEmailsAction(testEmail)
    setSending(null)
    if (result.failed.length > 0) toast.error(`${result.sent} sent, ${result.failed.length} failed: ${result.failed.join(", ")}`)
    else toast.success(`All ${result.sent} templates sent to ${testEmail}`)
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-display text-navy">Email Templates</h2>
        <p className="text-slate-500 mt-1">
          Luxury-branded transactional emails. Built with React Email, rendered server-side, dispatched via SMTP.
        </p>
      </div>

      {/* Test panel */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2 bg-navy/5">
          <Send size={16} className="text-navy" />
          <h3 className="font-semibold text-navy text-sm">Send Test Email</h3>
        </div>
        <div className="px-5 py-4 flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">Recipient</label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
              placeholder="test@example.com"
            />
          </div>
          <button
            onClick={handleSendAll}
            disabled={sending !== null}
            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50"
          >
            {sending === "all" ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Send All ({TEMPLATES.length})
          </button>
        </div>
      </div>

      {/* Template list */}
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
              <button
                onClick={() => handleSendOne(t.name)}
                disabled={sending !== null}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-navy border border-navy/20 rounded-lg hover:bg-navy/5 transition-colors disabled:opacity-40"
              >
                {sending === t.name ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                Test
              </button>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 bg-slate-50 border-t text-xs text-slate-500">
          Templates are in <code className="font-mono bg-slate-100 px-1 rounded">emails/</code>. SMTP is configured via <code className="font-mono bg-slate-100 px-1 rounded">.env.local</code>.
        </div>
      </div>
    </div>
  )
}
