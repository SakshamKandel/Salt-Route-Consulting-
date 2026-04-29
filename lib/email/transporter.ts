import nodemailer from 'nodemailer'

function makeTransporter() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT) || 465
  return nodemailer.createTransport(
    host?.includes('gmail')
      ? {
          service: 'gmail',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
        }
      : {
          host,
          port,
          secure: port === 465,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
        }
  )
}

// Lazily created so the worker process can load this module after dotenv runs.
let _transporter: ReturnType<typeof nodemailer.createTransport> | null = null
export const transporter = new Proxy({} as ReturnType<typeof nodemailer.createTransport>, {
  get(_target, prop) {
    if (!_transporter) _transporter = makeTransporter()
    const value = (_transporter as never)[prop as never]
    return typeof value === 'function' ? (value as Function).bind(_transporter) : value
  },
})

export const mailOptions = {
  get from() {
    return process.env.SMTP_FROM || `"${process.env.SITE_NAME ?? "Salt Route Consulting"}" <noreply@saltroutegroup.com>`
  },
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

/**
 * Send the same email to multiple recipients
 */
export async function sendEmailToMany({
  to,
  subject,
  html,
}: {
  to: string[]
  subject: string
  html: string
}) {
  const uniqueTo = Array.from(new Set(to.filter(Boolean)))
  if (uniqueTo.length === 0) return

  return Promise.all(
    uniqueTo.map((email) =>
      transporter.sendMail({
        ...mailOptions,
        to: email,
        subject,
        html,
      })
    )
  )
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
