"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createManualBookingAction } from "./actions"
import { formatNpr } from "@/lib/currency"

type Property = { id: string; title: string; pricePerNight: string }
type Guest = { id: string; name: string | null; email: string }

export function ManualBookingForm({
  properties,
  guests,
}: {
  properties: Property[]
  guests: Guest[]
}) {
  const [guestId, setGuestId] = useState("")
  const [propertyId, setPropertyId] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guestCount, setGuestCount] = useState(1)
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const selectedProperty = properties.find((p) => p.id === propertyId)
  const nights =
    checkIn && checkOut
      ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
      : 0
  const nightlyPrice = selectedProperty ? Number(selectedProperty.pricePerNight) : 0
  const totalPrice = selectedProperty && nights > 0 ? nightlyPrice * nights : null

  const today = new Date().toISOString().split("T")[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsPending(true)
    const res = await createManualBookingAction({
      guestId,
      propertyId,
      checkIn,
      checkOut,
      guests: guestCount,
      notes: notes || undefined,
    })
    if (res?.error) {
      setError(res.error)
      setIsPending(false)
    }
    // on success, server action redirects
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">{error}</div>
      )}

      <div>
        <Label htmlFor="guest">Guest</Label>
        <select
          id="guest"
          value={guestId}
          onChange={(e) => setGuestId(e.target.value)}
          required
          className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Select a guest...</option>
          {guests.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name ?? "Unnamed"} — {g.email}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="property">Property</Label>
        <select
          id="property"
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          required
          className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Select a property...</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} - {formatNpr(p.pricePerNight)}/night
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="checkin">Check-in</Label>
          <Input
            id="checkin"
            type="date"
            min={today}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="checkout">Check-out</Label>
          <Input
            id="checkout"
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="guests">Number of Guests</Label>
        <Input
          id="guests"
          type="number"
          min={1}
          max={50}
          value={guestCount}
          onChange={(e) => setGuestCount(Number(e.target.value))}
          required
          className="mt-1"
        />
      </div>

      {totalPrice && (
        <div className="bg-navy/5 rounded-lg p-4 flex justify-between items-center">
          <span className="text-slate-600 text-sm">{nights} night{nights !== 1 ? "s" : ""} x {formatNpr(selectedProperty!.pricePerNight)}</span>
          <span className="text-xl font-bold text-navy">{formatNpr(totalPrice)}</span>
        </div>
      )}

      <div>
        <Label htmlFor="notes">Internal Notes (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special arrangements or notes..."
          className="mt-1"
          rows={3}
        />
      </div>

      <Button
        type="submit"
        disabled={isPending || !guestId || !propertyId || !checkIn || !checkOut}
        className="w-full bg-navy text-cream hover:bg-navy/90"
      >
        {isPending ? "Creating booking..." : "Create Confirmed Booking"}
      </Button>

      <p className="text-xs text-slate-500 text-center">
        This booking will be created with status <strong>CONFIRMED</strong> and a confirmation email sent to the guest.
      </p>
    </form>
  )
}
