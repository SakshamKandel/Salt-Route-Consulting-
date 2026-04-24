"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DateRange } from "react-day-picker"
import { BookingCalendar } from "./booking-calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

interface Props {
  propertyId: string;
  pricePerNight: number;
  maxGuests: number;
}

type BookingCreateResponse = {
  bookingCode?: string
  error?: string
}

export function BookingRequestForm({ propertyId, pricePerNight, maxGuests }: Props) {
  const router = useRouter()
  const [date, setDate] = useState<DateRange | undefined>()
  const [guests, setGuests] = useState(1)
  const [notes, setNotes] = useState("")
  const [website, setWebsite] = useState("") // honeypot
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const numberOfNights = date?.from && date?.to 
    ? Math.round((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalPrice = numberOfNights > 0 ? numberOfNights * pricePerNight : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date?.from || !date?.to) {
      setError("Please select check-in and check-out dates")
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          checkIn: date.from.toISOString(),
          checkOut: date.to.toISOString(),
          guests,
          notes,
          website,
        })
      })
      
      const data = (await res.json()) as BookingCreateResponse
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to create booking")
      }
      
      router.push(`/booking-request/success?code=${data.bookingCode}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create booking")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg border-navy/10">
      <CardHeader className="bg-navy text-cream">
        <CardTitle className="text-2xl font-display">Book Your Stay</CardTitle>
        <p className="text-cream/80 text-lg">
          ${pricePerNight} <span className="text-sm font-normal">/ night</span>
        </p>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          {/* Honeypot: hidden field. Real users leave this empty. */}
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

          <div className="flex flex-col gap-2">
            <Label className="text-navy font-semibold">1. Choose Dates</Label>
            <BookingCalendar propertyId={propertyId} date={date} setDate={setDate} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="guests" className="text-navy font-semibold">2. Number of Guests</Label>
            <Input 
              id="guests" 
              type="number" 
              min={1} 
              max={maxGuests} 
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
              className="border-navy/20 focus:border-gold"
            />
            <p className="text-xs text-gray-400">Maximum allowed: {maxGuests} guests</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes" className="text-navy font-semibold">3. Special Requests (Optional)</Label>
            <Textarea 
              id="notes" 
              placeholder="Tell us about any specific requirements..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-navy/20 focus:border-gold min-h-[100px]"
            />
          </div>

          {numberOfNights > 0 && (
            <div className="pt-4 border-t border-navy/10 space-y-3">
              <div className="flex justify-between text-navy/70">
                <span>${pricePerNight} x {numberOfNights} nights</span>
                <span>${totalPrice}</span>
              </div>
              <div className="flex justify-between font-display text-xl text-navy pt-2 border-t border-navy/20">
                <span>Estimated Total</span>
                <span className="text-gold">${totalPrice}</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="pb-6">
          <Button 
            type="submit" 
            className="w-full bg-gold hover:bg-gold/90 text-navy font-bold h-12 text-lg" 
            disabled={isSubmitting || numberOfNights <= 0}
          >
            {isSubmitting ? "Processing Request..." : "Request Booking"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
