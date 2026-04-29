"use client"

import { useState } from "react"
import { setup2FAAction, verify2FAAction, disable2FAAction } from "./actions"
import { Shield, ShieldOff, QrCode, CheckCircle, AlertCircle } from "lucide-react"
import Image from "next/image"

function StatusMsg({ type, text }: { type: "success" | "error"; text: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
      type === "success"
        ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
        : "bg-red-50 border border-red-200 text-red-700"
    }`}>
      {type === "success"
        ? <CheckCircle className="h-4 w-4 shrink-0" />
        : <AlertCircle className="h-4 w-4 shrink-0" />}
      {text}
    </div>
  )
}

export function TwoFactorSetup({ enabled }: { enabled: boolean }) {
  const [step, setStep] = useState<"idle" | "setup" | "success">("idle")
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [code, setCode] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function handleStartSetup() {
    setIsPending(true)
    setMessage(null)
    const result = await setup2FAAction()
    if ("error" in result) {
      setMessage({ type: "error", text: result.error! })
    } else {
      setQrDataUrl(result.qrDataUrl!)
      setSecret(result.secret!)
      setStep("setup")
    }
    setIsPending(false)
  }

  async function handleVerify() {
    setIsPending(true)
    setMessage(null)
    const result = await verify2FAAction(code)
    if (result.error) {
      setMessage({ type: "error", text: result.error })
    } else {
      setMessage({ type: "success", text: result.success! })
      setStep("success")
    }
    setIsPending(false)
  }

  async function handleDisable() {
    if (!confirm("Are you sure you want to disable 2FA? This will make your account less secure.")) return
    setIsPending(true)
    setMessage(null)
    const result = await disable2FAAction()
    if (result.error) {
      setMessage({ type: "error", text: result.error })
    } else {
      setMessage({ type: "success", text: result.success! })
    }
    setIsPending(false)
  }

  if (enabled && step !== "success") {
    return (
      <div className="space-y-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start gap-4">
            <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
          <div>
            <p className="font-semibold text-emerald-800 text-sm">2FA is enabled</p>
            <p className="text-sm text-emerald-700 mt-0.5">
              Your account is protected with Google Authenticator or a compatible TOTP app.
            </p>
          </div>
        </div>
        {message && <StatusMsg type={message.type} text={message.text} />}
        <button
          onClick={handleDisable}
          disabled={isPending}
          className="w-full h-10 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ShieldOff className="h-4 w-4" />
          {isPending ? "Disabling..." : "Disable Two-Factor Authentication"}
        </button>
      </div>
    )
  }

  if (step === "setup" && qrDataUrl) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-[#1B3A5C] text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Scan this QR code</p>
            <p className="text-sm text-slate-500 mt-0.5">Open Google Authenticator (or any TOTP app) and scan the code below.</p>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="border border-slate-200 rounded-lg p-4 bg-white">
            <Image src={qrDataUrl} alt="2FA QR Code" width={200} height={200} unoptimized />
          </div>
        </div>

        {secret && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">Manual entry code</p>
            <p className="font-mono text-sm tracking-widest text-slate-700 break-all">{secret}</p>
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-[#1B3A5C] text-white flex items-center justify-center text-xs font-bold shrink-0">2</div>
          <div className="flex-1">
            <p className="font-semibold text-slate-800 text-sm">Enter the 6-digit code</p>
            <p className="text-sm text-slate-500 mt-0.5 mb-3">Enter the code shown in your authenticator app to verify and activate 2FA.</p>
            <div className="flex gap-3">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="flex-1 h-10 px-3 rounded-lg border border-slate-200 font-mono text-center text-lg tracking-widest outline-none focus:border-[#1B3A5C] focus:ring-1 focus:ring-[#1B3A5C]/20 transition-colors"
              />
              <button
                onClick={handleVerify}
                disabled={code.length !== 6 || isPending}
                className="h-10 px-5 rounded-lg bg-[#1B3A5C] text-white text-sm font-medium hover:bg-[#1B3A5C]/90 transition-colors disabled:opacity-50 shrink-0"
              >
                {isPending ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
        </div>

        {message && <StatusMsg type={message.type} text={message.text} />}
      </div>
    )
  }

  if (step === "success") {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center space-y-4">
        <div className="inline-flex w-14 h-14 rounded-full bg-emerald-100 items-center justify-center mx-auto">
          <Shield className="h-6 w-6 text-emerald-700" />
        </div>
        <p className="text-lg font-bold text-emerald-800">2FA Enabled!</p>
        <p className="text-sm text-emerald-700">Your account is now protected. You will be prompted for a code on every login.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
      <div className="flex items-start gap-4">
        <QrCode className="h-4 w-4 text-slate-400 shrink-0" />
        <div>
          <p className="font-semibold text-slate-800 text-sm">Authenticator App Setup</p>
          <p className="text-sm text-slate-500 mt-1">
            Use Google Authenticator, Authy, or any TOTP-compatible app to generate time-based verification codes.
            Once enabled, you will be required to enter a code on every login.
          </p>
        </div>
      </div>
      {message && <StatusMsg type={message.type} text={message.text} />}
      <button
        onClick={handleStartSetup}
        disabled={isPending}
        className="w-full h-10 rounded-lg bg-[#1B3A5C] text-white text-sm font-medium hover:bg-[#1B3A5C]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Shield className="h-4 w-4" />
        {isPending ? "Generating..." : "Set Up Two-Factor Authentication"}
      </button>
    </div>
  )
}
