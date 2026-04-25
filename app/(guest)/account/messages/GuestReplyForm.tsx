"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { guestReplyAction } from "@/app/admin/inquiries/[id]/actions"

export function GuestReplyForm({ inquiryId }: { inquiryId: string }) {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    if (message.trim().length < 5) {
      setError("Reply is too short.")
      return
    }

    setIsPending(true)
    setError(null)

    try {
      const res = await guestReplyAction(inquiryId, message)
      if (res.success) {
        setMessage("")
        router.refresh()
      } else {
        setError(res.error || "Failed to send reply.")
      }
    } catch {
      setError("Network error.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="text-[9px] uppercase tracking-[0.2em] text-charcoal/50 font-sans font-medium block">Your Reply</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your response here..."
        rows={3}
        className="w-full bg-white border border-charcoal/10 text-charcoal px-5 py-4 text-sm font-sans placeholder:text-charcoal/30 focus:outline-none focus:border-charcoal/30 transition-colors resize-none"
      />
      {error && <p className="text-red-500 text-[10px] uppercase tracking-[0.2em] font-medium">{error}</p>}
      <button
        type="submit"
        disabled={isPending || !message.trim()}
        className="bg-charcoal text-white px-8 py-3 text-[9px] uppercase tracking-[0.3em] hover:bg-charcoal/90 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? "Sending..." : "Send Reply"}
      </button>
    </form>
  )
}
