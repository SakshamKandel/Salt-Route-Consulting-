"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
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
    "w-full bg-transparent text-sand/70 text-[12.5px] px-5 py-4 outline-none transition-all duration-500 placeholder:text-sand/20 font-light"
  const inputStyle = { border: "1px solid rgba(201,169,110,0.15)" }

  const fields = [
    { id: "current",  label: "Current Password",  value: current,  setter: setCurrent  },
    { id: "next",     label: "New Password",       value: next,     setter: setNext     },
    { id: "confirm",  label: "Confirm New Password", value: confirm, setter: setConfirm  },
  ]

  return (
    <div className="space-y-14 max-w-lg">

      {/* â”€â”€â”€ PAGE HEADER â”€â”€â”€ */}
      <div className="space-y-4">
        <Link
          href="/owner/profile"
          className="inline-flex items-center gap-3 text-[9px] uppercase tracking-[0.3em] text-sand/30 hover:text-gold transition-colors duration-500"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[1.3]" />
          Back to Profile
        </Link>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <span className="w-8 h-px bg-gold/40" />
            <p className="text-[9px] uppercase tracking-[0.45em] text-gold/60 font-medium">
              Security
            </p>
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-sand/85 tracking-wide">
            Change Password
          </h1>
        </div>
      </div>

      {/* â”€â”€â”€ FORM â”€â”€â”€ */}
      <div
        className="p-10 space-y-8"
        style={{
          border: "1px solid rgba(201,169,110,0.1)",
          background: "rgba(201,169,110,0.025)",
        }}
      >
        {/* Feedback message */}
        {message && (
          <div
            className="px-6 py-4 text-[11px] font-light leading-[1.8]"
            style={{
              border: `1px solid ${message.type === "success" ? "rgba(52,211,153,0.25)" : "rgba(239,100,100,0.25)"}`,
              background: message.type === "success" ? "rgba(52,211,153,0.06)" : "rgba(239,100,100,0.06)",
              color: message.type === "success" ? "rgba(52,211,153,0.9)" : "rgba(239,100,100,0.9)",
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map((field) => (
            <div key={field.id} className="space-y-2.5">
              <label
                htmlFor={field.id}
                className="text-[9px] uppercase tracking-[0.4em] text-sand/35 font-medium block"
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
                style={inputStyle}
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              />
            </div>
          ))}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending || !current || !next || !confirm}
              className="w-full sm:w-auto px-10 py-4 text-[9px] uppercase tracking-[0.4em] font-medium text-[#0C1F33] bg-gold hover:bg-gold/90 transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? "Saving..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* â”€â”€â”€ NOTE â”€â”€â”€ */}
      <div
        className="flex items-start gap-5 px-7 py-6"
        style={{ border: "1px solid rgba(201,169,110,0.07)" }}
      >
        <span className="w-4 h-px bg-gold/35 mt-2 shrink-0" />
        <p className="text-[11.5px] text-sand/28 font-light leading-[1.8]">
          Your new password must be at least 8 characters. If you&apos;ve forgotten your
          current password, sign out and use the &ldquo;Forgot password&rdquo; link on the login page.
        </p>
      </div>
    </div>
  )
}

