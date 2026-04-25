"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { createAuditLog } from "@/lib/audit"
import { generateBookingCode } from "@/lib/booking-code"
import { ACTIVE_BOOKING_STATUSES } from "@/lib/booking-lifecycle"
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
  checkIn: z.string().date(),
  checkOut: z.string().date(),
  guests: z.number().min(1).max(50),
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

    const property = await prisma.property.findUnique({
      where: { id: validated.propertyId },
      select: {
        pricePerNight: true,
        title: true,
        ownerId: true,
        owner: { select: { name: true, email: true } },
      },
    })
    if (!property) return { error: "Property not found." }

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const totalPrice = Number(property.pricePerNight) * nights

    const overlap = await prisma.booking.findFirst({
      where: {
        propertyId: validated.propertyId,
        status: { in: ACTIVE_BOOKING_STATUSES },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
    })
    if (overlap) return { error: "These dates overlap with an existing booking." }

    const guest = await prisma.user.findUnique({
      where: { id: validated.guestId },
      select: { name: true, email: true },
    })
    if (!guest) return { error: "Guest not found." }

    const booking = await prisma.booking.create({
      data: {
        bookingCode: await generateBookingCode(),
        guestId: validated.guestId,
        propertyId: validated.propertyId,
        checkIn,
        checkOut,
        guests: validated.guests,
        totalPrice,
        status: "CONFIRMED",
        confirmedAt: new Date(),
        notes: validated.notes,
      },
    })

    await createAuditLog({
      action: "BOOKING_CREATE",
      entity: "BOOKING",
      entityId: booking.id,
      userId: session.user.id,
      details: { manual: true, guestId: validated.guestId, propertyId: validated.propertyId },
    })

    const dates = `${checkIn.toLocaleDateString()} to ${checkOut.toLocaleDateString()}`

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
