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
      <label htmlFor={id} className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full h-10 px-3 pr-10 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-[#1B3A5C] focus:ring-1 focus:ring-[#1B3A5C]/20 transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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
          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-500"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Change Password</h1>
          <p className="text-sm text-slate-500 mt-0.5">Update your admin account password.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        {status?.type === "success" && (
          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm">
            <CheckCircle className="h-4 w-4 shrink-0" />
            {status.msg}
          </div>
        )}
        {status?.type === "error" && (
          <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
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
            className="w-full h-10 rounded-lg bg-[#1B3A5C] text-white text-sm font-medium hover:bg-[#1B3A5C]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Forgotten your password?{" "}
        <Link href="/login" className="text-[#1B3A5C] font-medium underline underline-offset-2">
          Sign out and use Forgot password
        </Link>
      </p>
    </div>
  )
}
