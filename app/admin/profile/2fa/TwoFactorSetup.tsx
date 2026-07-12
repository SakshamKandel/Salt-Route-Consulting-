"use client"

import { useState } from "react"
import { setup2FAAction, verify2FAAction, disable2FAAction } from "./actions"
import { Shield, ShieldOff, QrCode, CheckCircle, AlertCircle } from "lucide-react"
import Image from "next/image"

function StatusMsg({ type, text }: { type: "success" | "error"; text: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-[12px] ${
      type === "success"
        ? "bg-emerald-50 border border-emerald-200/60 text-emerald-700"
        : "bg-rose-50 border border-rose-200/60 text-[#B84040]"
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
        <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-5 flex items-start gap-4">
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
          className="w-full h-10 rounded-lg bg-[#B84040] text-white text-[12px] font-medium hover:bg-[#a13636] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ShieldOff className="h-4 w-4" />
          {isPending ? "Disabling..." : "Disable Two-Factor Authentication"}
        </button>
      </div>
    )
  }

  if (step === "setup" && qrDataUrl) {
    return (
      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl p-6 space-y-6">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-[#1B3A5C] text-[#C9A96E] flex items-center justify-center text-xs font-bold shrink-0">1</div>
          <div>
            <p className="font-semibold text-[#1B3A5C] text-[13px]">Scan this QR code</p>
            <p className="text-[12px] text-[#1B3A5C]/50 mt-0.5">Open Google Authenticator (or any TOTP app) and scan the code below.</p>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="border border-[#1B3A5C]/10 rounded-xl p-4 bg-white">
            <Image src={qrDataUrl} alt="2FA QR Code" width={200} height={200} unoptimized />
          </div>
        </div>

        {secret && (
          <div className="bg-[#FBF9F4] border border-[#1B3A5C]/8 rounded-lg p-3 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1B3A5C]/35 mb-1">Manual entry code</p>
            <p className="font-mono text-sm tracking-widest text-[#1B3A5C]/70 break-all">{secret}</p>
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-[#1B3A5C] text-[#C9A96E] flex items-center justify-center text-xs font-bold shrink-0">2</div>
          <div className="flex-1">
            <p className="font-semibold text-[#1B3A5C] text-[13px]">Enter the 6-digit code</p>
            <p className="text-[12px] text-[#1B3A5C]/50 mt-0.5 mb-3">Enter the code shown in your authenticator app to verify and activate 2FA.</p>
            <div className="flex gap-3">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="flex-1 h-10 px-3 rounded-lg border border-[#1B3A5C]/10 bg-white/60 font-mono text-center text-lg tracking-widest text-[#1B3A5C] outline-none focus:border-[#1B3A5C]/30 transition-colors"
              />
              <button
                onClick={handleVerify}
                disabled={code.length !== 6 || isPending}
                className="h-10 px-5 rounded-lg bg-[#1B3A5C] text-[#FFFAF3] text-[12px] font-medium hover:bg-[#2A4F7A] transition-colors disabled:opacity-50 shrink-0"
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
      <div className="bg-emerald-50 border border-emerald-200/60 rounded-2xl p-8 text-center space-y-4">
        <div className="inline-flex w-14 h-14 rounded-full bg-emerald-100 items-center justify-center mx-auto">
          <Shield className="h-6 w-6 text-emerald-700" />
        </div>
        <p className="text-lg font-bold text-emerald-800">2FA Enabled!</p>
        <p className="text-sm text-emerald-700">Your account is now protected. You will be prompted for a code on every login.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl p-6 space-y-4">
      <div className="flex items-start gap-4">
        <QrCode className="h-4 w-4 text-[#C9A96E] shrink-0" />
        <div>
          <p className="font-semibold text-[#1B3A5C] text-[13px]">Authenticator App Setup</p>
          <p className="text-[12px] text-[#1B3A5C]/50 mt-1">
            Use Google Authenticator, Authy, or any TOTP-compatible app to generate time-based verification codes.
            Once enabled, you will be required to enter a code on every login.
          </p>
        </div>
      </div>
      {message && <StatusMsg type={message.type} text={message.text} />}
      <button
        onClick={handleStartSetup}
        disabled={isPending}
        className="w-full h-10 rounded-lg bg-[#1B3A5C] text-[#FFFAF3] text-[12px] font-medium hover:bg-[#2A4F7A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Shield className="h-4 w-4" />
        {isPending ? "Generating..." : "Set Up Two-Factor Authentication"}
      </button>
    </div>
  )
}
