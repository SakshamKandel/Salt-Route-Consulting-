import dotenv from "dotenv"
import { render } from "@react-email/render"
import { NewBookingAdminAlert } from "../emails/NewBookingAdminAlert"
import { sendEmail } from "../lib/email/transporter"

dotenv.config({ path: ".env.local" })

async function testAdminEmail() {
  console.log("Rendering admin alert email...")
  try {
    const adminHtml = await render(
      NewBookingAdminAlert({
        propertyName: "Sunshine Villa (Debug)",
        guestName: "Admin Test",
        guestEmail: "admin@saltroutegroup.com",
        dates: "20 May 2026 to 25 May 2026",
        bookingCode: "DEB-1234-5678",
        checkIn: "20 May 2026",
        checkOut: "25 May 2026",
        guests: 2,
        totalPrice: "NPR 50,000",
        adminUrl: "http://localhost:3000/admin/bookings/debug-id",
      })
    )

    console.log("Sending email to ADMIN_EMAIL:", process.env.ADMIN_EMAIL)

    const info = await sendEmail({
      to: process.env.ADMIN_EMAIL || "admin@saltroutegroup.com",
      subject: "DEBUG: New Booking Request Alert",
      html: adminHtml,
    })

    console.log("Email sent successfully.")
    console.log("MessageId:", info.messageId)
    console.log("Envelope:", JSON.stringify(info.envelope))
  } catch (error) {
    console.error("Failed to send admin alert:", error)
  }
}

testAdminEmail()
