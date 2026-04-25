"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { setup2FAAction, verify2FAAction, disable2FAAction } from "./actions"
import { Shield, ShieldOff, QrCode } from "lucide-react"
import Image from "next/image"

export function TwoFactorSetup({ enabled }: { enabled: boolean }) {
  const [step, setStep] = useState<"idle" | "setup" | "success">("idle")
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [code, setCode] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleStartSetup = async () => {
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

  const handleVerify = async () => {
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

  const handleDisable = async () => {
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
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <Shield size={18} className="text-green-700" />
          </div>
          <div>
            <p className="font-medium text-green-800">2FA is enabled</p>
            <p className="text-sm text-green-700 mt-0.5">
              Your account is protected with Google Authenticator or a compatible TOTP app.
            </p>
          </div>
        </div>
        {message && (
          <div className={`rounded-lg p-4 text-sm ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
            {message.text}
          </div>
        )}
        <Button variant="destructive" onClick={handleDisable} disabled={isPending} className="w-full">
          <ShieldOff className="w-4 h-4 mr-2" />
          {isPending ? "Disabling..." : "Disable Two-Factor Authentication"}
        </Button>
      </div>
    )
  }

  if (step === "setup" && qrDataUrl) {
    return (
      <div className="space-y-6 bg-white border rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-navy text-cream flex items-center justify-center text-sm font-bold shrink-0">1</div>
          <div>
            <p className="font-medium text-navy">Scan this QR code</p>
            <p className="text-sm text-slate-500 mt-1">Open Google Authenticator (or any TOTP app) and scan the code below.</p>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <Image src={qrDataUrl} alt="2FA QR Code" width={200} height={200} unoptimized />
          </div>
        </div>

        {secret && (
          <div className="bg-slate-50 border rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">Manual entry code</p>
            <p className="font-mono text-sm tracking-widest text-navy break-all">{secret}</p>
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-navy text-cream flex items-center justify-center text-sm font-bold shrink-0">2</div>
          <div className="flex-1">
            <p className="font-medium text-navy">Enter the 6-digit code</p>
            <p className="text-sm text-slate-500 mt-1 mb-3">Enter the code shown in your authenticator app to verify and activate 2FA.</p>
            <div className="flex gap-3">
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="font-mono text-center text-lg tracking-widest"
              />
              <Button
                onClick={handleVerify}
                disabled={code.length !== 6 || isPending}
                className="bg-navy text-cream shrink-0"
              >
                {isPending ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </div>
        </div>

        {message && (
          <div className={`rounded-lg p-4 text-sm ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
            {message.text}
          </div>
        )}
      </div>
    )
  }

  if (step === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-3">
        <div className="inline-flex w-16 h-16 rounded-full bg-green-100 items-center justify-center mx-auto">
          <Shield size={32} className="text-green-700" />
        </div>
        <p className="text-xl font-display text-green-800">2FA Enabled!</p>
        <p className="text-sm text-green-700">Your account is now protected. You will be prompted for a code on every login.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center shrink-0">
            <QrCode size={20} className="text-navy" />
          </div>
          <div>
            <p className="font-medium text-navy">Authenticator App Setup</p>
            <p className="text-sm text-slate-500 mt-1">
              Use Google Authenticator, Authy, or any TOTP-compatible app to generate time-based verification codes.
              Once enabled, you will be required to enter a code on every login.
            </p>
          </div>
        </div>
        {message && (
          <div className="rounded-lg p-4 text-sm bg-red-50 border border-red-200 text-red-800">
            {message.text}
          </div>
        )}
        <Button
          onClick={handleStartSetup}
          disabled={isPending}
          className="w-full bg-navy text-cream hover:bg-navy/90"
        >
          <Shield className="w-4 h-4 mr-2" />
          {isPending ? "Generating..." : "Set Up Two-Factor Authentication"}
        </Button>
      </div>
    </div>
  )
}
