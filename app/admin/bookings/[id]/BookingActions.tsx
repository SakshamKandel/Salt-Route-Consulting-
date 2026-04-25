"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { updateBookingStatusAction } from "./actions"
import { Check, X, LogIn, LogOut, Ban } from "lucide-react"
import type { BookingStatus } from "@prisma/client"

type BookingActionRow = {
  id: string
  status: BookingStatus
}

export function BookingActions({ booking }: { booking: BookingActionRow }) {
  const [reason, setReason] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [showReject, setShowReject] = useState(false)

  const handleAction = async (status: BookingStatus, actionReason?: string) => {
    setIsPending(true)
    await updateBookingStatusAction(booking.id, status, actionReason)
    setIsPending(false)
    setShowReject(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {/* PENDING → Confirm or Reject */}
        {booking.status === "PENDING" && (
          <>
            <Button
              onClick={() => handleAction("CONFIRMED")}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Check className="w-4 h-4 mr-2" /> Confirm
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={() => setShowReject(true)}
            >
              <X className="w-4 h-4 mr-2" /> Reject
            </Button>
          </>
        )}

        {/* CONFIRMED → Check In or Cancel */}
        {booking.status === "CONFIRMED" && (
          <>
            <Button
              onClick={() => handleAction("CHECKED_IN")}
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <LogIn className="w-4 h-4 mr-2" /> Mark Checked In
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={() => setShowReject(true)}
            >
              <Ban className="w-4 h-4 mr-2" /> Cancel Booking
            </Button>
          </>
        )}

        {/* COMPLETED (Checked In) → Mark as Checked Out or No Show */}
        {booking.status === "CHECKED_IN" && (
          <>
            <Button
              onClick={() => handleAction("COMPLETED")}
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" /> Mark Checked Out
            </Button>
            <Button
              onClick={() => handleAction("NO_SHOW")}
              disabled={isPending}
              variant="outline"
              size="sm"
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <Ban className="w-4 h-4 mr-2" /> No Show
            </Button>
          </>
        )}
        {["COMPLETED", "CANCELLED", "NO_SHOW"].includes(booking.status) && (
          <p className="text-sm text-slate-500">No further actions are available for this booking.</p>
        )}
      </div>

      {/* Rejection/Cancellation Reason Modal */}
      {showReject && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium text-red-800">Provide a reason:</p>
          <Textarea
            placeholder="Explain why this booking is being rejected or cancelled..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[80px] bg-white"
          />
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleAction("CANCELLED", reason)}
              disabled={!reason.trim() || isPending}
            >
              {isPending ? "Processing..." : "Confirm"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowReject(false); setReason("") }}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
