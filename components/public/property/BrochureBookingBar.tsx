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
    <section className="relative z-10 -mt-14 md:-mt-16 w-full px-5 sm:px-6 md:px-12">
      <div className="max-w-screen-xl mx-auto bg-cream border border-charcoal/10 border-t-gold/60 px-6 md:px-10 py-6 md:py-7">
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

          <div className="group space-y-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onSearch}
              className="inline-flex w-full items-center justify-between gap-3 py-1.5 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-charcoal sm:w-auto sm:justify-start sm:tracking-[0.28em]"
            >
              Check Availability
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            {/* Left-grow gold underline over a resting hairline. */}
            <div className="relative h-px w-full sm:w-44 bg-charcoal/15 overflow-hidden">
              <span className="absolute inset-0 origin-left scale-x-0 bg-gold transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-x-100" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
