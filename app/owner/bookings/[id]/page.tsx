import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { formatNpr } from "@/lib/currency"
import { BOOKING_STATUS_LABELS } from "@/lib/booking-lifecycle"
import { ArrowLeft, CalendarDays, MessageCircle, Moon, Quote } from "lucide-react"

const STATUS_CHIP: Record<string, string> = {
  PENDING:    "bg-amber-50 text-amber-600 border-amber-200/60",
  CONFIRMED:  "bg-emerald-50 text-emerald-600 border-emerald-200/60",
  CHECKED_IN: "bg-sky-50 text-sky-600 border-sky-200/60",
  COMPLETED:  "bg-[#1B3A5C]/5 text-[#1B3A5C]/50 border-[#1B3A5C]/10",
  CANCELLED:  "bg-rose-50 text-rose-500 border-rose-200/60",
  NO_SHOW:    "bg-amber-50 text-amber-600 border-amber-200/60",
}

export default async function OwnerBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params

  const booking = await prisma.booking.findUnique({
    where: { id, property: { ownerId: session.user.id } },
    include: {
      guest: { select: { name: true, email: true, phone: true } },
      property: { select: { title: true, id: true, location: true } },
      roomType: { select: { name: true, classType: true } },
    },
  })

  if (!booking) return notFound()

  const nights = Math.round(
    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) /
      (1000 * 60 * 60 * 24)
  )

  const chip = STATUS_CHIP[booking.status] ?? STATUS_CHIP.COMPLETED

  const stayDetails = [
    { label: "Property",   value: booking.property.title,     link: `/owner/properties/${booking.property.id}` },
    ...(booking.roomType ? [{ label: "Room Class", value: booking.roomType.name }] : []),
    { label: "Location",   value: booking.property.location },
    { label: "Check-in",   value: new Date(booking.checkIn).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }) },
    { label: "Check-out",  value: new Date(booking.checkOut).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }) },
    { label: "Duration",   value: `${nights} night${nights !== 1 ? "s" : ""}` },
    { label: "Guests",     value: `${booking.guests} guest${booking.guests !== 1 ? "s" : ""}` },
  ]

  const guestDetails = [
    { label: "Name",  value: booking.guest.name  || "—" },
    { label: "Email", value: booking.guest.email || "—", href: booking.guest.email ? `mailto:${booking.guest.email}` : undefined },
    { label: "Phone", value: booking.guest.phone || "—", href: booking.guest.phone ? `tel:${booking.guest.phone}` : undefined },
  ]

  return (
    <div className="pb-12 space-y-8">

      {/* ── BACK + HEADER ── */}
      <div className="space-y-4">
        <Link
          href="/owner/bookings"
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#1B3A5C]/40 hover:text-[#1B3A5C] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to reservations
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.3em] mb-1">
              Stay Detail
            </p>
            <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">
              <span className="font-mono">{booking.bookingCode}</span>
            </h1>
          </div>

          <span className={`self-start sm:self-auto inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-semibold border uppercase tracking-[0.15em] ${chip}`}>
            {BOOKING_STATUS_LABELS[booking.status]}
          </span>
        </div>
      </div>

      {/* ── SUMMARY STRIP ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-4 sm:p-5">
          <p className="text-[10px] text-[#1B3A5C]/40 uppercase tracking-[0.2em] font-medium mb-2">Total stay value</p>
          <p className="text-xl sm:text-2xl font-semibold text-[#C9A96E] leading-tight tabular-nums break-words">
            {formatNpr(booking.totalPrice)}
          </p>
        </div>
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-4 sm:p-5">
          <p className="text-[10px] text-[#1B3A5C]/40 uppercase tracking-[0.2em] font-medium mb-2">Duration</p>
          <p className="text-xl sm:text-2xl font-semibold text-[#1B3A5C] leading-tight tabular-nums">
            {nights} <span className="text-[13px] font-medium text-[#1B3A5C]/40">night{nights !== 1 ? "s" : ""}</span>
          </p>
        </div>
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-4 sm:p-5">
          <p className="text-[10px] text-[#1B3A5C]/40 uppercase tracking-[0.2em] font-medium mb-2">Booked on</p>
          <p className="text-[14px] font-semibold text-[#1B3A5C] leading-tight pt-1.5">
            {new Date(booking.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* ── TWO-COLUMN DETAIL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">

        {/* Stay Information */}
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#1B3A5C]/5 flex items-center gap-2.5">
            <CalendarDays className="h-3.5 w-3.5 text-[#1B3A5C]/30" />
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#1B3A5C]/45 font-medium">
              Property Stay
            </h2>
          </div>
          <div className="divide-y divide-[#1B3A5C]/5">
            {stayDetails.map((row) => (
              <div
                key={row.label}
                className="flex items-start px-5 py-3.5 gap-4 hover:bg-[#FBF9F4] transition-colors"
              >
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#1B3A5C]/35 font-medium w-24 shrink-0 pt-0.5">
                  {row.label}
                </p>
                {row.link ? (
                  <Link
                    href={row.link}
                    className="text-[13px] font-medium text-[#1B3A5C] hover:text-[#C9A96E] transition-colors"
                  >
                    {row.value}
                  </Link>
                ) : (
                  <p className="text-[13px] text-[#1B3A5C]/70">{row.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Guest Details */}
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl overflow-hidden self-start">
          <div className="px-5 py-3.5 border-b border-[#1B3A5C]/5 flex items-center gap-2.5">
            <MessageCircle className="h-3.5 w-3.5 text-[#1B3A5C]/30" />
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#1B3A5C]/45 font-medium">
              Guest Contact
            </h2>
          </div>
          <div className="divide-y divide-[#1B3A5C]/5">
            {guestDetails.map((row) => (
              <div
                key={row.label}
                className="flex items-start px-5 py-3.5 gap-4 hover:bg-[#FBF9F4] transition-colors"
              >
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#1B3A5C]/35 font-medium w-24 shrink-0 pt-0.5">
                  {row.label}
                </p>
                {row.href ? (
                  <a
                    href={row.href}
                    className="text-[13px] font-medium text-[#1B3A5C] hover:text-[#C9A96E] transition-colors break-all"
                  >
                    {row.value}
                  </a>
                ) : (
                  <p className="text-[13px] text-[#1B3A5C]/70">{row.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── GUEST NOTES ── */}
      {booking.notes && (
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#1B3A5C]/5 flex items-center gap-2.5">
            <Quote className="h-3.5 w-3.5 text-[#1B3A5C]/30" />
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#1B3A5C]/45 font-medium">
              Guest Requests
            </h2>
          </div>
          <div className="px-5 py-4">
            <p className="text-[13px] text-[#1B3A5C]/60 leading-relaxed whitespace-pre-wrap">
              {booking.notes}
            </p>
          </div>
        </div>
      )}

      {/* ── FOOTER ACTION ── */}
      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-start gap-3">
          <Moon className="h-4 w-4 text-[#1B3A5C]/25 mt-0.5 shrink-0" />
          <p className="text-[12px] text-[#1B3A5C]/45">
            Questions about this stay or property preparation? Contact the Salt Route team.
          </p>
        </div>
        <Link
          href="/owner/messages"
          className="shrink-0 self-start sm:self-auto inline-flex items-center px-4 py-2 bg-[#1B3A5C] text-[#FFFAF3] rounded-lg text-[12px] font-medium hover:bg-[#2A4F7A] transition-colors"
        >
          Open messages
        </Link>
      </div>
    </div>
  )
}
