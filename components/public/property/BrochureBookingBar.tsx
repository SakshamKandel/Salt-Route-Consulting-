"use client"

// ── Brochure booking bar ────────────────────────────────────────────────────
// Slim, image-forward availability strip that sits directly under the hero.
// Underline-only fields + a hairline text CTA — no boxes, borders, or shadows.

import { ArrowRight } from "lucide-react"
import { GoldRule } from "@/components/public/property/primitives"

const FIELD_LABEL =
  "text-[9px] uppercase tracking-[0.16em] sm:tracking-[0.25em] font-sans font-bold text-charcoal/40"
const FIELD_CONTROL =
  "bg-transparent border-0 border-b border-charcoal/20 focus:border-gold focus:outline-none px-0 py-1.5 text-[13px] text-charcoal w-full min-w-0"

export function BrochureBookingBar({
  today,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  guests,
  setGuests,
  maxGuests,
  onSearch,
}: {
  today: string
  checkIn: string
  setCheckIn: (v: string) => void
  checkOut: string
  setCheckOut: (v: string) => void
  guests: number
  setGuests: (n: number) => void
  maxGuests: number
  onSearch: () => void
}) {
  const guestOptions = Array.from({ length: Math.max(maxGuests, 1) }, (_, i) => i + 1)

  return (
    <section className="w-full bg-white">
      <div className="max-w-screen-xl mx-auto px-5 sm:px-6 md:px-12 py-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4 md:gap-8 items-end">
          <label className="block space-y-2">
            <span className={FIELD_LABEL}>Check In</span>
            <input
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className={FIELD_CONTROL}
            />
          </label>

          <label className="block space-y-2">
            <span className={FIELD_LABEL}>Check Out</span>
            <input
              type="date"
              min={checkIn || today}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className={FIELD_CONTROL}
            />
          </label>

          <label className="block space-y-2">
            <span className={FIELD_LABEL}>Guests</span>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className={FIELD_CONTROL}
            >
              {guestOptions.map((n) => (
                <option key={n} value={n}>
                  {n + (n === 1 ? " Adult" : " Adults")}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-2">
            <button
              type="button"
              onClick={onSearch}
              className="group inline-flex w-full items-center justify-between gap-3 py-1.5 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-charcoal sm:w-auto sm:justify-start sm:tracking-[0.3em]"
            >
              Check Availability
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <GoldRule />
          </div>
        </div>
      </div>
    </section>
  )
}
