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
        className="gap-2 text-slate-600 border-slate-200"
      >
        <CalendarDays className="h-4 w-4" />
        <span className="text-sm">
          {format(fromDate, "MMM d, yyyy")} – {format(toDate, "MMM d, yyyy")}
        </span>
        <ChevronDown className="h-3.5 w-3.5" />
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 rounded-xl border border-slate-200 bg-white shadow-lg p-4 min-w-[280px]">
            <div className="flex flex-wrap gap-2 mb-4">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handlePreset(p.days)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="text-xs text-slate-400 text-center mt-2">
              {format(fromDate, "MMM d")} → {format(toDate, "MMM d, yyyy")}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
