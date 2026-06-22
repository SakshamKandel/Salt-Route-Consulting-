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
        <div className={`rounded-lg p-3 text-sm ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white border rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-navy">Add New Feature</h3>
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
              className="text-sm bg-white border rounded-lg px-3 py-2 outline-none focus:border-[#C9A96E] min-w-[140px]"
            >
              {iconKeys.map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
            <div className="w-10 h-10 border rounded-lg flex items-center justify-center bg-slate-50 shrink-0">
              <PreviewIcon className="w-5 h-5 text-charcoal/70" strokeWidth={1} />
            </div>
            <Button
              onClick={handleAdd}
              disabled={!newName.trim() || pending === "add"}
              className="bg-navy text-cream shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" />
              {pending === "add" ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>
        <p className="text-xs text-slate-500">These features appear in the &ldquo;What to Expect&rdquo; icon strip on every property page.</p>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold text-navy">{features.length} Features</h3>
        </div>
        {features.length === 0 ? (
          <p className="p-8 text-center text-slate-400">No features found. Add one above.</p>
        ) : (
          <div className="divide-y">
            {features.map((feature) => {
              const Icon = ICON_REGISTRY[feature.iconKey] || ICON_REGISTRY.check
              return (
                <div key={feature.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
                    <div className="w-8 h-8 border rounded-lg flex items-center justify-center bg-slate-50 shrink-0">
                      <Icon className="w-4 h-4 text-charcoal/70" strokeWidth={1} />
                    </div>
                    <div>
                      <p className="font-medium text-navy">{feature.name}</p>
                      <p className="text-xs text-slate-400">icon: {feature.iconKey}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(feature.id, feature.name)}
                    disabled={pending === feature.id}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
