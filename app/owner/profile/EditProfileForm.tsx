"use client"

import { useState } from "react"
import { updateOwnerProfileAction } from "./actions"

interface Props {
  initialName: string
  initialPhone: string
}

export function EditProfileForm({ initialName, initialPhone }: Props) {
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    const res = await updateOwnerProfileAction({ name, phone: phone || null })
    setStatus(res.success ? { type: "success", text: res.success } : { type: "error", text: res.error ?? "Error" })
    setSaving(false)
  }

  const inputClass =
    "w-full bg-[#FBF9F4] text-[#1B3A5C] text-[13px] px-4 py-2.5 border border-[#1B3A5C]/10 rounded-lg outline-none transition-colors placeholder:text-[#1B3A5C]/30 focus:border-[#C9A96E] focus:ring-3 focus:ring-[#C9A96E]/20"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {status && (
        <div
          className={`px-4 py-3 text-[12px] rounded-lg border ${
            status.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
              : "bg-rose-50 text-rose-600 border-rose-200/60"
          }`}
        >
          {status.text}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-[0.15em] text-[#1B3A5C]/40 font-medium block">
          Full Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          className={inputClass}
          placeholder="Your name"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-[0.15em] text-[#1B3A5C]/40 font-medium block">
          Phone Number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
          placeholder="+977 98..."
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center px-4 py-2 bg-[#1B3A5C] text-[#FFFAF3] rounded-lg text-[12px] font-medium hover:bg-[#2A4F7A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  )
}
