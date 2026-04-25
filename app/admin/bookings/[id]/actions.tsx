"use server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { sendEmail } from "@/lib/email/transporter"
import { BookingConfirmed } from "@/emails/BookingConfirmed"
import { BookingRejected } from "@/emails/BookingRejected"
import { BookingThankYou } from "@/emails/BookingThankYou"
import { OwnerNewBooking } from "@/emails/OwnerNewBooking"
import { render } from "@react-email/render"
import { BookingStatus } from "@prisma/client"
import { createAuditLog } from "@/lib/audit"
import { assertBookingTransition, getBookingStatusTimestampUpdate, BOOKING_STATUS_LABELS } from "@/lib/booking-lifecycle"
import { notifyAdmins, notifyUser } from "@/lib/notifications"

const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

export async function updateBookingStatusAction(id: string, status: BookingStatus, reason?: string) {
  const session = await auth()
  if (!session?.user || !["ADMIN", "OWNER"].includes(session.user.role)) return { error: "Unauthorized" }

  try {
    const current = await prisma.booking.findUnique({
      where: { id },
      include: {
        guest: true,
        property: { include: { owner: true } },
      },
    })

    if (!current) return { error: "Booking not found." }
    if (session.user.role === "OWNER" && current.property.ownerId !== session.user.id) {
      return { error: "Unauthorized" }
    }

    assertBookingTransition(current.status, status, session.user.role)

    if (status === "CANCELLED" && !reason?.trim()) {
      return { error: "A cancellation reason is required." }
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status,
        ...getBookingStatusTimestampUpdate(status),
        ...(reason && { cancellationReason: reason })
      },
      include: {
        guest: true,
        property: { include: { owner: true } }
      }
    })

    // 10.8 — Audit log
    const auditAction = status === "CONFIRMED" ? "BOOKING_CONFIRM" as const
                       : status === "CANCELLED" ? "BOOKING_CANCEL" as const
                       : status === "CHECKED_IN" ? "BOOKING_CHECK_IN" as const
                       : status === "COMPLETED" ? "BOOKING_CHECK_OUT" as const
                       : "UPDATE" as const

    await createAuditLog({
      action: auditAction,
      entity: "BOOKING",
      entityId: id,
      details: { status, reason: reason ?? null },
      userId: session.user.id,
    })

    await notifyUser(booking.guestId, {
      type: "BOOKING",
      title: `Booking ${BOOKING_STATUS_LABELS[status].toLowerCase()}`,
      body: `${booking.property.title} is now ${BOOKING_STATUS_LABELS[status].toLowerCase()}.`,
      href: `/account/bookings/${booking.id}`,
      metadata: { bookingId: booking.id, status },
    })

    if (session.user.role === "OWNER") {
      await notifyAdmins({
        type: "BOOKING",
        title: `Owner marked booking ${BOOKING_STATUS_LABELS[status].toLowerCase()}`,
        body: `${booking.property.title} (${booking.bookingCode}) was updated by the owner.`,
        href: `/admin/bookings/${booking.id}`,
        metadata: { bookingId: booking.id, status },
      })
    } else if (booking.property.ownerId) {
      await notifyUser(booking.property.ownerId, {
        type: "BOOKING",
        title: `Booking ${BOOKING_STATUS_LABELS[status].toLowerCase()}`,
        body: `${booking.property.title} (${booking.bookingCode}) was updated.`,
        href: `/owner/bookings/${booking.id}`,
        metadata: { bookingId: booking.id, status },
      })
    }

    // Send emails based on status transition
    const checkIn = fmt(booking.checkIn)
    const checkOut = fmt(booking.checkOut)
    const dates = `${checkIn} – ${checkOut}`
    const totalPrice = `NPR ${Math.round(Number(booking.totalPrice)).toLocaleString()}`
    const baseUrl = process.env.NEXTAUTH_URL || "https://saltroutegroup.com"

    if (status === "CONFIRMED") {
      const emailTasks: Promise<unknown>[] = []

      const guestHtml = await render(<BookingConfirmed
        name={booking.guest.name || "Guest"}
        propertyName={booking.property.title}
        dates={dates}
        bookingCode={booking.bookingCode}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={booking.guests}
        totalPrice={totalPrice}
        bookingUrl={`${baseUrl}/account/bookings/${booking.id}`}
      />)
      emailTasks.push(
        sendEmail({
          to: booking.guest.email!,
          subject: `Booking Confirmed — ${booking.bookingCode} | ${booking.property.title}`,
          html: guestHtml,
        })
      )

      if (booking.property.owner?.email) {
        const ownerHtml = await render(<OwnerNewBooking
          ownerName={booking.property.owner.name || "Owner"}
          propertyName={booking.property.title}
          guestName={booking.guest.name || "Guest"}
          dates={dates}
          bookingCode={booking.bookingCode}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={booking.guests}
          ownerUrl={`${baseUrl}/owner/bookings/${booking.id}`}
        />)
        emailTasks.push(
          sendEmail({
            to: booking.property.owner.email,
            subject: `New Confirmed Booking — ${booking.bookingCode} | ${booking.property.title}`,
            html: ownerHtml,
          })
        )
      }

      await Promise.all(emailTasks).catch((e) => console.error("[EMAIL] confirmation dispatch:", e))

    } else if (status === "CANCELLED") {
      const html = await render(<BookingRejected
        name={booking.guest.name || "Guest"}
        propertyName={booking.property.title}
        reason={reason}
        bookingCode={booking.bookingCode}
      />)
      await sendEmail({
        to: booking.guest.email!,
        subject: `Booking Update — ${booking.bookingCode}`,
        html,
      }).catch((e) => console.error("[EMAIL] cancellation dispatch:", e))

    } else if (status === "COMPLETED") {
      const html = await render(<BookingThankYou
        name={booking.guest.name || "Guest"}
        propertyName={booking.property.title}
        checkOut={checkOut}
        bookingCode={booking.bookingCode}
        reviewUrl={`${baseUrl}/account/reviews`}
      />)
      await sendEmail({
        to: booking.guest.email!,
        subject: `Thank You for Staying — ${booking.property.title}`,
        html,
      }).catch((e) => console.error("[EMAIL] thank-you dispatch:", e))
    }

    revalidatePath(`/admin/bookings/${id}`)
    revalidatePath(`/admin/bookings`)
    revalidatePath(`/owner/bookings/${id}`)
    revalidatePath(`/owner/bookings`)
    revalidatePath(`/account/bookings/${id}`)
    revalidatePath(`/account/bookings`)
    return { success: true }
  } catch (err: unknown) {
    // 10.9 — Generic error to client
    console.error("[BOOKING_STATUS]", err)
    return { error: "Failed to update booking status." }
  }
}
