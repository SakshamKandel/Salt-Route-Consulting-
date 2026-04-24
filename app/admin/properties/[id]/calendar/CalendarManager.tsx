"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addBlockedDatesAction, removeBlockedDateAction } from "./actions"
import { Trash2, Plus, CalendarX } from "lucide-react"

type BlockedDate = { id: string; date: Date }

export function CalendarManager({
  propertyId,
  initial,
}: {
  propertyId: string
  initial: BlockedDate[]
}) {
  const [blocked, setBlocked] = useState(initial)
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [pending, setPending] = useState<string | null>(null)

  const today = new Date().toISOString().split("T")[0]

  const handleAdd = async () => {
    if (!from || !to) return
    setPending("add")
    setMessage(null)
    const res = await addBlockedDatesAction(propertyId, from, to)
    if (res.success) {
      setMessage({ type: "success", text: res.success })
      setFrom("")
      setTo("")
    } else {
      setMessage({ type: "error", text: res.error! })
    }
    setPending(null)
  }

  const handleRemove = async (id: string) => {
    setPending(id)
    const res = await removeBlockedDateAction(id, propertyId)
    if (!res.error) {
      setBlocked((prev) => prev.filter((d) => d.id !== id))
    } else {
      setMessage({ type: "error", text: res.error })
    }
    setPending(null)
  }

  const sorted = [...blocked].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="space-y-6">
      {message && (
        <div className={`rounded-lg p-3 text-sm ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white border rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-navy">Block a Date Range</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="from">From</Label>
            <Input id="from" type="date" min={today} value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="to">To</Label>
            <Input id="to" type="date" min={from || today} value={to} onChange={(e) => setTo(e.target.value)} className="mt-1" />
          </div>
        </div>
        <Button
          onClick={handleAdd}
          disabled={!from || !to || pending === "add"}
          className="bg-navy text-cream w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          {pending === "add" ? "Blocking..." : "Block Dates"}
        </Button>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2">
          <CalendarX size={18} className="text-navy" />
          <h3 className="font-semibold text-navy">{sorted.length} Blocked Dates</h3>
        </div>
        {sorted.length === 0 ? (
          <p className="p-8 text-center text-slate-400">No dates blocked. Add a range above.</p>
        ) : (
          <div className="divide-y max-h-96 overflow-y-auto">
            {sorted.map(({ id, date }) => (
              <div key={id} className="flex items-center justify-between px-5 py-3">
                <span className="text-navy text-sm font-medium">
                  {new Date(date).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(id)}
                  disabled={pending === id}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
