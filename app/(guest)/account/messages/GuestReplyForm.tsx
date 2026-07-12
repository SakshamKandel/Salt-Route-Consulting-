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
      setError("Please share a little more detail.")
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
        setError(res.error || "We could not send your reply yet.")
      }
    } catch {
      setError("We could not reach the team just now.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="text-[13px] uppercase tracking-[0.16em] text-[#1B3A5C]/70 font-medium block">Your Reply</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your note here..."
        rows={3}
        className="w-full bg-[#FBF9F4] border border-[#1B3A5C]/10 rounded-lg text-[#1B3A5C] px-4 py-3.5 text-[15px] placeholder:text-[#1B3A5C]/40 focus:outline-none focus:border-[#1B3A5C]/30 transition-colors resize-none"
      />
      {error && <p className="text-[13px] text-rose-600 font-medium">{error}</p>}
      <button
        type="submit"
        disabled={isPending || !message.trim()}
        className="inline-flex items-center px-6 py-2.5 bg-[#1B3A5C] text-[#FFFAF3] rounded-lg text-[13px] font-medium hover:bg-[#2A4F7A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? "Sending..." : "Send Reply"}
      </button>
    </form>
  )
}
