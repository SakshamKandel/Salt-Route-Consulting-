"use client"

// ── Brochure booking bar ────────────────────────────────────────────────────
// Availability strip docked into the hero's bottom edge: a contained cream
// panel that overlaps the hero image with a decisive hairline seam. Underline
// fields + a left-grow-underline text CTA — no boxes, shadows, or heavy chrome.
// (The page's single high-weight primary CTA lives in the Reservation band.)

import { ArrowRight } from "lucide-react"

const FIELD_LABEL =
  "text-[10px] uppercase tracking-[0.16em] sm:tracking-[0.25em] font-sans font-bold text-charcoal/40"
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
    <section className="relative z-10 -mt-12 md:-mt-14 w-full px-4 sm:px-6 md:px-12">
      <div className="max-w-screen-xl mx-auto bg-white/95 backdrop-blur-md shadow-2xl p-6 md:p-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4 md:gap-8 items-end">
          <label className="block space-y-1.5 cursor-pointer">
            <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-navy/50">Check In</span>
            <input
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="bg-transparent border-0 border-b border-navy/20 focus:border-gold focus:outline-none px-0 py-1.5 text-xs sm:text-sm text-navy font-medium w-full min-w-0"
            />
          </label>

          <label className="block space-y-1.5 cursor-pointer">
            <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-navy/50">Check Out</span>
            <input
              type="date"
              min={checkIn || today}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="bg-transparent border-0 border-b border-navy/20 focus:border-gold focus:outline-none px-0 py-1.5 text-xs sm:text-sm text-navy font-medium w-full min-w-0"
            />
          </label>

          <label className="block space-y-1.5 cursor-pointer">
            <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-navy/50">Guests</span>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="bg-transparent border-0 border-b border-navy/20 focus:border-gold focus:outline-none px-0 py-1.5 text-xs sm:text-sm text-navy font-medium w-full min-w-0 cursor-pointer"
            >
              {guestOptions.map((n) => (
                <option key={n} value={n}>
                  {n + (n === 1 ? " Guest" : " Guests")}
                </option>
              ))}
            </select>
          </label>

          <div className="w-full">
            <button
              type="button"
              onClick={onSearch}
              className="w-full bg-navy text-cream hover:bg-gold hover:text-navy py-3 px-6 text-xs uppercase tracking-[0.22em] font-medium transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>Check Availability</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
