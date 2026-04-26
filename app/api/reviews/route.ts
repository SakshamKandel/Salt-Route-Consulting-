import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { reviewSchema } from "@/lib/validations"
import { rateLimit } from "@/lib/rate-limit"
import { safeErrorResponse } from "@/lib/security"
import { createAuditLog, getClientIp } from "@/lib/audit"
import { canReviewBooking } from "@/lib/booking-lifecycle"
import { notifyAdmins, getAdminEmails } from "@/lib/notifications"
import { sendEmailToMany } from "@/lib/email/transporter"
import { render } from "@react-email/render"
import { NewReviewAdminAlert } from "@/emails/NewReviewAdminAlert"

// ─── POST  /api/reviews ───────────────────────────────────
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  // 10.3 — Rate limit: 3 reviews / day / user
  const rl = await rateLimit({ identifier: `review:${userId}`, limit: 3, window: 86400 })
  if (!rl.success) {
    return NextResponse.json({ error: "Review limit reached. Please try again tomorrow." }, { status: 429 })
  }

  try {
    const json = await request.json()

    // 10.2 — Zod
    const validated = reviewSchema.parse(json)

    const booking = await prisma.booking.findUnique({
      where: { id: validated.bookingId },
      include: { property: { select: { title: true } } },
    })

    if (!booking || booking.guestId !== userId || !canReviewBooking(booking)) {
      return NextResponse.json(
        { error: "You can only review a stay after checkout is completed." },
        { status: 403 }
      )
    }

    const existing = await prisma.review.findUnique({
      where: { bookingId: validated.bookingId },
    })

    if (existing) {
      return NextResponse.json({ error: "You have already reviewed this stay." }, { status: 409 })
    }

    const review = await prisma.review.create({
      data: {
        rating: validated.rating,
        comment: validated.comment,
        guestId: userId,
        propertyId: booking.propertyId,
        bookingId: booking.id,
        status: "PENDING",
        isApproved: false,
        images: {
          create: (validated.images || []).map((img) => ({
            url: img.url,
            publicId: img.publicId,
          })),
        },
      },
    })

    // 10.8 — Audit
    await createAuditLog({
      action: "CREATE",
      entity: "REVIEW",
      entityId: review.id,
      userId,
      ipAddress: getClientIp(request.headers),
    })

    await notifyAdmins({
      type: "REVIEW",
      title: "Review awaiting moderation",
      body: `${booking.property.title} received a new guest review.`,
      href: `/admin/reviews/${review.id}`,
      metadata: { reviewId: review.id, bookingId: booking.id },
    })

    // Notify all admins via email
    try {
      const adminEmails = await getAdminEmails()
      const allAdminRecipients = Array.from(new Set([
        ...adminEmails,
        process.env.ADMIN_EMAIL || "admin@saltroute.com"
      ]))

      const adminHtml = await render(NewReviewAdminAlert({
        propertyName: booking.property.title,
        guestName: session.user.name || "Guest",
        rating: validated.rating,
        comment: validated.comment,
        adminUrl: `${process.env.NEXTAUTH_URL || "https://saltroutegroup.com"}/admin/reviews/${review.id}`,
      }))

      await sendEmailToMany({
        to: allAdminRecipients,
        subject: `New Review for Moderation: ${booking.property.title}`,
        html: adminHtml,
      })
    } catch (emailError) {
      console.error("[EMAIL] Review admin notification failed:", emailError)
    }

    return NextResponse.json({ id: review.id })
  } catch (error: unknown) {
    return safeErrorResponse(error, "POST /api/reviews")
  }
}
