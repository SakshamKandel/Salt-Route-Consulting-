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
      setError("Please provide a reason (at least 5 characters).")
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
      setError(data.error || "Failed to cancel booking.")
      setIsPending(false)
    }
  }

  if (!open) {
    return (
      <button 
        onClick={() => setOpen(true)}
        className="w-full py-4 text-[10px] uppercase tracking-[0.4em] font-bold text-red-500/60 border border-red-500/10 hover:bg-red-500/5 transition-all duration-300"
      >
        Cancel Reservation
      </button>
    )
  }

  return (
    <div className="bg-white border border-charcoal/5 p-10 space-y-8">
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.3em] text-charcoal font-bold">Cancellation Request</p>
        <p className="text-xs text-charcoal/40 font-sans leading-relaxed">
          Please provide a brief explanation for your cancellation. This helps our team process your request efficiently.
        </p>
      </div>

      <Textarea
        placeholder="Reason for cancellation..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={4}
        className="bg-charcoal/[0.02] border-charcoal/5 focus:border-charcoal/20 focus:ring-0 rounded-none p-5 text-sm font-sans placeholder:text-charcoal/20 transition-all"
      />
      
      {error && <p className="text-[10px] uppercase tracking-[0.1em] text-red-500 font-bold">{error}</p>}
      
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="flex-1 bg-red-500 text-white py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-red-600 disabled:opacity-50 transition-all"
        >
          {isPending ? "Processing..." : "Confirm Cancellation"}
        </button>
        <button
          onClick={() => { setOpen(false); setError(null); setReason("") }}
          disabled={isPending}
          className="flex-1 bg-charcoal/[0.05] text-charcoal/60 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-charcoal/10 transition-all"
        >
          Return to Details
        </button>
      </div>
    </div>
  )
}
