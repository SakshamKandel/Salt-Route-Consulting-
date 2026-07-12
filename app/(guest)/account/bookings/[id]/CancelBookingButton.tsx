"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCancel = async () => {
    if (reason.trim().length < 5) {
      setError("Please share a short note for our team.")
      return
    }
    setIsPending(true)
    setError(null)
    const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    })
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || "We could not send the cancellation yet.")
      setIsPending(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3.5 rounded-lg text-[13px] uppercase tracking-[0.15em] font-medium text-rose-600 border border-rose-200/60 hover:bg-rose-50/60 hover:text-rose-700 transition-colors"
      >
        Cancel Reservation
      </button>
    )
  }

  return (
    <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-6 sm:p-8 space-y-6">
      <div className="space-y-1.5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#1B3A5C] font-medium">Cancellation Request</p>
        <p className="text-[14px] text-[#1B3A5C]/70 leading-relaxed">
          Please share a brief note for our team. It helps us care for your reservation properly.
        </p>
      </div>

      <Textarea
        placeholder="Share your note here..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={4}
        className="bg-[#FBF9F4] border-[#1B3A5C]/10 focus:border-[#1B3A5C]/30 focus:ring-0 rounded-lg p-4 text-sm text-[#1B3A5C] placeholder:text-[#1B3A5C]/25 transition-colors"
      />

      {error && <p className="text-[13px] text-rose-600 font-medium">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="flex-1 bg-rose-500 text-white py-3 rounded-lg text-[13px] uppercase tracking-[0.1em] font-medium hover:bg-rose-600 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Sending..." : "Confirm Cancellation"}
        </button>
        <button
          onClick={() => { setOpen(false); setError(null); setReason("") }}
          disabled={isPending}
          className="flex-1 border border-[#1B3A5C]/10 text-[#1B3A5C]/60 py-3 rounded-lg text-[13px] uppercase tracking-[0.1em] font-medium hover:border-[#1B3A5C]/25 hover:text-[#1B3A5C] disabled:opacity-50 transition-colors"
        >
          Return to Details
        </button>
      </div>
    </div>
  )
}
