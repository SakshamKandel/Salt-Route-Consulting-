"use server"

import { auth } from "@/auth"
import { sendEmail } from "@/lib/email/transporter"
import { render } from "@react-email/render"
import { BookingReceived } from "@/emails/BookingReceived"
import { BookingConfirmed } from "@/emails/BookingConfirmed"
import { BookingRejected } from "@/emails/BookingRejected"
import { BookingCheckinReminder } from "@/emails/BookingCheckinReminder"
import { BookingThankYou } from "@/emails/BookingThankYou"
import { NewBookingAdminAlert } from "@/emails/NewBookingAdminAlert"
import { OwnerNewBooking } from "@/emails/OwnerNewBooking"
import { InquiryReceivedAuto } from "@/emails/InquiryReceivedAuto"
import { NewInquiryAdminAlert } from "@/emails/NewInquiryAdminAlert"
import { VerifyEmail } from "@/emails/VerifyEmail"
import { ResetPassword } from "@/emails/ResetPassword"
import { InvitationEmail } from "@/emails/InvitationEmail"

const DEMO = {
  name: "Priya Sharma",
  propertyName: "Salbari Heritage Home",
  bookingCode: "SLT-2025-0042",
  checkIn: "15 June 2025",
  checkOut: "20 June 2025",
  dates: "15 June 2025 – 20 June 2025",
  guests: 2,
  totalPrice: "NPR 47,500",
  guestEmail: "guest@example.com",
  ownerName: "Anil Thapa",
  location: "Salbari, Jhapa",
}

async function renderTemplate(templateName: string): Promise<{ subject: string; html: string }> {
  const baseUrl = process.env.NEXTAUTH_URL || "https://saltroutegroup.com"

  switch (templateName) {
    case "BookingReceived":
      return {
        subject: `Booking Request Received — ${DEMO.bookingCode}`,
        html: await render(BookingReceived({ ...DEMO })),
      }
    case "BookingConfirmed":
      return {
        subject: `Booking Confirmed — ${DEMO.bookingCode}`,
        html: await render(BookingConfirmed({ ...DEMO, bookingUrl: `${baseUrl}/account/bookings` })),
      }
    case "BookingRejected":
      return {
        subject: `Booking Update — ${DEMO.bookingCode}`,
        html: await render(BookingRejected({ name: DEMO.name, propertyName: DEMO.propertyName, bookingCode: DEMO.bookingCode, reason: "The property is no longer available for the selected dates." })),
      }
    case "BookingCheckinReminder":
      return {
        subject: `Your Arrival Approaches — ${DEMO.propertyName}`,
        html: await render(BookingCheckinReminder({ name: DEMO.name, propertyName: DEMO.propertyName, checkIn: DEMO.checkIn, checkOut: DEMO.checkOut, bookingCode: DEMO.bookingCode, location: DEMO.location, daysUntilArrival: 2 })),
      }
    case "BookingThankYou":
      return {
        subject: `Thank You for Staying — ${DEMO.propertyName}`,
        html: await render(BookingThankYou({ name: DEMO.name, propertyName: DEMO.propertyName, checkOut: DEMO.checkOut, bookingCode: DEMO.bookingCode, reviewUrl: `${baseUrl}/account/reviews` })),
      }
    case "NewBookingAdminAlert":
      return {
        subject: `New Booking Request — ${DEMO.bookingCode}`,
        html: await render(NewBookingAdminAlert({ propertyName: DEMO.propertyName, guestName: DEMO.name, guestEmail: DEMO.guestEmail, dates: DEMO.dates, bookingCode: DEMO.bookingCode, checkIn: DEMO.checkIn, checkOut: DEMO.checkOut, guests: DEMO.guests, totalPrice: DEMO.totalPrice, adminUrl: `${baseUrl}/admin/bookings` })),
      }
    case "OwnerNewBooking":
      return {
        subject: `New Confirmed Booking — ${DEMO.bookingCode}`,
        html: await render(OwnerNewBooking({ ownerName: DEMO.ownerName, propertyName: DEMO.propertyName, guestName: DEMO.name, dates: DEMO.dates, bookingCode: DEMO.bookingCode, checkIn: DEMO.checkIn, checkOut: DEMO.checkOut, guests: DEMO.guests, ownerUrl: `${baseUrl}/owner/bookings` })),
      }
    case "InquiryReceivedAuto":
      return {
        subject: "We Received Your Enquiry — Salt Route",
        html: await render(InquiryReceivedAuto({ name: DEMO.name, subject: "Property availability for June", message: "I am interested in booking Salbari Heritage Home for a family retreat. Could you please let me know the availability and any special packages available?" })),
      }
    case "NewInquiryAdminAlert":
      return {
        subject: "New Enquiry: Property availability for June",
        html: await render(NewInquiryAdminAlert({ name: DEMO.name, email: "priya@example.com", subject: "Property availability for June", message: "I am interested in booking Salbari Heritage Home for a family retreat.", phone: "+977 98XXXXXXXX", inquiryUrl: `${baseUrl}/admin/inquiries` })),
      }
    case "VerifyEmail":
      return {
        subject: "Verify Your Email — Salt Route",
        html: await render(VerifyEmail({ name: DEMO.name, url: `${baseUrl}/verify-email?token=demo` })),
      }
    case "ResetPassword":
      return {
        subject: "Password Reset Request — Salt Route",
        html: await render(ResetPassword({ name: DEMO.name, url: `${baseUrl}/reset-password?token=demo` })),
      }
    case "InvitationEmail":
      return {
        subject: "You Have Been Invited to Salt Route",
        html: await render(InvitationEmail({ role: "Owner", url: `${baseUrl}/accept-invite?token=demo`, invitedBy: "Salt Route Admin" })),
      }
    default:
      throw new Error(`Unknown template: ${templateName}`)
  }
}

export async function sendTestEmailAction(templateName: string, recipientEmail: string): Promise<{ success?: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  try {
    const { subject, html } = await renderTemplate(templateName)
    await sendEmail({ to: recipientEmail, subject: `[TEST] ${subject}`, html })
    return { success: true }
  } catch (err) {
    console.error("[EMAIL TEST]", err)
    return { error: err instanceof Error ? err.message : "Failed to send test email" }
  }
}

export async function sendAllTestEmailsAction(recipientEmail: string): Promise<{ sent: number; failed: string[] }> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { sent: 0, failed: ["Unauthorized"] }

  const templates = ["BookingReceived", "BookingConfirmed", "BookingRejected", "BookingCheckinReminder", "BookingThankYou", "NewBookingAdminAlert", "OwnerNewBooking", "InquiryReceivedAuto", "NewInquiryAdminAlert", "VerifyEmail", "ResetPassword", "InvitationEmail"]

  let sent = 0
  const failed: string[] = []

  for (const t of templates) {
    try {
      const { subject, html } = await renderTemplate(t)
      await sendEmail({ to: recipientEmail, subject: `[TEST] ${subject}`, html })
      sent++
    } catch (err) {
      console.error(`[EMAIL TEST] ${t}:`, err)
      failed.push(t)
    }
  }

  return { sent, failed }
}
