"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, Trash2 } from "lucide-react"
import { approveReviewAction, deleteReviewAction } from "./actions"

type ReviewActionRow = {
  id: string
  isApproved: boolean
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

  return (
    <div className="flex gap-3">
      {!review.isApproved && (
        <Button onClick={handleApprove} disabled={isPending} className="bg-green-600 hover:bg-green-700 text-white">
          <Check className="w-4 h-4 mr-2" /> Approve
        </Button>
      )}
      <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
        <Trash2 className="w-4 h-4 mr-2" /> Delete
      </Button>
    </div>
  )
}
