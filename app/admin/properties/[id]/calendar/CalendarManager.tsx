"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addBlockedDatesAction, removeBlockedDateAction } from "./actions"
import { Trash2, Plus, CalendarX } from "lucide-react"

const WHOLE_PROPERTY = "__whole__"

type BlockedDate = { id: string; date: Date; roomTypeId: string | null }
type RoomTypeOption = { id: string; name: string }

export function CalendarManager({
  propertyId,
  initial,
  roomTypes = [],
}: {
  propertyId: string
  initial: BlockedDate[]
  roomTypes?: RoomTypeOption[]
}) {
  const router = useRouter()
  const [blocked, setBlocked] = useState(initial)
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [scope, setScope] = useState<string>(WHOLE_PROPERTY)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [pending, setPending] = useState<string | null>(null)

  const today = new Date().toISOString().split("T")[0]
  const roomTypeName = (id: string | null) =>
    id ? roomTypes.find((rt) => rt.id === id)?.name ?? "Room class" : "Entire property"

  const scopeItems = [
    { value: WHOLE_PROPERTY, label: "Entire property" },
    ...roomTypes.map((rt) => ({ value: rt.id, label: rt.name })),
  ]

  const handleAdd = async () => {
    if (!from || !to) return
    setPending("add")
    setMessage(null)
    const roomTypeId = scope === WHOLE_PROPERTY ? null : scope
    const res = await addBlockedDatesAction(propertyId, from, to, roomTypeId)
    if (res.success) {
      setMessage({ type: "success", text: res.success })
      setFrom("")
      setTo("")
      router.refresh()
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
        <div className={`rounded-xl p-3 text-[13px] ${message.type === "success" ? "bg-emerald-50 border border-emerald-200/60 text-emerald-700" : "bg-rose-50 border border-rose-200/60 text-[#B84040]"}`}>
          {message.text}
        </div>
      )}

      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl p-5 space-y-4">
        <div>
          <p className="text-[10px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.2em] mb-1">Availability</p>
          <h3 className="text-[15px] font-semibold text-[#1B3A5C]">Block a Date Range</h3>
        </div>
        <div className={`grid grid-cols-1 gap-4 ${roomTypes.length > 0 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          <div>
            <Label htmlFor="from">From</Label>
            <Input id="from" type="date" min={today} value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="to">To</Label>
            <Input id="to" type="date" min={from || today} value={to} onChange={(e) => setTo(e.target.value)} className="mt-1" />
          </div>
          {roomTypes.length > 0 && (
            <div>
              <Label>Applies To</Label>
              <Select items={scopeItems} value={scope} onValueChange={(v) => setScope(v ?? WHOLE_PROPERTY)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={WHOLE_PROPERTY}>Entire property</SelectItem>
                  {roomTypes.map((rt) => (
                    <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {roomTypes.length > 0 && (
          <p className="text-xs text-[#1B3A5C]/40">
            &ldquo;Entire property&rdquo; blocks every room class. Selecting a class blocks only that class&apos;s units.
          </p>
        )}
        <Button
          onClick={handleAdd}
          disabled={!from || !to || pending === "add"}
          className="w-full rounded-lg bg-[#1B3A5C] text-[#FFFAF3] text-[12px] font-medium hover:bg-[#2A4F7A]"
        >
          <Plus className="w-3.5 h-3.5 mr-2" />
          {pending === "add" ? "Blocking..." : "Block Dates"}
        </Button>
      </div>

      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1B3A5C]/8 flex items-center gap-2">
          <CalendarX className="h-4 w-4 text-[#C9A96E]" />
          <h3 className="text-[15px] font-semibold text-[#1B3A5C]">{sorted.length} Blocked Dates</h3>
        </div>
        {sorted.length === 0 ? (
          <div className="p-10 text-center">
            <CalendarX className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-3" />
            <p className="text-[13px] text-[#1B3A5C]/40">No dates blocked.</p>
            <p className="text-[11px] text-[#1B3A5C]/30 mt-1">Add a range above.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1B3A5C]/5 max-h-96 overflow-y-auto">
            {sorted.map(({ id, date, roomTypeId }) => (
              <div key={id} className="flex items-center justify-between px-5 py-3 gap-3 hover:bg-[#FBF9F4] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[#1B3A5C] text-[13px] font-medium whitespace-nowrap tabular-nums">
                    {new Date(date).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                  </span>
                  <span className={`inline-flex rounded-full text-[9px] font-semibold border uppercase tracking-[0.15em] px-2.5 py-1 truncate ${
                    roomTypeId
                      ? "bg-[#C9A96E]/10 text-[#1B3A5C]/70 border-[#C9A96E]/30"
                      : "bg-[#1B3A5C]/5 text-[#1B3A5C]/60 border-[#1B3A5C]/10"
                  }`}>
                    {roomTypeName(roomTypeId)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(id)}
                  disabled={pending === id}
                  className="text-[#B84040] hover:text-[#B84040] hover:bg-rose-50 h-8 w-8"
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
