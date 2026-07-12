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
      <div className="flex flex-wrap gap-2">
        {/* PENDING → Confirm or Reject */}
        {booking.status === "PENDING" && (
          <>
            <Button
              onClick={() => handleAction("CONFIRMED")}
              disabled={isPending}
              className="h-9 rounded-lg bg-[#1B3A5C] text-[#FFFAF3] text-[12px] font-medium hover:bg-[#2A4F7A]"
              size="sm"
            >
              <Check className="w-3.5 h-3.5 mr-2" /> Confirm
            </Button>
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => setShowReject(true)}
              className="h-9 rounded-lg bg-[#B84040] text-white text-[12px] font-medium hover:bg-[#B84040]/85"
            >
              <X className="w-3.5 h-3.5 mr-2" /> Reject
            </Button>
          </>
        )}

        {/* CONFIRMED → Check In or Cancel */}
        {booking.status === "CONFIRMED" && (
          <>
            <Button
              onClick={() => handleAction("CHECKED_IN")}
              disabled={isPending}
              className="h-9 rounded-lg bg-[#1B3A5C] text-[#FFFAF3] text-[12px] font-medium hover:bg-[#2A4F7A]"
              size="sm"
            >
              <LogIn className="w-3.5 h-3.5 mr-2" /> Mark Checked In
            </Button>
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => setShowReject(true)}
              className="h-9 rounded-lg border border-[#B84040]/30 bg-transparent text-[#B84040] text-[12px] font-medium hover:bg-rose-50"
            >
              <Ban className="w-3.5 h-3.5 mr-2" /> Cancel Booking
            </Button>
          </>
        )}

        {/* COMPLETED (Checked In) → Mark as Checked Out or No Show */}
        {booking.status === "CHECKED_IN" && (
          <>
            <Button
              onClick={() => handleAction("COMPLETED")}
              disabled={isPending}
              className="h-9 rounded-lg bg-[#1B3A5C] text-[#FFFAF3] text-[12px] font-medium hover:bg-[#2A4F7A]"
              size="sm"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" /> Mark Checked Out
            </Button>
            <Button
              onClick={() => handleAction("NO_SHOW")}
              disabled={isPending}
              variant="outline"
              size="sm"
              className="h-9 rounded-lg border-orange-200 text-orange-600 text-[12px] font-medium hover:bg-orange-50 hover:text-orange-700"
            >
              <Ban className="w-3.5 h-3.5 mr-2" /> No Show
            </Button>
          </>
        )}
        {["COMPLETED", "CANCELLED", "NO_SHOW"].includes(booking.status) && (
          <p className="text-[12px] text-[#1B3A5C]/40">No further actions are available for this booking.</p>
        )}
      </div>

      {/* Rejection/Cancellation Reason Modal */}
      {showReject && (
        <div className="bg-rose-50 border border-rose-200/60 rounded-xl p-4 space-y-3">
          <p className="text-[10px] font-medium text-[#B84040] uppercase tracking-[0.2em]">Provide a reason</p>
          <Textarea
            placeholder="Explain why this booking is being rejected or cancelled..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[80px] bg-[#FFFAF3] border-rose-200/60 text-[13px] text-[#1B3A5C] rounded-lg focus:ring-0"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleAction("CANCELLED", reason)}
              disabled={!reason.trim() || isPending}
              className="h-8 rounded-lg bg-[#B84040] text-white text-[12px] font-medium hover:bg-[#B84040]/85"
            >
              {isPending ? "Processing..." : "Confirm"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowReject(false); setReason("") }}
              disabled={isPending}
              className="h-8 rounded-lg border-[#1B3A5C]/15 text-[#1B3A5C]/60 text-[12px] font-medium hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
