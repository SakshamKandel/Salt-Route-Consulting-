"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Info, KeyRound } from "lucide-react"
import { changeOwnerPasswordAction } from "./actions"

export default function OwnerChangePasswordPage() {
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setMessage(null)
    const res = await changeOwnerPasswordAction({ current, next, confirm })
    if (res?.error) {
      setMessage({ type: "error", text: res.error })
    } else if (res?.success) {
      setMessage({ type: "success", text: res.success })
      setCurrent("")
      setNext("")
      setConfirm("")
    }
    setIsPending(false)
  }

  const inputClass =
    "w-full bg-[#FBF9F4] text-[#1B3A5C] text-[13px] px-4 py-2.5 border border-[#1B3A5C]/10 rounded-lg outline-none transition-colors placeholder:text-[#1B3A5C]/30 focus:border-[#C9A96E] focus:ring-3 focus:ring-[#C9A96E]/20"

  const fields = [
    { id: "current",  label: "Current Password",     value: current,  setter: setCurrent  },
    { id: "next",     label: "New Password",          value: next,     setter: setNext     },
    { id: "confirm",  label: "Confirm New Password",  value: confirm,  setter: setConfirm  },
  ]

  return (
    <div className="pb-12 space-y-8 max-w-lg">

      {/* ── PAGE HEADER ── */}
      <div className="space-y-4">
        <Link
          href="/owner/profile"
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#1B3A5C]/40 hover:text-[#1B3A5C] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to profile
        </Link>
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.3em] mb-1">
            Security
          </p>
          <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">
            Change password
          </h1>
        </div>
      </div>

      {/* ── FORM CARD ── */}
      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#1B3A5C]/5 flex items-center gap-2.5">
          <KeyRound className="h-3.5 w-3.5 text-[#1B3A5C]/30" />
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#1B3A5C]/45 font-medium">
            Update Password
          </h2>
        </div>

        <div className="p-5 space-y-5">
          {/* Feedback message */}
          {message && (
            <div
              className={`px-4 py-3 text-[12px] rounded-lg border ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                  : "bg-rose-50 text-rose-600 border-rose-200/60"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map((field) => (
              <div key={field.id} className="space-y-1.5">
                <label
                  htmlFor={field.id}
                  className="text-[10px] uppercase tracking-[0.15em] text-[#1B3A5C]/40 font-medium block"
                >
                  {field.label}
                </label>
                <input
                  id={field.id}
                  type="password"
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  required
                  minLength={field.id === "next" ? 8 : undefined}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
            ))}

            <div className="pt-1">
              <button
                type="submit"
                disabled={isPending || !current || !next || !confirm}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-[#1B3A5C] text-[#FFFAF3] rounded-lg text-[12px] font-medium hover:bg-[#2A4F7A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPending ? "Saving..." : "Update password"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── NOTE ── */}
      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl flex items-start gap-3 px-4 py-3.5">
        <Info className="h-3.5 w-3.5 text-[#1B3A5C]/30 mt-0.5 shrink-0" />
        <p className="text-[11px] text-[#1B3A5C]/45 leading-relaxed">
          Your new password must be at least 8 characters. If you&apos;ve forgotten your
          current password, sign out and use the &ldquo;Forgot password&rdquo; link on the login page.
        </p>
      </div>
    </div>
  )
}
