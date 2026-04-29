import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { inquirySchema } from "@/lib/validations"
import { rateLimit } from "@/lib/rate-limit"
import { isHoneypotTriggered, safeErrorResponse } from "@/lib/security"
import { createAuditLog, getClientIp } from "@/lib/audit"
import { auth } from "@/auth"
import { notifyAdmins, getAdminEmails } from "@/lib/notifications"
import { publishAdminEvent } from "@/lib/realtime/publisher"
import { sendEmail, sendEmailToMany } from "@/lib/email/transporter"
import { InquiryReceivedAuto } from "@/emails/InquiryReceivedAuto"
import { NewInquiryAdminAlert } from "@/emails/NewInquiryAdminAlert"
import { render } from "@react-email/render"
import { siteConfig, adminUrl } from "@/lib/site.config"

// ─── POST  /api/inquiries ─────────────────────────────────
export async function POST(request: Request) {
  const ip = getClientIp(request.headers)
  const session = await auth()

  const rl = await rateLimit({ identifier: `inquiry:${ip}`, limit: siteConfig.rateLimits.inquiriesPerHour, window: 3600 })
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
    const source = session?.user?.id ? "GUEST_MESSAGE" : "PUBLIC_CONTACT"
    const now = new Date()

    const inquiry = await prisma.inquiry.create({
      data: {
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        subject: validated.subject,
        message: validated.message,
        status: "NEW",
        source,
        lastMessageAt: now,
        lastMessageBy: "GUEST",
        guestLastReadAt: session?.user?.id ? now : null,
        messages: {
          create: {
            sender: "GUEST",
            body: validated.message,
            authorId: session?.user?.id,
          },
        },
      },
    })

    // 10.8 — Audit
    await createAuditLog({
      action: "CREATE",
      entity: "INQUIRY",
      entityId: inquiry.id,
      ipAddress: ip,
    })

    await Promise.all([
      notifyAdmins({
        type: "INQUIRY",
        title: source === "GUEST_MESSAGE" ? "New guest message" : "New inquiry",
        body: `${validated.name}: ${validated.subject}`,
        href: `/admin/inquiries/${inquiry.id}`,
        metadata: { inquiryId: inquiry.id },
      }),
      publishAdminEvent({ type: "inquiry.created", payload: { inquiryId: inquiry.id } }),
    ])

    // Fire-and-forget emails
    try {
      const [autoHtml, adminHtml] = await Promise.all([
        render(InquiryReceivedAuto({
          name: validated.name,
          subject: validated.subject,
          message: validated.message,
        })),
        render(NewInquiryAdminAlert({
          name: validated.name,
          email: validated.email,
          subject: validated.subject,
          message: validated.message,
          phone: validated.phone || undefined,
          inquiryUrl: adminUrl(`/admin/inquiries/${inquiry.id}`),
        })),
      ])

      const adminEmails = await getAdminEmails()
      const allAdminRecipients = Array.from(new Set([
        ...adminEmails,
        siteConfig.contact.adminEmail,
      ]))

      await Promise.all([
        sendEmail({
          to: validated.email,
          subject: siteConfig.emailSubjects.inquiryReceived(),
          html: autoHtml,
        }),
        sendEmailToMany({
          to: allAdminRecipients,
          subject: siteConfig.emailSubjects.newInquiryAdmin(validated.subject),
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
