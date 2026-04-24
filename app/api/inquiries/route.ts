import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { inquirySchema } from "@/lib/validations"
import { rateLimit } from "@/lib/rate-limit"
import { isHoneypotTriggered, safeErrorResponse } from "@/lib/security"
import { createAuditLog, getClientIp } from "@/lib/audit"
import { sendEmail } from "@/lib/email/transporter"
import { InquiryReceivedAuto } from "@/emails/InquiryReceivedAuto"
import { NewInquiryAdminAlert } from "@/emails/NewInquiryAdminAlert"
import { render } from "@react-email/render"

// ─── POST  /api/inquiries ─────────────────────────────────
export async function POST(request: Request) {
  const ip = getClientIp(request.headers)

  // 10.3 — Rate limit: 5 inquiries / hr / IP
  const rl = await rateLimit({ identifier: `inquiry:${ip}`, limit: 5, window: 3600 })
  if (!rl.success) {
    return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 })
  }

  try {
    const json = await request.json()

    // 10.4 — Honeypot
    if (isHoneypotTriggered(json)) {
      return NextResponse.json({ success: true })
    }

    // 10.2 — Zod
    const validated = inquirySchema.parse(json)

    const inquiry = await prisma.inquiry.create({
      data: {
        name: validated.name,
        email: validated.email,
        phone: validated.phone ?? null,
        subject: validated.subject,
        message: validated.message,
        status: "NEW",
      },
    })

    // 10.8 — Audit
    await createAuditLog({
      action: "CREATE",
      entity: "INQUIRY",
      entityId: inquiry.id,
      ipAddress: ip,
    })

    // Fire-and-forget emails (don't fail the request if email fails)
    try {
      const [autoHtml, adminHtml] = await Promise.all([
        render(InquiryReceivedAuto({ name: validated.name })),
        render(
          NewInquiryAdminAlert({
            name: validated.name,
            email: validated.email,
            subject: validated.subject,
          })
        ),
      ])

      await Promise.all([
        sendEmail({
          to: validated.email,
          subject: "We received your inquiry - Salt Route",
          html: autoHtml,
        }),
        sendEmail({
          to: process.env.ADMIN_EMAIL || "admin@saltroute.com",
          subject: `New Inquiry: ${validated.subject}`,
          html: adminHtml,
        }),
      ])
    } catch (emailError) {
      console.error("[EMAIL] Inquiry email dispatch failed:", emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    return safeErrorResponse(error, "POST /api/inquiries")
  }
}
