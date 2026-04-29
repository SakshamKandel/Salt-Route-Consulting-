import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { formatNpr } from "@/lib/currency"
import { BOOKING_STATUS_LABELS } from "@/lib/booking-lifecycle"
import { ArrowLeft } from "lucide-react"

const statusColors: Record<string, string> = {
  CONFIRMED:  "rgba(96,165,250,0.85)",
  CHECKED_IN: "rgba(52,211,153,0.85)",
  COMPLETED:  "rgba(27,58,92,0.50)",
  CANCELLED:  "rgba(239,100,100,0.7)",
  NO_SHOW:    "rgba(251,191,36,0.7)",
  PENDING:    "rgba(251,191,36,0.85)",
}
const statusBorders: Record<string, string> = {
  CONFIRMED:  "rgba(96,165,250,0.2)",
  CHECKED_IN: "rgba(52,211,153,0.2)",
  COMPLETED:  "rgba(27,58,92,0.12)",
  CANCELLED:  "rgba(239,100,100,0.2)",
  NO_SHOW:    "rgba(251,191,36,0.2)",
  PENDING:    "rgba(251,191,36,0.2)",
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
    },
  })

  if (!booking) return notFound()

  const nights = Math.round(
    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) /
      (1000 * 60 * 60 * 24)
  )

  const statusColor  = statusColors[booking.status]  ?? "rgba(27,58,92,0.40)"
  const statusBorder = statusBorders[booking.status] ?? "rgba(27,58,92,0.12)"

  const stayDetails = [
    { label: "Property",   value: booking.property.title,     link: `/owner/properties/${booking.property.id}` },
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
    <div className="space-y-14">

      {/* ─── BACK + HEADER ─── */}
      <div className="space-y-5">
        <Link
          href="/owner/bookings"
          className="inline-flex items-center gap-3 text-[9px] uppercase tracking-[0.3em] text-[#1B3A5C]/30 hover:text-gold transition-colors duration-500"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[1.3]" />
          Guest Stays
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="w-8 h-px bg-gold/40" />
              <p className="text-[9px] uppercase tracking-[0.45em] text-gold/60 font-medium">
                Stay Detail
              </p>
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-[#1B3A5C] tracking-wide font-mono">
              {booking.bookingCode}
            </h1>
          </div>

          <span
            className="self-start sm:self-auto px-5 py-2.5 text-[9px] uppercase tracking-[0.35em] font-medium"
            style={{ color: statusColor, border: `1px solid ${statusBorder}` }}
          >
            {BOOKING_STATUS_LABELS[booking.status]}
          </span>
        </div>
      </div>

      {/* ─── REVENUE HIGHLIGHT ─── */}
      <div
        className="px-10 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{
          border: "1px solid rgba(201,169,110,0.15)",
          background: "rgba(201,169,110,0.04)",
        }}
      >
        <div>
          <p className="text-[9px] uppercase tracking-[0.4em] text-[#1B3A5C]/40 font-medium mb-1">
            Total Stay Value
          </p>
          <p className="font-display text-3xl text-gold tracking-wide">
            {formatNpr(booking.totalPrice)}
          </p>
        </div>
        <div className="h-px sm:h-10 w-full sm:w-px" style={{ background: "rgba(201,169,110,0.1)" }} />
        <div>
          <p className="text-[9px] uppercase tracking-[0.4em] text-[#1B3A5C]/40 font-medium mb-1">
            Duration
          </p>
          <p className="font-display text-2xl text-[#1B3A5C]/70 tracking-wide">
            {nights} night{nights !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="h-px sm:h-10 w-full sm:w-px" style={{ background: "rgba(201,169,110,0.1)" }} />
        <div>
          <p className="text-[9px] uppercase tracking-[0.4em] text-[#1B3A5C]/40 font-medium mb-1">
            Booked
          </p>
          <p className="text-[12.5px] text-[#1B3A5C]/50 font-light">
            {new Date(booking.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* ─── TWO-COLUMN DETAIL ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">

        {/* Stay Information */}
        <div
          className="overflow-hidden"
          style={{ border: "1px solid rgba(201,169,110,0.08)" }}
        >
          <div
            className="px-8 py-5 flex items-center gap-4"
            style={{ borderBottom: "1px solid rgba(201,169,110,0.07)" }}
          >
            <span className="w-5 h-px bg-gold/40" />
            <h2 className="text-[9.5px] uppercase tracking-[0.4em] text-[#1B3A5C]/40 font-medium">
            Property Stay
            </h2>
          </div>
          <div>
            {stayDetails.map((row, i) => (
              <div
                key={row.label}
                className="flex items-start px-8 py-4.5 gap-4 hover:bg-[#FBF9F4] transition-colors duration-500"
                style={{
                  borderBottom: i < stayDetails.length - 1 ? "1px solid rgba(201,169,110,0.04)" : "none",
                }}
              >
                <p className="text-[9px] uppercase tracking-[0.3em] text-[#1B3A5C]/30 font-medium w-24 shrink-0 pt-0.5">
                  {row.label}
                </p>
                {row.link ? (
                  <Link
                    href={row.link}
                    className="text-[12.5px] text-gold/70 hover:text-gold transition-colors font-light"
                  >
                    {row.value}
                  </Link>
                ) : (
                  <p className="text-[12.5px] text-[#1B3A5C]/60 font-light">{row.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Guest Details */}
        <div
          className="overflow-hidden"
          style={{ border: "1px solid rgba(201,169,110,0.08)" }}
        >
          <div
            className="px-8 py-5 flex items-center gap-4"
            style={{ borderBottom: "1px solid rgba(201,169,110,0.07)" }}
          >
            <span className="w-5 h-px bg-gold/40" />
            <h2 className="text-[9.5px] uppercase tracking-[0.4em] text-[#1B3A5C]/40 font-medium">
            Guest Contact
            </h2>
          </div>
          <div>
            {guestDetails.map((row, i) => (
              <div
                key={row.label}
                className="flex items-start px-8 py-4.5 gap-4 hover:bg-[#FBF9F4] transition-colors duration-500"
                style={{
                  borderBottom: i < guestDetails.length - 1 ? "1px solid rgba(201,169,110,0.04)" : "none",
                }}
              >
                <p className="text-[9px] uppercase tracking-[0.3em] text-[#1B3A5C]/30 font-medium w-24 shrink-0 pt-0.5">
                  {row.label}
                </p>
                {row.href ? (
                  <a
                    href={row.href}
                    className="text-[12.5px] text-gold/70 hover:text-gold transition-colors font-light break-all"
                  >
                    {row.value}
                  </a>
                ) : (
                  <p className="text-[12.5px] text-[#1B3A5C]/60 font-light">{row.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── GUEST NOTES ─── */}
      {booking.notes && (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <span className="w-8 h-px bg-gold/30" />
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#1B3A5C]/40 font-medium">
              Guest Requests
            </h2>
          </div>
          <div
            className="px-8 py-6"
            style={{ border: "1px solid rgba(201,169,110,0.08)", background: "rgba(201,169,110,0.02)" }}
          >
            <p className="text-[13px] text-[#1B3A5C]/50 font-light leading-[1.9] whitespace-pre-wrap italic">
              &ldquo;{booking.notes}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* ─── FOOTER ACTION ─── */}
      <div
        className="flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-7"
        style={{ border: "1px solid rgba(201,169,110,0.08)" }}
      >
        <p className="text-[11.5px] text-[#1B3A5C]/30 font-light">
          Questions about this stay or property preparation? Contact the Salt Route team.
        </p>
        <Link
          href="/owner/messages"
          className="shrink-0 px-7 py-3.5 text-[9px] uppercase tracking-[0.35em] font-medium text-gold/70 hover:text-gold transition-all duration-500"
          style={{ border: "1px solid rgba(201,169,110,0.2)" }}
        >
          Open Messages
        </Link>
      </div>
    </div>
  )
}
