"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DateRange } from "react-day-picker"
import { BookingCalendar } from "./booking-calendar"
import { LuxuryButton } from "@/components/ui/luxury-button"
import { Input } from "@/components/ui/input"
import { NumberInput } from "@/components/ui/number-input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { formatNpr } from "@/lib/currency"
import { toDateOnlyString } from "@/lib/booking-dates"
import { maxUnitsForRange, type AvailabilityPayload } from "@/lib/availability-client"
import { BedDouble, Users, Check, DoorOpen } from "lucide-react"

export type BookingRoomType = {
  id: string
  name: string
  classType: string
  description?: string | null
  pricePerNight: number
  maxGuests: number
  totalUnits: number
  bedType?: string | null
  sizeSqm?: number | null
  imageUrl?: string | null
  images?: string[] | null
}

interface Props {
  propertyId: string;
  pricePerNight: number;
  maxGuests: number;
  roomTypes?: BookingRoomType[];
  initialRoomTypeId?: string | null;
  initialCheckIn?: string | null;
  initialCheckOut?: string | null;
  initialGuests?: number;
  isAuthenticated?: boolean;
  initialPhone?: string | null;
  onRoomTypeChange?: (roomTypeId: string | null) => void;
}

type BookingCreateResponse = {
  bookingCode?: string
  error?: string
}

type BookingDraft = {
  checkIn?: string
  checkOut?: string
  roomTypeId?: string | null
  guests: number
  phone: string
  notes: string
}

