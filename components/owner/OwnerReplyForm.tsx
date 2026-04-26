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
    <form onSubmit={handleSubmit} className="space-y-4 pt-6" style={{ borderTop: "1px solid rgba(197,168,128,0.08)" }}>
      <label className="text-[9px] uppercase tracking-[0.4em] text-sand/35 font-medium block">
        Your Note
      </label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your note to the Salt Route team..."
        rows={3}
        className="w-full bg-transparent text-sand/70 text-[12.5px] px-5 py-4 outline-none resize-none transition-all duration-500 placeholder:text-sand/20 font-light leading-[1.8]"
        style={{ border: "1px solid rgba(197,168,128,0.15)" }}
      />
      {error && (
        <p className="text-[10px] uppercase tracking-[0.3em] font-medium" style={{ color: "rgba(239,100,100,0.8)" }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending || !message.trim()}
        className="px-8 py-3.5 text-[9px] uppercase tracking-[0.35em] font-medium text-[#0C1F33] bg-gold hover:bg-gold/90 transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? "Sending..." : "Send Reply"}
      </button>
    </form>
  )
}

