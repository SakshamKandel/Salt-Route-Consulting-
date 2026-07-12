"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  addPropertyFeatureAction,
  removePropertyFeatureAction,
} from "./actions"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { ICON_REGISTRY } from "@/lib/feature-icons"

type FeatureItem = {
  id: string
  name: string
  iconKey: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export function FeaturesManager({
  features: initial,
}: {
  features: FeatureItem[]
}) {
  const [features, setFeatures] = useState(initial)
  const [newName, setNewName] = useState("")
  const [newIcon, setNewIcon] = useState("check")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [pending, setPending] = useState<string | null>(null)

  const iconKeys = Object.keys(ICON_REGISTRY)

  const handleAdd = async () => {
    if (!newName.trim()) return
    setPending("add")
    setMessage(null)
    const res = await addPropertyFeatureAction(newName.trim(), newIcon)
    if (res.success) {
      // Refresh from server
      window.location.reload()
    } else {
      setMessage({ type: "error", text: res.error! })
    }
    setPending(null)
  }

  const handleRemove = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}"?`)) return
    setPending(id)
    setMessage(null)
    const res = await removePropertyFeatureAction(id)
    if (res.success) {
      setFeatures((prev) => prev.filter((f) => f.id !== id))
      setMessage({ type: "success", text: res.success })
    } else {
      setMessage({ type: "error", text: res.error! })
    }
    setPending(null)
  }

  const PreviewIcon = ICON_REGISTRY[newIcon] || ICON_REGISTRY.check

  return (
    <div className="space-y-6">
      {message && (
        <div className={`rounded-lg p-3 text-[12px] ${message.type === "success" ? "bg-emerald-50 border border-emerald-200/60 text-emerald-700" : "bg-rose-50 border border-rose-200/60 text-[#B84040]"}`}>
          {message.text}
        </div>
      )}

      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl p-5 space-y-4">
        <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#1B3A5C]/60">Add New Feature</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Luxurious Linens and Towels"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="flex-1"
          />
          <div className="flex gap-2">
            <select
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              className="text-sm text-[#1B3A5C] bg-white/60 border border-[#1B3A5C]/10 rounded-lg px-3 py-2 outline-none focus:border-[#1B3A5C]/30 min-w-[140px]"
            >
              {iconKeys.map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
            <div className="w-10 h-10 border border-[#1B3A5C]/10 rounded-lg flex items-center justify-center bg-[#FBF9F4] shrink-0">
              <PreviewIcon className="w-5 h-5 text-[#1B3A5C]/70" strokeWidth={1} />
            </div>
            <Button
              onClick={handleAdd}
              disabled={!newName.trim() || pending === "add"}
              className="bg-[#1B3A5C] text-[#FFFAF3] hover:bg-[#2A4F7A] rounded-lg text-[12px] font-medium shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" />
              {pending === "add" ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>
        <p className="text-[11px] text-[#1B3A5C]/45">These features appear in the &ldquo;What to Expect&rdquo; icon strip on every property page.</p>
      </div>

      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1B3A5C]/8">
          <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#1B3A5C]/60"><span className="tabular-nums">{features.length}</span> Features</h3>
        </div>
        {features.length === 0 ? (
          <p className="p-8 text-center text-[13px] text-[#1B3A5C]/40">No features found. Add one above.</p>
        ) : (
          <div className="divide-y divide-[#1B3A5C]/5">
            {features.map((feature) => {
              const Icon = ICON_REGISTRY[feature.iconKey] || ICON_REGISTRY.check
              return (
                <div key={feature.id} className="flex items-center justify-between px-5 py-3 hover:bg-[#FBF9F4] transition-colors">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-[#1B3A5C]/20 shrink-0" />
                    <div className="w-8 h-8 border border-[#1B3A5C]/10 rounded-lg flex items-center justify-center bg-[#FBF9F4] shrink-0">
                      <Icon className="w-4 h-4 text-[#1B3A5C]/70" strokeWidth={1} />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#1B3A5C]">{feature.name}</p>
                      <p className="text-[11px] text-[#1B3A5C]/40 font-mono">icon: {feature.iconKey}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(feature.id, feature.name)}
                    disabled={pending === feature.id}
                    className="text-[#B84040]/70 hover:text-[#B84040] hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
