"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff, Check, AlertCircle } from "lucide-react"
import { changePasswordAction } from "./actions"

function PasswordField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-2.5">
      <label htmlFor={id} className="text-[13px] uppercase tracking-[0.14em] text-[#1B3A5C]/70 font-medium block">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-lg border border-[#1B3A5C]/10 bg-[#FBF9F4] px-4 py-3 pr-11 text-[15px] text-[#1B3A5C] placeholder:text-[#1B3A5C]/40 outline-none focus:border-[#1B3A5C]/30 transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1B3A5C]/30 hover:text-[#1B3A5C]/60 transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
        </button>
      </div>
    </div>
  )
}

export default function ChangePasswordPage() {
  const [current, setCurrent] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirm, setConfirm] = useState("")
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPw !== confirm) {
      setStatus({ type: "error", text: "New passwords don't match." })
      return
    }
    setSaving(true)
    setStatus(null)
    const res = await changePasswordAction({
      currentPassword: current,
      newPassword: newPw,
      confirmPassword: confirm,
    })
    if (res?.success) {
      setStatus({ type: "success", text: res.success })
      setCurrent("")
      setNewPw("")
      setConfirm("")
    } else {
      setStatus({ type: "error", text: res?.error ?? "Something went wrong." })
    }
    setSaving(false)
  }

  return (
    <div className="space-y-10 max-w-lg">

      {/* Header */}
      <div className="space-y-5">
        <Link
          href="/account/profile"
          className="inline-flex items-center gap-2 min-h-[40px] text-[13px] uppercase tracking-[0.16em] font-medium text-[#1B3A5C]/60 hover:text-[#1B3A5C] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
          Back to Profile
        </Link>
        <div>
          <p className="text-[11px] font-medium text-[#C9A96E] uppercase tracking-[0.18em] mb-1.5">
            Security
          </p>
          <h1 className="font-display text-3xl md:text-4xl text-[#1B3A5C] tracking-wide">Change Password</h1>
          <p className="text-[13px] text-[#1B3A5C]/60 mt-2">
            Choose a strong password to keep your account safe.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-6 sm:p-8 md:p-10">
        {status?.type === "success" && (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-emerald-200/60 bg-emerald-50 text-emerald-600 text-[13px] mb-8">
            <Check className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            {status.text}
          </div>
        )}
        {status?.type === "error" && (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-rose-200/60 bg-rose-50 text-rose-600 text-[13px] mb-8">
            <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            {status.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-7">
          <PasswordField id="current" label="Current Password" value={current} onChange={setCurrent} />
          <PasswordField id="new" label="New Password (min. 8 characters)" value={newPw} onChange={setNewPw} />
          <PasswordField id="confirm" label="Confirm New Password" value={confirm} onChange={setConfirm} />

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving || !current || !newPw || !confirm}
              className="inline-flex items-center px-6 py-3 bg-[#1B3A5C] text-[#FFFAF3] rounded-lg text-[13px] font-medium hover:bg-[#2A4F7A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Note */}
      <p className="text-[13px] text-[#1B3A5C]/60 leading-relaxed">
        Forgotten your current password?{" "}
        <Link href="/login" className="text-[#C9A96E] hover:text-[#1B3A5C] transition-colors">
          Sign out and use Forgot Password
        </Link>
        {" "}on the login page.
      </p>
    </div>
  )
}
