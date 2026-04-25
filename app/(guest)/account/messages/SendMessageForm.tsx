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
      setError("Subject and message are required.")
      return
    }
    if (message.trim().length < 10) {
      setError("Message must be at least 10 characters.")
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
        setError(data.error || "Failed to send message. Please try again.")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="text-[9px] uppercase tracking-[0.2em] text-charcoal/50 font-sans font-medium block mb-3">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Question about Sunshine Villa"
          className="w-full bg-white border border-charcoal/10 text-charcoal px-5 py-4 text-sm font-sans placeholder:text-charcoal/30 focus:outline-none focus:border-charcoal/30 transition-colors"
        />
      </div>
      <div>
        <label className="text-[9px] uppercase tracking-[0.2em] text-charcoal/50 font-sans font-medium block mb-3">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message here..."
          rows={4}
          className="w-full bg-white border border-charcoal/10 text-charcoal px-5 py-4 text-sm font-sans placeholder:text-charcoal/30 focus:outline-none focus:border-charcoal/30 transition-colors resize-none"
        />
      </div>

      {error && (
        <p className="text-red-500 text-[10px] uppercase tracking-[0.2em] font-medium">{error}</p>
      )}
      {success && (
        <p className="text-green-600 text-[10px] uppercase tracking-[0.2em] font-medium">Message sent successfully.</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="bg-charcoal text-white px-10 py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-charcoal/90 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? "Sending..." : "Send Message"}
      </button>
    </form>
  )
}
