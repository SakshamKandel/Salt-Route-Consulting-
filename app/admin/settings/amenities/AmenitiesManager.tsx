"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { addAmenityToAllPropertiesAction, removeAmenityFromAllPropertiesAction } from "./actions"
import { Plus, Trash2 } from "lucide-react"

type Amenity = { name: string; count: number }

export function AmenitiesManager({ amenities: initial }: { amenities: Amenity[] }) {
  const [amenities, setAmenities] = useState(initial)
  const [newName, setNewName] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [pending, setPending] = useState<string | null>(null)

  const handleAdd = async () => {
    if (!newName.trim()) return
    setPending("add")
    setMessage(null)
    const res = await addAmenityToAllPropertiesAction(newName.trim())
    if (res.success) {
      setAmenities((prev) => {
        const existing = prev.find((a) => a.name === newName.trim())
        if (existing) return prev
        return [...prev, { name: newName.trim(), count: 0 }].sort((a, b) => b.count - a.count)
      })
      setNewName("")
      setMessage({ type: "success", text: res.success })
    } else {
      setMessage({ type: "error", text: res.error! })
    }
    setPending(null)
  }

  const handleRemove = async (name: string) => {
    if (!confirm(`Remove "${name}" from ALL properties?`)) return
    setPending(name)
    setMessage(null)
    const res = await removeAmenityFromAllPropertiesAction(name)
    if (res.success) {
      setAmenities((prev) => prev.filter((a) => a.name !== name))
      setMessage({ type: "success", text: res.success })
    } else {
      setMessage({ type: "error", text: res.error! })
    }
    setPending(null)
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`rounded-lg p-3 text-[12px] ${message.type === "success" ? "bg-emerald-50 border border-emerald-200/60 text-emerald-700" : "bg-rose-50 border border-rose-200/60 text-[#B84040]"}`}>
          {message.text}
        </div>
      )}

      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl p-5 space-y-4">
        <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#1B3A5C]/60">Add New Amenity</h3>
        <div className="flex gap-3">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Swimming Pool"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button
            onClick={handleAdd}
            disabled={!newName.trim() || pending === "add"}
            className="bg-[#1B3A5C] text-[#FFFAF3] hover:bg-[#2A4F7A] rounded-lg text-[12px] font-medium shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            {pending === "add" ? "Adding..." : "Add"}
          </Button>
        </div>
        <p className="text-[11px] text-[#1B3A5C]/45">Adding an amenity here adds it to all existing properties.</p>
      </div>

      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1B3A5C]/8">
          <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#1B3A5C]/60"><span className="tabular-nums">{amenities.length}</span> Amenities in Use</h3>
        </div>
        {amenities.length === 0 ? (
          <p className="p-8 text-center text-[13px] text-[#1B3A5C]/40">No amenities found. Add one above or update a property.</p>
        ) : (
          <div className="divide-y divide-[#1B3A5C]/5">
            {amenities.map(({ name, count }) => (
              <div key={name} className="flex items-center justify-between px-5 py-3 hover:bg-[#FBF9F4] transition-colors">
                <div>
                  <p className="text-[13px] font-medium text-[#1B3A5C]">{name}</p>
                  <p className="text-[11px] text-[#1B3A5C]/40 tabular-nums">{count} {count === 1 ? "property" : "properties"}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(name)}
                  disabled={pending === name}
                  className="text-[#B84040]/70 hover:text-[#B84040] hover:bg-rose-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
