import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { bookingSchema } from "@/lib/validations"
import { rateLimit } from "@/lib/rate-limit"
import { isHoneypotTriggered, safeErrorResponse } from "@/lib/security"
import { createAuditLog, getClientIp } from "@/lib/audit"
import { createBooking } from "@/lib/booking-service"
import { notifyAdmins, notifyUser, getAdminEmails } from "@/lib/notifications"
import { publishAdminEvent } from "@/lib/realtime/publisher"
import { render } from "@react-email/render"
import { BookingReceived } from "@/emails/BookingReceived"
import { NewBookingAdminAlert } from "@/emails/NewBookingAdminAlert"
import { sendEmail, sendEmailToMany } from "@/lib/email/transporter"
import { siteConfig, adminUrl } from "@/lib/site.config"

const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

// ─── POST  /api/bookings ────────────────────────────────────
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  const rl = await rateLimit({ identifier: `booking:${userId}`, limit: siteConfig.rateLimits.bookingsPerHour, window: 3600 })
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

    // Ensure the guest has a phone number before creating the booking.
    const guest = await prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true },
    })
    const phone = validated.phone?.trim() || guest?.phone?.trim()
    if (!phone) {
      throw new Error("Phone number is required before booking")
    }
    if (phone !== guest?.phone) {
      await prisma.user.update({
        where: { id: userId },
        data: { phone },
      })
    }

    // Use the unified, lock-protected, serializable booking creation helper.
    const { booking: result } = await createBooking({
      guestId: userId,
      propertyId: validated.propertyId,
      roomTypeId: validated.roomTypeId,
      checkIn: validated.checkIn,
      checkOut: validated.checkOut,
      guests: validated.guests,
      units: validated.units,
      notes: validated.notes,
      status: "PENDING",
    })

    // 10.8 — Audit log
    await createAuditLog({
      action: "BOOKING_CREATE",
      entity: "BOOKING",
      entityId: result.id,
      userId,
      ipAddress: getClientIp(request.headers),
    })

    await Promise.all([
      notifyAdmins({
        type: "BOOKING",
        title: "New booking request",
        body: `${result.guest.name || result.guest.email} requested ${result.property.title}.`,
        href: `/admin/bookings/${result.id}`,
        metadata: { bookingId: result.id },
      }),
      publishAdminEvent({ type: "booking.created", payload: { bookingId: result.id } }),
      notifyUser(result.property.ownerId, {
        type: "BOOKING",
        title: "New request for your property",
        body: `${result.property.title} has a new booking request.`,
        href: `/owner/bookings/${result.id}`,
        metadata: { bookingId: result.id },
      }),
    ])

    // Email dispatch — luxury templates
    try {
      const checkIn = fmt(result.checkIn)
      const checkOut = fmt(result.checkOut)
      const dates = `${checkIn} – ${checkOut}`
      const totalPrice = `NPR ${Math.round(Number(result.totalPrice)).toLocaleString()}`

      const [guestHtml, adminHtml] = await Promise.all([
        render(BookingReceived({
          name: result.guest.name || "Guest",
          propertyName: result.property.title,
          dates,
          bookingCode: result.bookingCode,
          checkIn,
          checkOut,
          guests: result.guests,
          totalPrice,
        })),
        render(NewBookingAdminAlert({
          propertyName: result.property.title,
          guestName: result.guest.name || "Guest",
          guestEmail: result.guest.email ?? undefined,
          dates,
          bookingCode: result.bookingCode,
          checkIn,
          checkOut,
          guests: result.guests,
          totalPrice,
          adminUrl: adminUrl(`/admin/bookings/${result.id}`),
        })),
      ])

      const adminEmails = await getAdminEmails()
      const allAdminRecipients = Array.from(new Set([
        ...adminEmails,
        siteConfig.contact.adminEmail,
      ]))

      await Promise.all([
        sendEmail({
          to: result.guest.email!,
          subject: siteConfig.emailSubjects.bookingReceived(result.bookingCode),
          html: guestHtml,
        }),
        sendEmailToMany({
          to: allAdminRecipients,
          subject: siteConfig.emailSubjects.newBookingAdmin(result.bookingCode, result.property.title),
          html: adminHtml,
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
