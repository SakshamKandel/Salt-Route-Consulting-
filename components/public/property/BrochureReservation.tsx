"use client"

// ── Brochure: reservation (dark closing band) ───────────────────────────────
// Editorial closing section: a full-height image with a price overlay on the
// left and an underline-only enquiry form on the right. No cards, borders, or
// shadows — the only ornament is the gold hairline. A WhatsApp shortcut sits
// beneath the form for guests who would rather talk to the team directly.

import { ArrowRight, MessageCircle } from "lucide-react"
import { SafeImage, FadeUp, Eyebrow, GoldRule } from "@/components/public/property/primitives"
import type { RoomTypeData } from "@/components/public/property/types"
import { formatNpr } from "@/lib/currency"

const WHATSAPP_HREF =
  "https://wa.me/9779765978384?text=Hi%20Salt%20Route%2C%20I%27d%20like%20to%20enquire%20about%20a%20stay"

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
}) {
  if (!image) return null

  const guestCount = Math.max(maxGuests, 1)
  const labelClass = "text-[9px] uppercase tracking-[0.25em] text-white/40"
  const fieldClass =
    "bg-transparent border-0 border-b border-white/25 focus:border-gold focus:outline-none text-white placeholder:text-white/30 px-0 py-2 font-sans text-[15px] font-light"

  return (
    <section id="reservation" className="relative bg-charcoal text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left — full-height image with price overlay */}
        <div className="relative min-h-[380px] lg:min-h-[640px]">
          <SafeImage
            src={image}
            alt="Reservation"
            fill
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/10 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 md:p-12">
            <Eyebrow light>Starting From</Eyebrow>
            <p className="mt-3 font-display text-4xl text-white">
              {formatNpr(startingPrice)}
              <span className="ml-2 font-sans text-sm font-light text-white/60">/ night</span>
            </p>
          </div>
        </div>

        {/* Right — enquiry form */}
        <div className="px-6 md:px-14 py-16 lg:py-24 w-full max-w-xl">
          <FadeUp>
            <Eyebrow light>Reserve</Eyebrow>
            <h2 className="mt-4 font-display text-3xl md:text-4xl uppercase tracking-wide text-white">
              Make A Reservation
            </h2>
            <GoldRule className="mt-6" />
            <p className="mt-6 font-sans text-[14px] font-light leading-relaxed text-white/60">
              Tell us your dates and we&apos;ll personally confirm availability — no payment is taken now.
            </p>
          </FadeUp>

          {roomTypes.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3">
              {roomTypes.map((rt) => {
                const active = rt.id === roomTypeId
                return (
                  <button
                    key={rt.id}
                    type="button"
                    onClick={() => setRoomTypeId(rt.id)}
                    className={`pb-1 text-left transition-colors ${
                      active
                        ? "text-gold border-b border-gold"
                        : "text-white/55 border-b border-transparent hover:text-white"
                    }`}
                  >
                    <span className="block font-display text-[13px] uppercase tracking-wide">{rt.name}</span>
                    <span className="block font-sans text-[11px] font-light text-white/40">
                      {formatNpr(rt.pricePerNight)}
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
              <span className="col-span-full mt-2 inline-flex items-center gap-3 uppercase tracking-[0.3em] text-[11px] font-bold text-white/30">
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
              className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7 mt-8"
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
                        {rt.name} — {formatNpr(rt.pricePerNight)}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <button
                type="submit"
                className="col-span-full mt-4 inline-flex items-center gap-3 uppercase tracking-[0.3em] text-[11px] font-bold text-white transition-colors hover:text-gold"
              >
                Request Availability
                <ArrowRight className="h-3.5 w-3.5 text-gold" />
              </button>
            </form>
          )}

          {/* WhatsApp shortcut */}
          <div className="mt-10 pt-6 border-t border-white/10">
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
