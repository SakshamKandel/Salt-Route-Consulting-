"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { updateBookingStatusAction } from "./actions"
import { Check, X } from "lucide-react"
import type { BookingStatus } from "@prisma/client"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"

type BookingActionRow = {
  id: string
  status: BookingStatus
}

export function BookingActions({ booking }: { booking: BookingActionRow }) {
  const [reason, setReason] = useState("")
  const [isPending, setIsPending] = useState(false)

  const handleApprove = async () => {
    setIsPending(true)
    await updateBookingStatusAction(booking.id, "CONFIRMED")
    setIsPending(false)
  }

  const handleReject = async () => {
    setIsPending(true)
    await updateBookingStatusAction(booking.id, "CANCELLED", reason)
    setIsPending(false)
  }

  if (booking.status !== "PENDING") return null

  return (
    <div className="flex gap-3">
      <Button 
        onClick={handleApprove} 
        disabled={isPending} 
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <Check className="w-4 h-4 mr-2" /> Approve
      </Button>

      <Dialog>
        <DialogTrigger render={<Button variant="destructive" disabled={isPending} />}>
          <X className="w-4 h-4 mr-2" /> Reject
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Booking</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Provide a reason for rejection (this will be sent to the guest)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={handleReject} disabled={!reason || isPending}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
