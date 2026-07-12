"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NumberInput } from "@/components/ui/number-input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createManualBookingAction } from "./actions"
import { formatNpr } from "@/lib/currency"

type RoomTypeOption = { id: string; name: string; classType: string; pricePerNight: string; totalUnits: number }
type Property = { id: string; title: string; pricePerNight: string; roomTypes: RoomTypeOption[] }
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
  const [roomTypeId, setRoomTypeId] = useState("")
  const [unitCount, setUnitCount] = useState(1)
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guestCount, setGuestCount] = useState(1)
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const selectedProperty = properties.find((p) => p.id === propertyId)
  const roomTypes = selectedProperty?.roomTypes ?? []
  const selectedRoomType = roomTypes.find((rt) => rt.id === roomTypeId)
  const unitCapacity = selectedRoomType?.totalUnits ?? 1
  const nights =
    checkIn && checkOut
      ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
      : 0
  const nightlyPrice = selectedRoomType
    ? Number(selectedRoomType.pricePerNight)
    : selectedProperty
      ? Number(selectedProperty.pricePerNight)
      : 0
  const totalPrice = selectedProperty && nights > 0 ? nightlyPrice * nights * unitCount : null

  const today = new Date().toISOString().split("T")[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsPending(true)
    const res = await createManualBookingAction({
      guestId,
      propertyId,
      roomTypeId: roomTypeId || null,
      units: unitCount,
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
        <div className="bg-rose-50 border border-rose-200/60 rounded-xl p-3 text-[13px] text-[#B84040]">{error}</div>
      )}

      <div>
        <Label htmlFor="guest">Guest</Label>
        <select
          id="guest"
          value={guestId}
          onChange={(e) => setGuestId(e.target.value)}
          required
          className="mt-1 flex h-10 w-full rounded-lg border border-[#1B3A5C]/15 bg-[#FFFAF3] px-3 py-2 text-sm text-[#1B3A5C] focus:border-[#1B3A5C]/30 focus:outline-none"
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
          onChange={(e) => { setPropertyId(e.target.value); setRoomTypeId(""); setUnitCount(1) }}
          required
          className="mt-1 flex h-10 w-full rounded-lg border border-[#1B3A5C]/15 bg-[#FFFAF3] px-3 py-2 text-sm text-[#1B3A5C] focus:border-[#1B3A5C]/30 focus:outline-none"
        >
          <option value="">Select a property...</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} - {formatNpr(p.pricePerNight)}/night
            </option>
          ))}
        </select>
      </div>

      {roomTypes.length > 0 && (
        <div>
          <Label htmlFor="roomType">Room Class</Label>
          <select
            id="roomType"
            value={roomTypeId}
            onChange={(e) => setRoomTypeId(e.target.value)}
            required
            className="mt-1 flex h-10 w-full rounded-lg border border-[#1B3A5C]/15 bg-[#FFFAF3] px-3 py-2 text-sm text-[#1B3A5C] focus:border-[#1B3A5C]/30 focus:outline-none"
          >
            <option value="">Select a room class...</option>
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name} ({rt.classType}) - {formatNpr(rt.pricePerNight)}/night · {rt.totalUnits} unit{rt.totalUnits === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </div>
      )}

      {unitCapacity > 1 && (
        <div>
          <Label htmlFor="units">Number of {selectedRoomType?.name ?? "Units"} (max {unitCapacity})</Label>
          <NumberInput
            id="units"
            min={1}
            max={unitCapacity}
            value={unitCount}
            onChange={setUnitCount}
            className="mt-1"
          />
        </div>
      )}

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
        <NumberInput
          id="guests"
          min={1}
          max={50}
          value={guestCount}
          onChange={setGuestCount}
          required
          className="mt-1"
        />
      </div>

      {totalPrice && (
        <div className="bg-[#1B3A5C]/5 border border-[#1B3A5C]/8 rounded-xl p-4 flex justify-between items-center">
          <span className="text-[#1B3A5C]/60 text-[12px]">{nights} night{nights !== 1 ? "s" : ""} x {formatNpr(nightlyPrice)}{selectedRoomType ? ` (${selectedRoomType.name})` : ""}</span>
          <span className="text-xl font-semibold text-[#1B3A5C] tabular-nums">{formatNpr(totalPrice)}</span>
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
        disabled={isPending || !guestId || !propertyId || !checkIn || !checkOut || (roomTypes.length > 0 && !roomTypeId)}
        className="w-full rounded-lg bg-[#1B3A5C] text-[#FFFAF3] text-[12px] font-medium hover:bg-[#2A4F7A]"
      >
        {isPending ? "Creating booking..." : "Create Confirmed Booking"}
      </Button>

      <p className="text-[11px] text-[#1B3A5C]/40 text-center">
        This booking will be created with status <strong>CONFIRMED</strong> and a confirmation email sent to the guest.
      </p>
    </form>
  )
}
