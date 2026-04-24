"use server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { sendEmail } from "@/lib/email/transporter"
import { BookingConfirmed } from "@/emails/BookingConfirmed"
import { BookingRejected } from "@/emails/BookingRejected"
import { OwnerNewBooking } from "@/emails/OwnerNewBooking"
import { render } from "@react-email/render"
import { BookingStatus } from "@prisma/client"
import { createAuditLog } from "@/lib/audit"

export async function updateBookingStatusAction(id: string, status: BookingStatus, reason?: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status,
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
                       : "UPDATE" as const

    await createAuditLog({
      action: auditAction,
      entity: "BOOKING",
      entityId: id,
      details: { status, reason: reason ?? null },
      userId: session.user.id,
    })

    // Send emails
    if (status === "CONFIRMED") {
      const dates = `${booking.checkIn.toLocaleDateString()} to ${booking.checkOut.toLocaleDateString()}`
      const guestHtml = await render(<BookingConfirmed
        name={booking.guest.name || "Guest"}
        propertyName={booking.property.title}
        dates={dates}
      />)
      const emails: Promise<unknown>[] = [
        sendEmail({
          to: booking.guest.email!,
          subject: `Booking Confirmed: ${booking.bookingCode}`,
          html: guestHtml,
        }),
      ]

      // Also notify the property owner
      if (booking.property.owner?.email) {
        const ownerHtml = await render(<OwnerNewBooking
          ownerName={booking.property.owner.name || "Owner"}
          propertyName={booking.property.title}
          guestName={booking.guest.name || "Guest"}
          dates={dates}
        />)
        emails.push(
          sendEmail({
            to: booking.property.owner.email,
            subject: `New Booking at ${booking.property.title}: ${booking.bookingCode}`,
            html: ownerHtml,
          })
        )
      }

      await Promise.all(emails).catch((e) => console.error("[EMAIL] approval dispatch:", e))
    } else if (status === "CANCELLED" && reason) {
      const html = await render(<BookingRejected 
        name={booking.guest.name || "Guest"}
        propertyName={booking.property.title}
        reason={reason} 
      />)
      await sendEmail({
        to: booking.guest.email!,
        subject: `Update on your Booking: ${booking.bookingCode}`,
        html
      })
    }

    revalidatePath(`/admin/bookings/${id}`)
    revalidatePath(`/admin/bookings`)
    return { success: true }
  } catch (err: unknown) {
    // 10.9 — Generic error to client
    console.error("[BOOKING_STATUS]", err)
    return { error: "Failed to update booking status." }
  }
}
