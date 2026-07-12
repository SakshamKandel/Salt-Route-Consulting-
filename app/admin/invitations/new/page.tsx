"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft, Send } from "lucide-react"
import { sendInvitationAction } from "./actions"

export default function NewInvitationPage() {
  const [result, setResult] = useState<{ success?: string; error?: string } | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setResult(null)
    const formData = new FormData(e.currentTarget)
    const res = await sendInvitationAction(formData)
    setResult(res)
    setIsPending(false)
    if (res.success) {
      (e.target as HTMLFormElement).reset()
    }
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="text-[#1B3A5C]/50 hover:text-[#1B3A5C] hover:bg-[#1B3A5C]/5 rounded-lg">
          <Link href="/admin/invitations"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Access</p>
          <h2 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Send Invitation</h2>
          <p className="text-[12px] text-[#1B3A5C]/45 mt-1">Invite a new Owner or Admin to Salt Route.</p>
        </div>
      </div>

      {result?.success && (
        <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-4 text-emerald-700 text-[12px]">
          {result.success}
        </div>
      )}
      {result?.error && (
        <div className="bg-rose-50 border border-rose-200/60 rounded-xl p-4 text-[#B84040] text-[12px]">
          {result.error}
        </div>
      )}

      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-[11px] font-medium text-[#1B3A5C]/60">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="colleague@example.com"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="role" className="text-[11px] font-medium text-[#1B3A5C]/60">Role</Label>
            <select
              id="role"
              name="role"
              className="mt-1 flex h-10 w-full rounded-lg border border-[#1B3A5C]/10 bg-white/60 px-3 py-2 text-sm text-[#1B3A5C] focus:border-[#1B3A5C]/30 focus-visible:outline-none"
            >
              <option value="OWNER">Owner</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="pt-2">
            <p className="text-[11px] text-[#1B3A5C]/45 mb-4">
              The invitation link expires in 7 days. The recipient will be prompted to set their password on first login.
            </p>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#1B3A5C] text-[#FFFAF3] hover:bg-[#2A4F7A] rounded-lg text-[12px] font-medium"
            >
              <Send className="w-4 h-4 mr-2" />
              {isPending ? "Sending..." : "Send Invite Email"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
