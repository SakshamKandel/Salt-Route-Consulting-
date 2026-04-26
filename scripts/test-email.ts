import dotenv from "dotenv"
import { sendEmail, verifyConnection } from "../lib/email/transporter"

dotenv.config({ path: ".env.local" })

async function testEmail() {
  console.log("Starting SMTP verification...")
  console.log("SMTP_HOST:", process.env.SMTP_HOST)
  await verifyConnection()

  console.log("Sending test email to ADMIN_EMAIL...")
  try {
    await sendEmail({
      to: process.env.ADMIN_EMAIL || "admin@saltroutegroup.com",
      subject: "SMTP Connection Test",
      html: "<h1>SMTP Test</h1><p>If you see this, the email sending is working correctly.</p>",
    })
    console.log("Test email sent successfully.")
  } catch (error) {
    console.error("Failed to send test email:", error)
  }
}

testEmail()
