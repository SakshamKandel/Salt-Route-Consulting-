"use client"

// ── Brochure: reservation ───────────────────────────────────────────────────
// A calm image-and-form close to the property story. The request continues to
// the existing booking workflow, where live availability is checked and saved.

import { ArrowRight, CalendarDays, MessageCircle, ShieldCheck, Users } from "lucide-react"
import { SafeImage, FadeUp } from "@/components/public/property/primitives"
import type { RoomTypeData } from "@/components/public/property/types"
import { formatNpr } from "@/lib/currency"

const WHATSAPP_HREF =
  "https://wa.me/9779700013336?text=Hi%20Salt%20Route%2C%20I%27d%20like%20to%20enquire%20about%20a%20stay"

export function BrochureReservation({
  image,
  startingPrice,
  roomTypes,
  maxGuests,
  today,
  resPhone,
  setResPhone,
  guests,
  setGuests,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  roomTypeId,
  setRoomTypeId,
  onSubmit,
  previewMode,
  hidePrice,
}: {
  image: string
  startingPrice: number
  roomTypes: RoomTypeData[]
  maxGuests: number
  today: string
  resPhone: string
  setResPhone: (v: string) => void
  guests: number
  setGuests: (n: number) => void
  checkIn: string
  setCheckIn: (v: string) => void
  checkOut: string
  setCheckOut: (v: string) => void
  roomTypeId: string
  setRoomTypeId: (v: string) => void
  onSubmit: () => void
  previewMode: boolean
  hidePrice?: boolean
}) {
  if (!image) return null

  const guestCount = Math.max(maxGuests, 1)
  const labelClass = "text-[10px] uppercase tracking-[0.24em] font-semibold text-gold"
  // The page's ONE high-weight primary CTA (everything else stays a whisper).
  const submitClass =
    "col-span-full mt-2 inline-flex w-full items-center justify-center gap-3 bg-gold px-10 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-navy transition-all duration-300 hover:bg-gold-light disabled:opacity-50"
  const fieldClass =
    "mt-2 min-h-12 w-full border-0 bg-white/8 px-4 py-3 font-sans text-sm font-light text-cream outline-none transition-colors placeholder:text-white/30 focus:bg-white/12 focus:ring-1 focus:ring-gold/70"

  return (
    <section id="booking" className="relative scroll-mt-20 overflow-hidden bg-navy-dark text-white">
      <span id="reservation" className="absolute -top-20" aria-hidden="true" />
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left — full-height image with price overlay */}
        <div className="relative min-h-[320px] lg:min-h-[560px]">
          <SafeImage
            src={image}
            alt={`Plan a stay at this property`}
            fill
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-navy-dark/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 md:p-12">
            <p className="text-[10px] uppercase tracking-[0.24em] text-gold font-semibold">
              {hidePrice ? "Rates" : "Starting From"}
            </p>
            {hidePrice ? (
              <p className="mt-3 font-display text-3xl text-cream">
                Request a Quote
              </p>
            ) : (
              <p className="mt-3 font-display text-4xl text-cream">
                {formatNpr(startingPrice)}
                <span className="ml-2 font-sans text-sm font-light text-cream/60">/ night</span>
              </p>
            )}
          </div>
        </div>

        {/* Right — enquiry form */}
        <div className="px-6 md:px-14 lg:px-16 py-14 lg:py-20 w-full max-w-2xl">
          <FadeUp>
            <p className="text-[10px] uppercase tracking-[0.26em] text-gold font-semibold mb-2">
              Reserve Your Stay
            </p>
            <h2 className="font-display uppercase tracking-[0.16em] text-cream text-2xl sm:text-3xl md:text-4xl font-normal leading-[1.2]">
              Make a Reservation
            </h2>
            <p className="mt-4 font-sans text-xs sm:text-sm font-light leading-relaxed text-cream/70">
              Share your preferred dates and room. A Salt Route concierge checks live availability, confirms the details, and helps with transfers or special arrangements.
            </p>
            <div className="mt-7 grid grid-cols-3 gap-4 text-cream/65">
              {[
                [CalendarDays, "Choose dates"],
                [Users, "Add your party"],
                [ShieldCheck, "Confirm with us"],
              ].map(([Icon, text]) => (
                <div key={text as string} className="flex flex-col gap-2 text-[10px] leading-4">
                  <Icon className="h-4 w-4 text-gold" />
                  <span>{text as string}</span>
                </div>
              ))}
            </div>
          </FadeUp>

          {roomTypes.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {roomTypes.map((rt) => {
                const active = rt.id === roomTypeId
                return (
                  <button
                    key={rt.id}
                    type="button"
                    onClick={() => setRoomTypeId(rt.id)}
                    className={`px-4 py-3 text-left transition-colors ${
                      active
                        ? "bg-gold text-navy"
                        : "bg-white/7 text-white/58 hover:bg-white/11 hover:text-white"
                    }`}
                  >
                    <span className="block font-display text-[13px] uppercase tracking-wide">{rt.name}</span>
                    <span className={`block font-sans text-[11px] font-light ${active ? "text-navy/60" : "text-white/40"}`}>
                      {hidePrice || rt.hidePrice ? "Request Quote" : formatNpr(rt.pricePerNight)}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {previewMode ? (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7 opacity-60 pointer-events-none">
              {[
                ["Phone", "+977 98XXXXXXXX"],
                ["Guests", "2 Guests"],
                ["Check In", "Select date"],
                ["Check Out", "Select date"],
              ].map(([label, val]) => (
                <div key={label} className="flex flex-col">
                  <span className={labelClass}>{label}</span>
                  <span className={`${fieldClass} text-white/30`}>{val}</span>
                </div>
              ))}
              {roomTypes.length > 0 && (
                <div className="flex flex-col">
                  <span className={labelClass}>Room</span>
                  <span className={`${fieldClass} text-white/30`}>{roomTypes[0]?.name}</span>
                </div>
              )}
              <span className={submitClass}>
                Request Availability
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                onSubmit()
              }}
              className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2"
            >
              <label className="flex flex-col">
                <span className={labelClass}>Phone</span>
                <input
                  type="tel"
                  value={resPhone}
                  onChange={(e) => setResPhone(e.target.value)}
                  placeholder="+977 98XXXXXXXX"
                  className={fieldClass}
                />
              </label>

              <label className="flex flex-col">
                <span className={labelClass}>Guests</span>
                <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className={fieldClass}>
                  {Array.from({ length: guestCount }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n} className="bg-charcoal text-white">
                      {n} {n === 1 ? "Guest" : "Guests"}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col">
                <span className={labelClass}>Check In</span>
                <input
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className={fieldClass}
                />
              </label>

              <label className="flex flex-col">
                <span className={labelClass}>Check Out</span>
                <input
                  type="date"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className={fieldClass}
                />
              </label>

              {roomTypes.length > 0 && (
                <label className="flex flex-col md:col-span-2">
                  <span className={labelClass}>Room</span>
                  <select
                    value={roomTypeId}
                    onChange={(e) => setRoomTypeId(e.target.value)}
                    className={fieldClass}
                  >
                    {roomTypes.map((rt) => (
                      <option key={rt.id} value={rt.id} className="bg-charcoal text-white">
                        {rt.name}{hidePrice || rt.hidePrice ? "" : ` — ${formatNpr(rt.pricePerNight)}`}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <button type="submit" disabled={previewMode} className={submitClass}>
                {hidePrice ? "Request a Quote" : "Request Availability"}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          )}

          {/* WhatsApp shortcut */}
          <div className="mt-8">
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 font-sans text-[13px] text-white/60 transition-colors hover:text-gold"
            >
              <MessageCircle className="h-4 w-4 text-gold" />
              Prefer to talk? Chat with us on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