function parseDraftDate(value?: string) {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function formatClassLabel(classType: string) {
  // Legacy all-caps enum values get title-cased; free-text types show as typed.
  if (classType && classType === classType.toUpperCase()) {
    return classType.charAt(0) + classType.slice(1).toLowerCase()
  }
  return classType
}

export function BookingRequestForm({
  propertyId,
  pricePerNight,
  maxGuests,
  roomTypes = [],
  initialRoomTypeId = null,
  initialCheckIn = null,
  initialCheckOut = null,
  initialGuests,
  isAuthenticated = false,
  initialPhone = "",
  onRoomTypeChange,
}: Props) {
  const router = useRouter()
  const [date, setDate] = useState<DateRange | undefined>()
  const [roomTypeId, setRoomTypeId] = useState<string | null>(
    initialRoomTypeId && roomTypes.some((rt) => rt.id === initialRoomTypeId)
      ? initialRoomTypeId
      : roomTypes[0]?.id ?? null
  )
  const [guests, setGuests] = useState(1)
  const [units, setUnits] = useState(1)
  const [availability, setAvailability] = useState<AvailabilityPayload | null>(null)
  const [phone, setPhone] = useState(initialPhone || "")
  const [notes, setNotes] = useState("")
  const [website, setWebsite] = useState("") // honeypot
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draftReady, setDraftReady] = useState(false)

  const draftKey = useMemo(() => `salt-route:booking-draft:${propertyId}`, [propertyId])

  const selectedRoomType = roomTypes.find((rt) => rt.id === roomTypeId)
  const effectivePrice = selectedRoomType ? selectedRoomType.pricePerNight : pricePerNight
  const perUnitMaxGuests = selectedRoomType ? selectedRoomType.maxGuests : maxGuests

  // Fetch availability once so we can cap "how many units" to what's free
  // for the chosen dates, and share it with the calendar.
  useEffect(() => {
    const today = new Date()
    const to = new Date()
    to.setFullYear(to.getFullYear() + 2)
    fetch(`/api/properties/${propertyId}/availability?from=${today.toISOString()}&to=${to.toISOString()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setAvailability(d as AvailabilityPayload))
      .catch(() => {})
  }, [propertyId])

  // Max units of the selected type bookable across the chosen range.
  const maxUnits = useMemo(() => {
    if (!availability) return selectedRoomType?.totalUnits ?? 1
    return Math.max(1, maxUnitsForRange(availability, roomTypeId, date?.from, date?.to))
  }, [availability, roomTypeId, date?.from, date?.to, selectedRoomType])

  // Clamp the chosen units whenever availability/room/dates change.
  useEffect(() => {
    setUnits((u) => Math.min(Math.max(1, u), maxUnits))
  }, [maxUnits])

  const effectiveMaxGuests = perUnitMaxGuests * units

  const numberOfNights = date?.from && date?.to
    ? Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalPrice = numberOfNights > 0 ? numberOfNights * effectivePrice * units : 0;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const raw = window.localStorage.getItem(draftKey)
        const draft = raw ? (JSON.parse(raw) as BookingDraft) : null

        // URL params (handed over from the property page) are the freshest
        // intent and win over a previously saved draft; the draft fills the rest.
        const from = parseDraftDate(initialCheckIn ?? undefined) ?? parseDraftDate(draft?.checkIn)
        const to = parseDraftDate(initialCheckOut ?? undefined) ?? parseDraftDate(draft?.checkOut)
        if (from) {
          setDate({ from, to: to && to > from ? to : undefined })
        }

        if (!initialRoomTypeId && draft?.roomTypeId && roomTypes.some((rt) => rt.id === draft.roomTypeId)) {
          setRoomTypeId(draft.roomTypeId)
        }

        const guestsValue = initialGuests ?? draft?.guests ?? 1
        setGuests(Math.min(Math.max(guestsValue, 1), maxGuests))

        if (draft) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey, initialPhone, maxGuests])

  useEffect(() => {
    if (!draftReady) return

    const draft: BookingDraft = {
      checkIn: date?.from?.toISOString(),
      checkOut: date?.to?.toISOString(),
      roomTypeId,
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
  }, [date?.from, date?.to, draftKey, draftReady, guests, notes, phone, roomTypeId])

  // Notify parent of room type selection changes
  useEffect(() => {
    onRoomTypeChange?.(roomTypeId)
  }, [roomTypeId, onRoomTypeChange])

  // Keep guest count within the selected room class's capacity.
  useEffect(() => {
    setGuests((g) => Math.min(g, effectiveMaxGuests))
  }, [effectiveMaxGuests])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date?.from || !date?.to) {
      setError("Please select check-in and check-out dates")
      return
    }
    if (roomTypes.length > 0 && !roomTypeId) {
      setError("Please choose a room class for your stay")
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
          roomTypeId,
          units,
          // Send plain calendar dates — timezone-proof.
          checkIn: toDateOnlyString(date.from),
          checkOut: toDateOnlyString(date.to),
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

  const hasRoomTypes = roomTypes.length > 0
  const stepOffset = hasRoomTypes ? 1 : 0
  const unitCapacity = selectedRoomType?.totalUnits ?? availability?.propertyUnits ?? 1
  const showUnits = unitCapacity > 1
  const u = showUnits ? 1 : 0
  const unitNoun = selectedRoomType ? selectedRoomType.name : "Unit"

  return (
    <div className="w-full max-w-lg mx-auto bg-[#FBF9F4] p-8 md:p-12 border border-charcoal/10">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-display text-charcoal mb-4">RESERVE YOUR STAY</h2>
        <p className="text-charcoal/60 font-sans text-sm tracking-widest uppercase">
          {formatNpr(effectivePrice)} <span className="lowercase text-[10px] tracking-normal">/ night</span>
        </p>
        {selectedRoomType && (
          <p className="mt-2 text-[9px] uppercase tracking-[0.3em] text-gold/80 font-sans font-bold">
            {selectedRoomType.name}
          </p>
        )}
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

        {/* Room class selection */}
        {hasRoomTypes && (
          <div className="flex flex-col gap-4">
            <Label className="text-[10px] uppercase tracking-[0.2em] font-sans font-semibold text-charcoal/60">
              01. Select Your Stay
            </Label>
            <div className="space-y-3">
              {roomTypes.map((rt) => {
                const selected = rt.id === roomTypeId
                return (
                  <button
                    key={rt.id}
                    type="button"
                    onClick={() => setRoomTypeId(rt.id)}
                    className={`w-full text-left border transition-all duration-300 bg-white group overflow-hidden ${
                      selected ? "border-charcoal shadow-sm" : "border-charcoal/10 hover:border-charcoal/40"
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <p className="text-[9px] uppercase tracking-[0.25em] text-gold/80 font-sans font-bold">
                            {formatClassLabel(rt.classType)}
                          </p>
                          <p className="font-display text-base text-charcoal uppercase tracking-wide truncate">{rt.name}</p>
                          <div className="flex items-center gap-4 pt-1 text-[10px] text-charcoal/50 font-sans flex-wrap">
                            <span className="flex items-center gap-1.5"><Users className="w-3 h-3" strokeWidth={1.5} /> {rt.maxGuests} guests</span>
                            <span className="flex items-center gap-1.5"><BedDouble className="w-3 h-3" strokeWidth={1.5} /> {rt.totalUnits} {rt.totalUnits === 1 ? "unit" : "units"}</span>
                            {rt.sizeSqm ? <span>{rt.sizeSqm} m²</span> : null}
                          </div>
                          {rt.bedType && (
                            <p className="text-[10px] text-charcoal/40 font-sans pt-0.5">{rt.bedType}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0 space-y-2">
                          <p className="font-display text-base text-charcoal whitespace-nowrap">{formatNpr(rt.pricePerNight)}</p>
                          <div className={`ml-auto h-5 w-5 border flex items-center justify-center transition-colors ${
                            selected ? "bg-charcoal border-charcoal" : "border-charcoal/20"
                          }`}>
                            {selected && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="flex flex-col gap-4">
          <Label className="text-[10px] uppercase tracking-[0.2em] font-sans font-semibold text-charcoal/60">
            {String(stepOffset + 1).padStart(2, "0")}. Dates
          </Label>
          <div className="border border-charcoal/10 bg-white p-4">
            <BookingCalendar propertyId={propertyId} date={date} setDate={setDate} roomTypeId={roomTypeId} availability={availability} />
          </div>
        </div>

        {!isAuthenticated && (
          <div className="p-4 border border-charcoal/10 bg-charcoal/5 text-xs text-charcoal/70 font-sans text-center tracking-wide">
            Select dates and details. You will be asked to sign in before confirming.
          </div>
        )}

        {/* Units / how many of this room type */}
        {showUnits && (
          <div className="flex flex-col gap-1">
            <Label htmlFor="units" className="text-[10px] uppercase tracking-[0.2em] font-sans font-semibold text-charcoal/60">
              {String(stepOffset + 2).padStart(2, "0")}. How many {unitNoun}{units === 1 ? "" : "s"}?
            </Label>
            <NumberInput
              id="units"
              min={1}
              max={maxUnits}
              value={units}
              onChange={setUnits}
              className={inputClass}
              buttonClassName="text-charcoal/40 hover:text-charcoal hover:bg-charcoal/5"
            />
            <p className="text-[10px] text-charcoal/40 font-sans pt-1 flex items-center gap-1.5">
              <DoorOpen className="w-3 h-3" />
              {date?.from && date?.to
                ? `${maxUnits} ${maxUnits === 1 ? "unit" : "units"} available for these dates`
                : `${unitCapacity} total — pick dates to see live availability`}
            </p>
          </div>
        )}

        {/* Guests */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="guests" className="text-[10px] uppercase tracking-[0.2em] font-sans font-semibold text-charcoal/60">
            {String(stepOffset + 2 + u).padStart(2, "0")}. Guests (Max {effectiveMaxGuests})
          </Label>
          <NumberInput
            id="guests"
            min={1}
            max={effectiveMaxGuests}
            value={guests}
            onChange={setGuests}
            className={inputClass}
            buttonClassName="text-charcoal/40 hover:text-charcoal hover:bg-charcoal/5"
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="phone" className="text-[10px] uppercase tracking-[0.2em] font-sans font-semibold text-charcoal/60">
            {String(stepOffset + 3 + u).padStart(2, "0")}. Contact Number
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

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="notes" className="text-[10px] uppercase tracking-[0.2em] font-sans font-semibold text-charcoal/60">
            {String(stepOffset + 4 + u).padStart(2, "0")}. Special Requests
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
            {selectedRoomType && (
              <div className="flex justify-between text-charcoal/60 font-sans text-xs uppercase tracking-widest">
                <span>Stay</span>
                <span>{units > 1 ? `${units} × ` : ""}{selectedRoomType.name}</span>
              </div>
            )}
            <div className="flex justify-between text-charcoal/60 font-sans text-xs uppercase tracking-widest">
              <span>{formatNpr(effectivePrice)} × {numberOfNights} {numberOfNights === 1 ? "night" : "nights"}{units > 1 ? ` × ${units} units` : ""}</span>
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
