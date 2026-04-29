"use client"

import { useState } from "react"
import { updateAdminProfileAction, changeAdminPasswordAction } from "./actions"
import { User, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"

interface Props {
  user: {
    name: string
    email: string
    phone: string | null
  }
}

function SuccessMsg({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm">
      <CheckCircle className="h-4 w-4 shrink-0" />
      {msg}
    </div>
  )
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
      <AlertCircle className="h-4 w-4 shrink-0" />
      {msg}
    </div>
  )
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
  hint,
  suffix,
}: {
  label: string
  type?: string
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  disabled?: boolean
  hint?: string
  suffix?: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full h-10 px-3 rounded-lg border text-sm text-slate-800 placeholder:text-slate-300 outline-none transition-colors ${
            disabled
              ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-white border-slate-200 focus:border-[#1B3A5C] focus:ring-1 focus:ring-[#1B3A5C]/20"
          } ${suffix ? "pr-10" : ""}`}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
        )}
      </div>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  )
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <Field
      label={label}
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      suffix={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
    />
  )
}

export function ProfileSection({ user }: Props) {
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone ?? "")
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    const res = await updateAdminProfileAction({ name, phone: phone || null })
    setStatus(res.success ? { type: "success", msg: res.success } : { type: "error", msg: res.error ?? "Error" })
    setSaving(false)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
        <User className="h-4 w-4 text-slate-400" />
        <div>
          <p className="text-sm font-semibold text-slate-800">Profile</p>
          <p className="text-xs text-slate-400">Your display name and contact details</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {status?.type === "success" && <SuccessMsg msg={status.msg} />}
        {status?.type === "error" && <ErrorMsg msg={status.msg} />}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Full name"
            value={name}
            onChange={setName}
            placeholder="Your name"
          />
          <Field
            label="Email"
            value={user.email}
            disabled
            hint="Email cannot be changed here"
          />
          <Field
            label="Phone number"
            value={phone}
            onChange={setPhone}
            placeholder="+977 98..."
          />
        </div>
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={saving}
            className="h-9 px-5 rounded-lg bg-[#1B3A5C] text-white text-sm font-medium hover:bg-[#1B3A5C]/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  )
}

export function SecuritySection() {
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
    if (res.success) {
      setStatus({ type: "success", msg: res.success })
      setCurrent("")
      setNewPw("")
      setConfirm("")
    } else {
      setStatus({ type: "error", msg: res.error ?? "Error" })
    }
    setSaving(false)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
        <Lock className="h-4 w-4 text-slate-400" />
        <div>
          <p className="text-sm font-semibold text-slate-800">Change Password</p>
          <p className="text-xs text-slate-400">Use a strong, unique password</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {status?.type === "success" && <SuccessMsg msg={status.msg} />}
        {status?.type === "error" && <ErrorMsg msg={status.msg} />}
        <PasswordField label="Current password" value={current} onChange={setCurrent} placeholder="••••••••" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PasswordField label="New password" value={newPw} onChange={setNewPw} placeholder="Min. 8 characters" />
          <PasswordField label="Confirm new password" value={confirm} onChange={setConfirm} placeholder="Repeat new password" />
        </div>
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={saving || !current || !newPw || !confirm}
            className="h-9 px-5 rounded-lg bg-[#1B3A5C] text-white text-sm font-medium hover:bg-[#1B3A5C]/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  )
}
