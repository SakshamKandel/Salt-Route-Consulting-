"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { DateRange } from "react-day-picker"
import { BookingCalendar } from "./booking-calendar"
import { LuxuryButton } from "@/components/ui/luxury-button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { formatNpr } from "@/lib/currency"

interface Props {
  propertyId: string;
  pricePerNight: number;
  maxGuests: number;
  isAuthenticated?: boolean;
  initialPhone?: string | null;
}

type BookingCreateResponse = {
  bookingCode?: string
  error?: string
}

type BookingDraft = {
  checkIn?: string
  checkOut?: string
  guests: number
  phone: string
  notes: string
}

function parseDraftDate(value?: string) {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export function BookingRequestForm({
  propertyId,
  pricePerNight,
  maxGuests,
  isAuthenticated = false,
  initialPhone = "",
}: Props) {
  const router = useRouter()
  const [date, setDate] = useState<DateRange | undefined>()
  const [guests, setGuests] = useState(1)
  const [phone, setPhone] = useState(initialPhone || "")
  const [notes, setNotes] = useState("")
  const [website, setWebsite] = useState("") // honeypot
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draftReady, setDraftReady] = useState(false)

  const draftKey = useMemo(() => `salt-route:booking-draft:${propertyId}`, [propertyId])

  const numberOfNights = date?.from && date?.to 
    ? Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalPrice = numberOfNights > 0 ? numberOfNights * pricePerNight : 0;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const raw = window.localStorage.getItem(draftKey)
        if (raw) {
          const draft = JSON.parse(raw) as BookingDraft
          setDate({
            from: parseDraftDate(draft.checkIn),
            to: parseDraftDate(draft.checkOut),
          })
          setGuests(Math.min(Math.max(draft.guests || 1, 1), maxGuests))
          setPhone(draft.phone || initialPhone || "")
          setNotes(draft.notes || "")
        }
      } catch {
        window.localStorage.removeItem(draftKey)
      } finally {
        setDraftReady(true)
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [draftKey, initialPhone, maxGuests])

  useEffect(() => {
    if (!draftReady) return

    const draft: BookingDraft = {
      checkIn: date?.from?.toISOString(),
      checkOut: date?.to?.toISOString(),
      guests,
      phone,
      notes,
    }

    const hasDraft = Boolean(draft.checkIn || draft.checkOut || phone || notes || guests !== 1)
    if (hasDraft) {
      window.localStorage.setItem(draftKey, JSON.stringify(draft))
    } else {
      window.localStorage.removeItem(draftKey)
    }
  }, [date?.from, date?.to, draftKey, draftReady, guests, notes, phone])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date?.from || !date?.to) {
      setError("Please select check-in and check-out dates")
      return
    }
    if (phone.trim().length < 7) {
      setError("Please enter a valid phone number")
      return
    }
    
    setIsSubmitting(true)
    setError(null)

    if (!isAuthenticated) {
      const callbackUrl = `/booking-request?property=${propertyId}`
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
      return
    }
    
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          checkIn: date.from.toISOString(),
          checkOut: date.to.toISOString(),
          guests,
          phone: phone.trim(),
          notes,
          website,
        })
      })
      
      const data = (await res.json()) as BookingCreateResponse
      
      if (!res.ok) {
        if (res.status === 401) {
          const callbackUrl = `/booking-request?property=${propertyId}`
          router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
          return
        }
        throw new Error(data.error || "We could not send your stay request. Please try again.")
      }

      window.localStorage.removeItem(draftKey)
      router.push(`/booking-request/success?code=${data.bookingCode}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "We could not send your stay request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Custom luxury input class
  const inputClass = "rounded-none border-0 border-b border-charcoal/20 bg-transparent px-0 py-3 text-sm focus-visible:border-charcoal focus-visible:ring-0 placeholder:text-charcoal/30 font-sans"

  return (
    <div className="w-full max-w-lg mx-auto bg-[#FBF9F4] p-8 md:p-12 border border-charcoal/10">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-display text-charcoal mb-4">RESERVE YOUR STAY</h2>
        <p className="text-charcoal/60 font-sans text-sm tracking-widest uppercase">
          {formatNpr(pricePerNight)} <span className="lowercase text-[10px] tracking-normal">/ night</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Honeypot */}
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        {/* 1. Dates */}
        <div className="flex flex-col gap-4">
          <Label className="text-[10px] uppercase tracking-[0.2em] font-sans font-semibold text-charcoal/60">
            01. Dates
          </Label>
          <div className="border border-charcoal/10 bg-white p-4">
            <BookingCalendar propertyId={propertyId} date={date} setDate={setDate} />
          </div>
        </div>

        {!isAuthenticated && (
          <div className="p-4 border border-charcoal/10 bg-charcoal/5 text-xs text-charcoal/70 font-sans text-center tracking-wide">
            Select dates and details. You will be asked to sign in before confirming.
          </div>
        )}

        {/* 2. Guests */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="guests" className="text-[10px] uppercase tracking-[0.2em] font-sans font-semibold text-charcoal/60">
            02. Guests (Max {maxGuests})
          </Label>
          <Input 
            id="guests" 
            type="number" 
            min={1} 
            max={maxGuests} 
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
            className={inputClass}
          />
        </div>

        {/* 3. Phone */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="phone" className="text-[10px] uppercase tracking-[0.2em] font-sans font-semibold text-charcoal/60">
            03. Contact Number
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+977 98XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        {/* 4. Notes */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="notes" className="text-[10px] uppercase tracking-[0.2em] font-sans font-semibold text-charcoal/60">
            04. Special Requests
          </Label>
          <Textarea 
            id="notes" 
          placeholder="Tell us about arrival needs, food preferences, or anything that would make the stay easier..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputClass} min-h-[100px] resize-none`}
          />
        </div>

        {/* Summary */}
        {numberOfNights > 0 && (
          <div className="pt-8 border-t border-charcoal/10 space-y-4">
            <div className="flex justify-between text-charcoal/60 font-sans text-xs uppercase tracking-widest">
              <span>{formatNpr(pricePerNight)} x {numberOfNights} nights</span>
              <span>{formatNpr(totalPrice)}</span>
            </div>
            <div className="flex justify-between font-display text-xl text-charcoal pt-4 border-t border-charcoal/10">
              <span>Estimated Total</span>
              <span>{formatNpr(totalPrice)}</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50/50 text-red-800 text-xs uppercase tracking-wide font-sans text-center border border-red-100">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="pt-4">
          <LuxuryButton 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || numberOfNights <= 0}
          >
            {isSubmitting
              ? isAuthenticated
                ? "Sending Request..."
                : "Taking You There..."
              : isAuthenticated
              ? "Request Booking"
              : "Sign in to Request"}
          </LuxuryButton>
        </div>
      </form>
    </div>
  )
}

