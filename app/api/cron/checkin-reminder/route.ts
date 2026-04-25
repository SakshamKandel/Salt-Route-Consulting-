import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email/transporter"
import { BookingCheckinReminder } from "@/emails/BookingCheckinReminder"
import { render } from "@react-email/render"

const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

// POST /api/cron/checkin-reminder
// Called by Vercel Cron (or any scheduler) daily.
// Sends reminder emails to guests whose check-in is in 2 days.
export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret")
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + 2)
  targetDate.setHours(0, 0, 0, 0)

  const dayAfter = new Date(targetDate)
  dayAfter.setDate(dayAfter.getDate() + 1)

  const bookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      checkIn: { gte: targetDate, lt: dayAfter },
    },
    include: {
      guest: { select: { name: true, email: true } },
      property: { select: { title: true, location: true } },
    },
  })

  let sent = 0
  const failed: string[] = []

  for (const booking of bookings) {
    if (!booking.guest.email) continue
    try {
      const html = await render(BookingCheckinReminder({
        name: booking.guest.name || "Guest",
        propertyName: booking.property.title,
        checkIn: fmt(booking.checkIn),
        checkOut: fmt(booking.checkOut),
        bookingCode: booking.bookingCode,
        location: booking.property.location ?? undefined,
        daysUntilArrival: 2,
      }))
      await sendEmail({
        to: booking.guest.email,
        subject: `Your Arrival is in 2 Days — ${booking.property.title}`,
        html,
      })
      sent++
    } catch (err) {
      console.error(`[CHECKIN_REMINDER] booking ${booking.id}:`, err)
      failed.push(booking.id)
    }
  }

  return NextResponse.json({ sent, failed, total: bookings.length })
}
