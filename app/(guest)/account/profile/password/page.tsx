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
    <div className="space-y-2">
      <label htmlFor={id} className="text-[9px] uppercase tracking-[0.2em] text-charcoal/40 font-medium block">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full border-0 border-b border-charcoal/15 bg-transparent px-0 py-3 pr-8 text-sm font-sans text-charcoal placeholder:text-charcoal/20 outline-none focus:border-charcoal transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-charcoal/30 hover:text-charcoal/60 transition-colors"
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
    <div className="space-y-12 max-w-lg">

      {/* Header */}
      <div className="space-y-6">
        <Link
          href="/account/profile"
          className="inline-flex items-center gap-3 text-[9px] uppercase tracking-[0.3em] text-charcoal/30 hover:text-charcoal transition-colors duration-300"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[1.3]" />
          Back to Profile
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-8 h-[1px] bg-charcoal/20" />
          <h1 className="text-[11px] uppercase tracking-[0.3em] text-charcoal/50 font-medium">Security</h1>
        </div>
        <h2 className="font-display text-3xl text-charcoal tracking-wide">Change Password</h2>
      </div>

      {/* Form */}
      <div className="bg-white border border-charcoal/5 p-8 md:p-12">
        {status?.type === "success" && (
          <div className="flex items-center gap-3 p-4 border border-charcoal/10 bg-charcoal/[0.02] text-charcoal/70 text-xs mb-8">
            <Check className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            {status.text}
          </div>
        )}
        {status?.type === "error" && (
          <div className="flex items-center gap-3 p-4 border border-red-200 bg-red-50 text-red-600 text-xs mb-8">
            <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            {status.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          <PasswordField id="current" label="Current Password" value={current} onChange={setCurrent} />
          <PasswordField id="new" label="New Password (min. 8 characters)" value={newPw} onChange={setNewPw} />
          <PasswordField id="confirm" label="Confirm New Password" value={confirm} onChange={setConfirm} />

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving || !current || !newPw || !confirm}
              className="bg-charcoal text-white px-10 py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-charcoal/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Note */}
      <p className="text-[10.5px] text-charcoal/30 leading-relaxed font-light">
        Forgotten your current password?{" "}
        <Link href="/login" className="underline underline-offset-4 decoration-charcoal/15 hover:text-charcoal/60 transition-colors">
          Sign out and use Forgot Password
        </Link>
        {" "}on the login page.
      </p>
    </div>
  )
}
