"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { guestReplyAction } from "@/app/admin/inquiries/[id]/actions"

export function OwnerReplyForm({ inquiryId }: { inquiryId: string }) {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || message.trim().length < 5) {
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
      setError("We could not reach the team just now. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-5 border-t border-[#1B3A5C]/8">
      <label className="text-[9px] uppercase tracking-[0.4em] text-[#1B3A5C]/40 font-medium block">
        Your Note
      </label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your note to the Salt Route team..."
        rows={3}
        className="w-full bg-[#F9F7F2] text-[#1B3A5C] text-[13px] px-4 py-3 border border-[#1B3A5C]/10 rounded-lg outline-none resize-none transition-colors placeholder:text-[#1B3A5C]/30 focus:border-[#C9A96E] focus:ring-3 focus:ring-[#C9A96E]/20 font-light leading-[1.8]"
      />
      {error && (
        <p className="text-[10px] text-[#B84040] uppercase tracking-[0.3em] font-medium">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending || !message.trim()}
        className="px-6 py-2.5 text-[9px] uppercase tracking-[0.35em] font-medium text-[#FFFDF8] bg-[#1B3A5C] hover:bg-[#2A4F7A] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? "Sending..." : "Send Reply"}
      </button>
    </form>
  )
}
