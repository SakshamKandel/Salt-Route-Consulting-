"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
      <Button variant="destructive" className="w-full" onClick={() => setOpen(true)}>
        Cancel Request
      </Button>
    )
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
      <p className="text-sm font-medium text-red-800">Why are you cancelling?</p>
      <Textarea
        placeholder="Please provide a reason (required)..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        className="bg-white"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleCancel}
          disabled={isPending}
          className="flex-1"
        >
          {isPending ? "Cancelling..." : "Confirm Cancellation"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setOpen(false); setError(null); setReason("") }}
          disabled={isPending}
        >
          Go Back
        </Button>
      </div>
    </div>
  )
}
