"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { replyToInquiryAction, updateInquiryStatusAction } from "./actions"
import { Check, Mail, Send } from "lucide-react"
import type { InquiryStatus } from "@prisma/client"

type InquiryReplyRow = {
  id: string
  status: InquiryStatus
}

export function InquiryReplyForm({ inquiry }: { inquiry: InquiryReplyRow }) {
  const [reply, setReply] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleReply = async () => {
    setIsSending(true)
    const res = await replyToInquiryAction(inquiry.id, reply)
    if (res.success) {
      setReply("")
      alert("Reply sent successfully!")
    } else {
      alert("Error: " + res.error)
    }
    setIsSending(false)
  }

  const handleMarkResolved = async () => {
    setIsSending(true)
    await updateInquiryStatusAction(inquiry.id, "CLOSED")
    setIsSending(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-navy flex items-center gap-2">
          <Mail className="w-5 h-5" /> Reply to Guest
        </h3>
        {inquiry.status !== "CLOSED" && (
          <Button variant="outline" size="sm" onClick={handleMarkResolved} disabled={isSending}>
            <Check className="w-4 h-4 mr-2" /> Mark as Resolved
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <Textarea
          placeholder="Type your reply here..."
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          className="min-h-[150px]"
        />
        <Button 
          onClick={handleReply} 
          disabled={!reply.trim() || isSending}
          className="bg-navy text-cream"
        >
          <Send className="w-4 h-4 mr-2" /> {isSending ? "Sending..." : "Send Reply"}
        </Button>
      </div>
    </div>
  )
}
