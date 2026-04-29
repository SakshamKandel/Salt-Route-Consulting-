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
    "w-full bg-transparent text-[#1B3A5C]/70 text-[12.5px] px-5 py-4 outline-none transition-all duration-500 placeholder:text-[#1B3A5C]/30 font-light"
  const inputStyle = { border: "1px solid rgba(201,169,110,0.15)" }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status && (
        <div
          className="px-6 py-4 text-[11px] font-light leading-[1.8]"
          style={{
            border: `1px solid ${status.type === "success" ? "rgba(52,211,153,0.25)" : "rgba(239,100,100,0.25)"}`,
            background: status.type === "success" ? "rgba(52,211,153,0.06)" : "rgba(239,100,100,0.06)",
            color: status.type === "success" ? "rgba(52,211,153,0.9)" : "rgba(239,100,100,0.9)",
          }}
        >
          {status.text}
        </div>
      )}

      <div className="space-y-2.5">
        <label className="text-[9px] uppercase tracking-[0.4em] text-[#1B3A5C]/40 font-medium block">
          Full Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          className={inputClass}
          style={inputStyle}
          placeholder="Your name"
        />
      </div>

      <div className="space-y-2.5">
        <label className="text-[9px] uppercase tracking-[0.4em] text-[#1B3A5C]/40 font-medium block">
          Phone Number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
          style={inputStyle}
          placeholder="+977 98..."
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={saving}
          className="px-7 py-3.5 text-[9px] uppercase tracking-[0.35em] font-medium text-[#0C1F33] bg-gold hover:bg-gold/90 transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  )
}
