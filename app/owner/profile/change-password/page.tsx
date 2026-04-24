"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
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

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/owner/profile"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h2 className="text-3xl font-display text-navy">Change Password</h2>
          <p className="text-slate-500">Update your account password.</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        {message && (
          <div className={`mb-4 rounded-lg p-3 text-sm ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="current">Current Password</Label>
            <Input
              id="current"
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="next">New Password</Label>
            <Input
              id="next"
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              required
              minLength={8}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm New Password</Label>
            <Input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <Button
            type="submit"
            disabled={isPending || !current || !next || !confirm}
            className="w-full bg-navy text-cream hover:bg-navy/90"
          >
            {isPending ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  )
}
