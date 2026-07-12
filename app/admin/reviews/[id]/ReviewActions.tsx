"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, EyeOff, Trash2 } from "lucide-react"
import { approveReviewAction, deleteReviewAction, hideReviewAction } from "./actions"
import type { ReviewStatus } from "@prisma/client"

type ReviewActionRow = {
  id: string
  status: ReviewStatus
}

export function ReviewActions({ review }: { review: ReviewActionRow }) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const handleApprove = async () => {
    setIsPending(true)
    const res = await approveReviewAction(review.id)
    if (res.success) alert("Review approved!")
    else alert("Error: " + res.error)
    setIsPending(false)
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this review permanently?")) return
    setIsPending(true)
    const res = await deleteReviewAction(review.id)
    if (res.success) {
      alert("Review deleted!")
      router.push("/admin/reviews")
    } else {
      alert("Error: " + res.error)
      setIsPending(false)
    }
  }

  const handleHide = async () => {
    setIsPending(true)
    const res = await hideReviewAction(review.id)
    if (res.success) alert("Review hidden.")
    else alert("Error: " + res.error)
    setIsPending(false)
  }

  return (
    <div className="flex gap-2">
      {review.status !== "PUBLISHED" && (
        <Button onClick={handleApprove} disabled={isPending} className="h-9 rounded-lg bg-[#1B3A5C] text-[#FFFAF3] text-[12px] font-medium hover:bg-[#2A4F7A]">
          <Check className="w-3.5 h-3.5 mr-2" /> Publish
        </Button>
      )}
      {review.status !== "HIDDEN" && (
        <Button variant="outline" onClick={handleHide} disabled={isPending} className="h-9 rounded-lg border-[#1B3A5C]/15 text-[#1B3A5C]/60 text-[12px] font-medium hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 bg-transparent">
          <EyeOff className="w-3.5 h-3.5 mr-2" /> Hide
        </Button>
      )}
      <Button onClick={handleDelete} disabled={isPending} className="h-9 rounded-lg bg-[#B84040] text-white text-[12px] font-medium hover:bg-[#B84040]/85">
        <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
      </Button>
    </div>
  )
}
