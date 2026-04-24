import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { generateBookingCode } from "@/lib/booking-code"
import { sendEmail } from "@/lib/email/transporter"
import { NextResponse } from "next/server"
import { bookingSchema } from "@/lib/validations"
import { rateLimit } from "@/lib/rate-limit"
import { isHoneypotTriggered, safeErrorResponse } from "@/lib/security"
import { createAuditLog, getClientIp } from "@/lib/audit"

// ─── POST  /api/bookings ────────────────────────────────────
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  // 10.3 — Rate limit: 10 bookings / hr / user
  const rl = await rateLimit({ identifier: `booking:${userId}`, limit: 10, window: 3600 })
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
  }

  try {
    const json = await request.json()

    // 10.4 — Honeypot
    if (isHoneypotTriggered(json)) {
      return NextResponse.json({ id: "fake", bookingCode: "SLT-0000-0000" })
    }

    // 10.2 — Zod validation
    const validated = bookingSchema.parse(json)

    const result = await prisma.$transaction(async (tx) => {
      // 10.1 — Double-check availability inside transaction
      const overlap = await tx.booking.findFirst({
        where: {
          propertyId: validated.propertyId,
          status: { in: ["CONFIRMED", "PENDING"] },
          checkIn: { lt: validated.checkOut },
          checkOut: { gt: validated.checkIn },
        },
      })

      if (overlap) {
        throw new Error("Property is no longer available for these dates")
      }

      // Load authoritative price from DB (never trust client-supplied totalPrice)
      const property = await tx.property.findUnique({
        where: { id: validated.propertyId },
        select: { pricePerNight: true },
      })
      if (!property) {
        throw new Error("Property not found")
      }

      const nights = Math.ceil(
        (validated.checkOut.getTime() - validated.checkIn.getTime()) / (1000 * 60 * 60 * 24)
      )
      const totalPrice = Number(property.pricePerNight) * nights

      const bookingCode = await generateBookingCode()

      const booking = await tx.booking.create({
        data: {
          bookingCode,
          checkIn: validated.checkIn,
          checkOut: validated.checkOut,
          guests: validated.guests,
          notes: validated.notes,
          totalPrice,
          guestId: userId,
          propertyId: validated.propertyId,
          status: "PENDING",
        },
        include: { property: true, guest: true },
      })

      return booking
    })

    // 10.8 — Audit log
    await createAuditLog({
      action: "BOOKING_CREATE",
      entity: "BOOKING",
      entityId: result.id,
      userId,
      ipAddress: getClientIp(request.headers),
    })

    // Non-blocking email dispatch (plain HTML, no JSX)
    try {
      await Promise.all([
        sendEmail({
          to: result.guest.email!,
          subject: `Booking Request Received: ${result.bookingCode}`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h2 style="color:#0f172a">Booking Request Received</h2>
            <p>Hi ${result.guest.name},</p>
            <p>Your booking request <strong>${result.bookingCode}</strong> for <strong>${result.property.title}</strong> has been received.</p>
            <p>Check-in: ${result.checkIn.toLocaleDateString()}<br/>Check-out: ${result.checkOut.toLocaleDateString()}</p>
            <p>We will review your request and get back to you shortly.</p>
            <p>Best regards,<br/>Salt Route Consulting</p>
          </div>`,
        }),
        sendEmail({
          to: process.env.ADMIN_EMAIL || "admin@saltroute.com",
          subject: `New Booking Request: ${result.bookingCode}`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h2>New Booking Request</h2>
            <p>Code: <strong>${result.bookingCode}</strong></p>
            <p>Property: ${result.property.title}</p>
            <p>Guest: ${result.guest.name} (${result.guest.email})</p>
            <p>Dates: ${result.checkIn.toLocaleDateString()} → ${result.checkOut.toLocaleDateString()}</p>
          </div>`,
        }),
      ])
    } catch (emailError) {
      console.error("[EMAIL] Booking email dispatch failed:", emailError)
    }

    // 10.9 — Only return safe fields
    return NextResponse.json({
      id: result.id,
      bookingCode: result.bookingCode,
      status: result.status,
    })
  } catch (error: unknown) {
    return safeErrorResponse(error, "POST /api/bookings")
  }
}
