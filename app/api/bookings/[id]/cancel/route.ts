import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { cancelBookingSchema } from "@/lib/validations"
import { assertBookingAccess, safeErrorResponse } from "@/lib/security"
import { createAuditLog, getClientIp } from "@/lib/audit"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // 10.1 — Ownership check
  const access = await assertBookingAccess(id, session.user.id, session.user.role)
  if (!access.ok) return access.response

  try {
    const json = await request.json()

    // 10.2 — Zod validation
    const validated = cancelBookingSchema.parse({ bookingId: id, reason: json.reason })

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { status: true },
    })

    if (!booking) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Only PENDING bookings can be cancelled by non-admin users
    if (session.user.role !== "ADMIN" && booking.status !== "PENDING") {
      return NextResponse.json({ error: "Only pending bookings can be cancelled" }, { status: 400 })
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancellationReason: validated.reason,
      },
    })

    // 10.8 — Audit log
    await createAuditLog({
      action: "BOOKING_CANCEL",
      entity: "BOOKING",
      entityId: id,
      details: { reason: validated.reason },
      userId: session.user.id,
      ipAddress: getClientIp(request.headers),
    })

    return NextResponse.json({ id: updated.id, status: updated.status })
  } catch (error: unknown) {
    return safeErrorResponse(error, "POST /api/bookings/[id]/cancel")
  }
}
