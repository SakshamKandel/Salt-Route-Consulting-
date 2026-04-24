"use client"
import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"

interface BookingCalendarProps {
  propertyId: string;
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

type AvailabilityResponse = {
  blockedDates: Array<{ date: string | Date }>
  bookings: Array<{ checkIn: string | Date; checkOut: string | Date }>
}

export function BookingCalendar({ propertyId, date, setDate }: BookingCalendarProps) {
  const [disabledDates, setDisabledDates] = React.useState<Date[]>([])
  
  React.useEffect(() => {
    async function fetchAvailability() {
      const today = new Date()
      const to = new Date()
      to.setFullYear(to.getFullYear() + 1)
      
      try {
        const res = await fetch(`/api/properties/${propertyId}/availability?from=${today.toISOString()}&to=${to.toISOString()}`)
        if (res.ok) {
          const data = (await res.json()) as AvailabilityResponse
          const datesToDisable: Date[] = []
          
          data.blockedDates.forEach((bd) => {
            datesToDisable.push(new Date(bd.date))
          })
          
          data.bookings.forEach((b) => {
            const curr = new Date(b.checkIn)
            const end = new Date(b.checkOut)
            while (curr <= end) {
              datesToDisable.push(new Date(curr))
              curr.setDate(curr.getDate() + 1)
            }
          })
          
          setDisabledDates(datesToDisable)
        }
      } catch (err) {
        console.error("Failed to fetch availability", err)
      }
    }
    fetchAvailability()
  }, [propertyId])

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  return (
    <div className="flex justify-center border rounded-md p-2 shadow-sm bg-white">
      <Calendar
        mode="range"
        defaultMonth={date?.from || new Date()}
        selected={date}
        onSelect={setDate}
        numberOfMonths={2}
        disabled={[
          ...disabledDates,
          isPastDate
        ]}
      />
    </div>
  )
}
