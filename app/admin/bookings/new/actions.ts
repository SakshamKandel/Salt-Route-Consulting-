"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { createAuditLog } from "@/lib/audit"
import { createBooking } from "@/lib/booking-service"
import { notifyUser } from "@/lib/notifications"
import { sendEmail } from "@/lib/email/transporter"
import { BookingConfirmed } from "@/emails/BookingConfirmed"
import { OwnerNewBooking } from "@/emails/OwnerNewBooking"
import { render } from "@react-email/render"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { redirect } from "next/navigation"

const manualBookingSchema = z.object({
  guestId: z.string().min(1, "Select a guest"),
  propertyId: z.string().min(1, "Select a property"),
  roomTypeId: z.string().optional().nullable(),
  units: z.number().int().min(1).max(100).optional(),
  checkIn: z.string().date(),
  checkOut: z.string().date(),
  guests: z.number().min(1).max(200),
  notes: z.string().optional(),
})

export async function createManualBookingAction(data: z.infer<typeof manualBookingSchema>) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  try {
    const validated = manualBookingSchema.parse(data)

    const checkIn = new Date(validated.checkIn)
    const checkOut = new Date(validated.checkOut)
    if (checkIn >= checkOut) return { error: "Check-out must be after check-in." }

    const guest = await prisma.user.findUnique({
      where: { id: validated.guestId },
      select: { name: true, email: true },
    })
    if (!guest) return { error: "Guest not found." }

    // Use the unified, lock-protected, serializable booking creation helper.
    // This ensures the manual path gets the same advisory-lock + availability
    // check + Decimal pricing as the public path.
    const { booking } = await createBooking({
      guestId: validated.guestId,
      propertyId: validated.propertyId,
      roomTypeId: validated.roomTypeId,
      checkIn,
      checkOut,
      guests: validated.guests,
      units: validated.units,
      notes: validated.notes,
      status: "CONFIRMED",
    })

    const property = booking.property
    const dates = `${booking.checkIn.toLocaleDateString()} to ${booking.checkOut.toLocaleDateString()}`

    await createAuditLog({
      action: "BOOKING_CREATE",
      entity: "BOOKING",
      entityId: booking.id,
      userId: session.user.id,
      details: { manual: true, guestId: validated.guestId, propertyId: validated.propertyId },
    })

    if (guest.email) {
      sendEmail({
        to: guest.email,
        subject: `Booking Confirmed: ${booking.bookingCode}`,
        html: await render(
          BookingConfirmed({
            name: guest.name || "Guest",
            propertyName: property.title,
            dates,
          })
        ),
      }).catch(console.error)
    }

    await notifyUser(validated.guestId, {
      type: "BOOKING",
      title: "Booking confirmed",
      body: `${property.title} is confirmed for ${dates}.`,
      href: `/account/bookings/${booking.id}`,
      metadata: { bookingId: booking.id },
    })

    if (property.owner?.email) {
      sendEmail({
        to: property.owner.email,
        subject: `New Booking at ${property.title}: ${booking.bookingCode}`,
        html: await render(
          OwnerNewBooking({
            ownerName: property.owner.name || "Owner",
            propertyName: property.title,
            guestName: guest.name || "Guest",
            dates,
          })
        ),
      }).catch(console.error)
    }

    await notifyUser(property.ownerId, {
      type: "BOOKING",
      title: "New confirmed booking",
      body: `${property.title} has a new confirmed booking.`,
      href: `/owner/bookings/${booking.id}`,
      metadata: { bookingId: booking.id },
    })

    revalidatePath("/admin/bookings")
    redirect(`/admin/bookings/${booking.id}`)
  } catch (err) {
    console.error("[MANUAL_BOOKING]", err)
    return { error: "Failed to create booking." }
  }
}
