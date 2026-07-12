"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function SendMessageForm({ userEmail, userName }: { userEmail: string; userName: string }) {
  const router = useRouter()
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) {
      setError("Please add a subject and message.")
      return
    }
    if (message.trim().length < 10) {
      setError("Please share a little more detail.")
      return
    }

    setIsPending(true)
    setError(null)

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          subject,
          message,
        }),
      })

      if (res.ok) {
        setSuccess(true)
        setSubject("")
        setMessage("")
        setTimeout(() => {
          setSuccess(false)
          router.refresh()
        }, 2000)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "We could not send your message yet. Please try again.")
      }
    } catch {
      setError("We could not reach the team just now. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="text-[13px] uppercase tracking-[0.16em] text-[#1B3A5C]/70 font-medium block mb-2.5">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Question about Sunshine Villa"
          className="w-full bg-[#FBF9F4] border border-[#1B3A5C]/10 rounded-lg text-[#1B3A5C] px-4 py-3.5 text-[15px] placeholder:text-[#1B3A5C]/40 focus:outline-none focus:border-[#1B3A5C]/30 transition-colors"
        />
      </div>
      <div>
        <label className="text-[13px] uppercase tracking-[0.16em] text-[#1B3A5C]/70 font-medium block mb-2.5">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share what you would like help with..."
          rows={4}
          className="w-full bg-[#FBF9F4] border border-[#1B3A5C]/10 rounded-lg text-[#1B3A5C] px-4 py-3.5 text-[15px] placeholder:text-[#1B3A5C]/40 focus:outline-none focus:border-[#1B3A5C]/30 transition-colors resize-none"
        />
      </div>

      {error && (
        <p className="text-[13px] text-rose-600 font-medium">{error}</p>
      )}
      {success && (
        <p className="text-[13px] text-emerald-700 font-medium">Your message has been sent.</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center px-6 py-3 bg-[#1B3A5C] text-[#FFFAF3] rounded-lg text-[13px] font-medium hover:bg-[#2A4F7A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? "Sending..." : "Send Message"}
      </button>
    </form>
  )
}
