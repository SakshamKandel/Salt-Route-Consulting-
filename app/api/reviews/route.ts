import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { reviewSchema } from "@/lib/validations"
import { rateLimit } from "@/lib/rate-limit"
import { safeErrorResponse } from "@/lib/security"
import { createAuditLog, getClientIp } from "@/lib/audit"

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

    // Check user actually stayed at this property (completed booking)
    const completedStay = await prisma.booking.findFirst({
      where: {
        guestId: userId,
        propertyId: validated.propertyId,
        status: { in: ["CONFIRMED", "COMPLETED"] },
        checkOut: { lte: new Date() },
      },
    })

    if (!completedStay) {
      return NextResponse.json(
        { error: "You can only review properties where you have completed a stay." },
        { status: 403 }
      )
    }

    // One review per property per guest (enforced by schema @@unique too)
    const existing = await prisma.review.findUnique({
      where: { guestId_propertyId: { guestId: userId, propertyId: validated.propertyId } },
    })

    if (existing) {
      return NextResponse.json({ error: "You have already reviewed this property." }, { status: 409 })
    }

    const review = await prisma.review.create({
      data: {
        rating: validated.rating,
        comment: validated.comment,
        guestId: userId,
        propertyId: validated.propertyId,
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

    return NextResponse.json({ id: review.id })
  } catch (error: unknown) {
    return safeErrorResponse(error, "POST /api/reviews")
  }
}
