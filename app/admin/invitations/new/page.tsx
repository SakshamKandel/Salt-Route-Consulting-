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
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/invitations"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h2 className="text-3xl font-display text-navy">Send Invitation</h2>
          <p className="text-slate-500">Invite a new Owner or Admin to Salt Route.</p>
        </div>
      </div>

      {result?.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
          {result.success}
        </div>
      )}
      {result?.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
          {result.error}
        </div>
      )}

      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
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
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              name="role"
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="OWNER">Owner</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="pt-2">
            <p className="text-xs text-slate-500 mb-4">
              The invitation link expires in 7 days. The recipient will be prompted to set their password on first login.
            </p>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-navy text-cream hover:bg-navy/90"
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
