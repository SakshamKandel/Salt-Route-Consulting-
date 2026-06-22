"use client"
import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { computeDisabledDays, type AvailabilityPayload } from "@/lib/availability-client"

interface BookingCalendarProps {
  propertyId: string;
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  /** Selected room class. Null/undefined = entire property. */
  roomTypeId?: string | null;
  /** Optional pre-fetched availability (shared with the parent form). */
  availability?: AvailabilityPayload | null;
}

export function BookingCalendar({ propertyId, date, setDate, roomTypeId, availability: availabilityProp }: BookingCalendarProps) {
  const [availabilityState, setAvailability] = React.useState<AvailabilityPayload | null>(null)
  const availability = availabilityProp ?? availabilityState
  const [month, setMonth] = React.useState<Date>(date?.from || new Date())

  // Follow the selection (e.g. dates prefilled from the property page).
  React.useEffect(() => {
    if (date?.from) setMonth(date.from)
  }, [date?.from])

  React.useEffect(() => {
    // Only self-fetch when the parent didn't supply availability.
    if (availabilityProp) return
    async function fetchAvailability() {
      const today = new Date()
      const to = new Date()
      to.setFullYear(to.getFullYear() + 2)

      try {
        const res = await fetch(`/api/properties/${propertyId}/availability?from=${today.toISOString()}&to=${to.toISOString()}`)
        if (!res.ok) return
        setAvailability((await res.json()) as AvailabilityPayload)
      } catch (err) {
        console.error("Failed to fetch availability", err)
      }
    }
    fetchAvailability()
  }, [propertyId, availabilityProp])

  const disabledDates = React.useMemo(
    () => (availability ? computeDisabledDays(availability, roomTypeId) : []),
    [availability, roomTypeId]
  )

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const today = new Date()
  const endLimit = new Date()
  endLimit.setFullYear(today.getFullYear() + 2)

  return (
    <div className="space-y-6">
      <div className={cn(
        "bg-white p-2 sm:p-4 border border-charcoal/10 shadow-sm relative overflow-x-auto",
        "w-full flex justify-center"
      )}>
        <Calendar
          mode="range"
          month={month}
          onMonthChange={setMonth}
          selected={date}
          onSelect={setDate}
          numberOfMonths={1}
          startMonth={today}
          endMonth={endLimit}
          className="w-full"
          classNames={{
            month_caption: "flex justify-center py-4 mb-4 border-b border-charcoal/5 relative items-center",
            caption_label: "text-[11px] sm:text-[12px] font-display font-bold uppercase tracking-[0.16em] sm:tracking-[0.3em] text-charcoal",
            nav: "flex items-center justify-between absolute inset-x-0 top-4 px-2 z-10",
            button_previous: "h-8 w-8 bg-charcoal/5 rounded-full p-0 flex items-center justify-center hover:bg-charcoal/10 transition-all",
            button_next: "h-8 w-8 bg-charcoal/5 rounded-full p-0 flex items-center justify-center hover:bg-charcoal/10 transition-all",
            weekday: "text-charcoal/40 font-sans font-medium text-[10px] uppercase tracking-[0.1em] text-center w-full",
            day: "h-9 sm:h-10 w-full p-0 font-sans text-[12px] flex items-center justify-center transition-all duration-300 relative text-charcoal/80 hover:bg-charcoal/5",
            range_start: "bg-charcoal text-white rounded-none !opacity-100",
            range_end: "bg-charcoal text-white rounded-none !opacity-100",
            range_middle: "bg-charcoal/5 text-charcoal rounded-none",
            selected: "bg-charcoal text-white hover:bg-charcoal hover:text-white opacity-100",
            today: "text-charcoal font-bold underline decoration-charcoal/30 underline-offset-4",
            outside: "text-charcoal/20",
            disabled: "text-charcoal/10 cursor-not-allowed line-through",
          }}
          disabled={[
            ...disabledDates,
            isPastDate
          ]}
        />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[9px] uppercase tracking-[0.12em] font-sans font-bold text-charcoal/30 sm:tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full border border-charcoal/20" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-charcoal/10" />
            <span>Reserved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 bg-charcoal" />
            <span className="text-charcoal">Selected</span>
          </div>
        </div>
      </div>
    </div>
  )
}
