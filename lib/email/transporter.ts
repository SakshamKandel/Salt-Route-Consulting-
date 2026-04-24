import nodemailer from 'nodemailer'

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_FROM,
} = process.env

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT) || 587,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
})

export const mailOptions = {
  from: SMTP_FROM || '"Salt Route Consulting" <noreply@saltroutegroup.com>',
}

/**
 * Convenience wrapper around transporter.sendMail.
 * Every caller can just do `await sendEmail({ to, subject, html })`.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  return transporter.sendMail({
    ...mailOptions,
    to,
    subject,
    html,
  })
}

// Verification function (use in development to test connection)
export const verifyConnection = async () => {
  try {
    await transporter.verify()
    console.log('✅ SMTP connection successful')
  } catch (error) {
    console.error('❌ SMTP connection failed:', error)
  }
}
