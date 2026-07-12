"use client"

import { useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { format, subDays, startOfYear } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { CalendarDays, ChevronDown } from "lucide-react"

interface DateRangePickerProps {
  from?: string
  to?: string
}

const PRESETS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "YTD", days: 0 },
]

export function DateRangePicker({ from, to }: DateRangePickerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)

  const fromDate = from ? new Date(from) : subDays(new Date(), 30)
  const toDate = to ? new Date(to) : new Date()

  const apply = (f: Date, t: Date) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("from", format(f, "yyyy-MM-dd"))
    params.set("to", format(t, "yyyy-MM-dd"))
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
    setOpen(false)
  }

  const handlePreset = (days: number) => {
    const t = new Date()
    const f = days === 0 ? startOfYear(t) : subDays(t, days)
    apply(f, t)
  }

  return (
    <div className="relative inline-block">
      <Button
        variant="outline"
        onClick={() => setOpen((v) => !v)}
        className="gap-2 h-9 rounded-lg border-[#1B3A5C]/15 bg-[#FFFAF3] text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 hover:bg-[#FFFAF3]"
      >
        <CalendarDays className="h-4 w-4 text-[#1B3A5C]/40" />
        <span className="text-[12px] font-medium tabular-nums">
          {format(fromDate, "MMM d, yyyy")} – {format(toDate, "MMM d, yyyy")}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-[#1B3A5C]/40" />
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 rounded-xl border border-[#1B3A5C]/10 bg-[#FFFAF3] shadow-lg p-4 min-w-[280px]">
            <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.2em] mb-3">Quick ranges</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handlePreset(p.days)}
                  className="rounded-full border border-[#1B3A5C]/15 px-3 py-1 text-xs font-medium text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#C9A96E]/60 hover:bg-[#C9A96E]/8 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="text-xs text-[#1B3A5C]/40 text-center mt-2 tabular-nums">
              {format(fromDate, "MMM d")} → {format(toDate, "MMM d, yyyy")}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
