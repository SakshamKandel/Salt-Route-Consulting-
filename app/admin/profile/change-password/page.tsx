"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import { changeAdminPasswordAction } from "./actions"

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
    <div>
      <label htmlFor={id} className="block text-[11px] font-medium text-[#1B3A5C]/60 mb-1.5">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full h-10 px-3 pr-10 rounded-lg border border-[#1B3A5C]/10 bg-white/60 text-sm text-[#1B3A5C] placeholder:text-[#1B3A5C]/25 outline-none focus:border-[#1B3A5C]/30 transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1B3A5C]/30 hover:text-[#1B3A5C]/60 transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

export default function AdminChangePasswordPage() {
  const [current, setCurrent] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirm, setConfirm] = useState("")
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPw !== confirm) {
      setStatus({ type: "error", msg: "New passwords don't match." })
      return
    }
    setSaving(true)
    setStatus(null)
    const res = await changeAdminPasswordAction({
      currentPassword: current,
      newPassword: newPw,
      confirmPassword: confirm,
    })
    if (res?.success) {
      setStatus({ type: "success", msg: res.success })
      setCurrent("")
      setNewPw("")
      setConfirm("")
    } else {
      setStatus({ type: "error", msg: res?.error ?? "Something went wrong." })
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6 max-w-md">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/profile"
          className="w-8 h-8 rounded-lg border border-[#1B3A5C]/15 flex items-center justify-center hover:border-[#1B3A5C]/30 transition-colors text-[#1B3A5C]/50 hover:text-[#1B3A5C]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Security</p>
          <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Change Password</h1>
          <p className="text-[12px] text-[#1B3A5C]/45 mt-1">Update your admin account password.</p>
        </div>
      </div>

      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl p-5 space-y-4">
        {status?.type === "success" && (
          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-lg px-4 py-3 text-[12px]">
            <CheckCircle className="h-4 w-4 shrink-0" />
            {status.msg}
          </div>
        )}
        {status?.type === "error" && (
          <div className="flex items-center gap-2 text-[#B84040] bg-rose-50 border border-rose-200/60 rounded-lg px-4 py-3 text-[12px]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {status.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField id="current" label="Current password" value={current} onChange={setCurrent} />
          <PasswordField id="new" label="New password (min. 8 characters)" value={newPw} onChange={setNewPw} />
          <PasswordField id="confirm" label="Confirm new password" value={confirm} onChange={setConfirm} />
          <button
            type="submit"
            disabled={saving || !current || !newPw || !confirm}
            className="w-full h-10 rounded-lg bg-[#1B3A5C] text-[#FFFAF3] text-[12px] font-medium hover:bg-[#2A4F7A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      <p className="text-[11px] text-[#1B3A5C]/40 text-center">
        Forgotten your password?{" "}
        <Link href="/login" className="text-[#C9A96E] font-medium hover:underline underline-offset-2">
          Sign out and use Forgot password
        </Link>
      </p>
    </div>
  )
}
