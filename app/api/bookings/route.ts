import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { generateBookingCode } from "@/lib/booking-code"
import { NextResponse } from "next/server"
import { bookingSchema } from "@/lib/validations"
import { rateLimit } from "@/lib/rate-limit"
import { isHoneypotTriggered, safeErrorResponse } from "@/lib/security"
import { createAuditLog, getClientIp } from "@/lib/audit"
import { ACTIVE_BOOKING_STATUSES } from "@/lib/booking-lifecycle"
import { notifyAdmins, notifyUser, getAdminEmails } from "@/lib/notifications"
import { render } from "@react-email/render"
import { BookingReceived } from "@/emails/BookingReceived"
import { NewBookingAdminAlert } from "@/emails/NewBookingAdminAlert"
import { sendEmail, sendEmailToMany } from "@/lib/email/transporter"

const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

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
          status: { in: ACTIVE_BOOKING_STATUSES },
          checkIn: { lt: validated.checkOut },
          checkOut: { gt: validated.checkIn },
        },
      })

      if (overlap) {
        throw new Error("Property is no longer available for these dates")
      }

      const blockedDate = await tx.blockedDate.findFirst({
        where: {
          propertyId: validated.propertyId,
          date: {
            gte: validated.checkIn,
            lt: validated.checkOut,
          },
        },
      })

      if (blockedDate) {
        throw new Error("Property is blocked for one or more selected dates")
      }

      // Load authoritative price from DB (never trust client-supplied totalPrice)
      const property = await tx.property.findUnique({
        where: { id: validated.propertyId },
        select: { pricePerNight: true, maxGuests: true, status: true, ownerId: true },
      })
      if (!property || property.status !== "ACTIVE") {
        throw new Error("Property not found")
      }
      if (validated.guests > property.maxGuests) {
        throw new Error(`This property allows up to ${property.maxGuests} guests`)
      }

      const nights = Math.ceil(
        (validated.checkOut.getTime() - validated.checkIn.getTime()) / (1000 * 60 * 60 * 24)
      )
      const totalPrice = Number(property.pricePerNight) * nights

      const guest = await tx.user.findUnique({
        where: { id: userId },
        select: { phone: true },
      })
      const phone = validated.phone?.trim() || guest?.phone?.trim()
      if (!phone) {
        throw new Error("Phone number is required before booking")
      }
      if (phone !== guest?.phone) {
        await tx.user.update({
          where: { id: userId },
          data: { phone },
        })
      }

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
        include: {
          property: { include: { owner: true } },
          guest: true,
        },
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

    await Promise.all([
      notifyAdmins({
        type: "BOOKING",
        title: "New booking request",
        body: `${result.guest.name || result.guest.email} requested ${result.property.title}.`,
        href: `/admin/bookings/${result.id}`,
        metadata: { bookingId: result.id },
      }),
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
          adminUrl: `${process.env.NEXTAUTH_URL || "https://saltroutegroup.com"}/admin/bookings/${result.id}`,
        })),
      ])

      const adminEmails = await getAdminEmails()
      const allAdminRecipients = Array.from(new Set([
        ...adminEmails,
        process.env.ADMIN_EMAIL || "admin@saltroute.com"
      ]))

      await Promise.all([
        sendEmail({
          to: result.guest.email!,
          subject: `Booking Request Received — ${result.bookingCode}`,
          html: guestHtml,
        }),
        sendEmailToMany({
          to: allAdminRecipients,
          subject: `New Booking Request — ${result.bookingCode} | ${result.property.title}`,
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
