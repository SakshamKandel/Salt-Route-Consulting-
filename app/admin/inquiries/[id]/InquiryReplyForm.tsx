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
        <h3 className="text-[15px] font-semibold text-[#1B3A5C] flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#C9A96E]" /> Reply to Guest
        </h3>
        {inquiry.status !== "CLOSED" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkResolved}
            disabled={isSending}
            className="h-8 rounded-lg border-[#1B3A5C]/15 text-[#1B3A5C]/60 text-[12px] font-medium hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 bg-transparent"
          >
            <Check className="w-3.5 h-3.5 mr-2" /> Mark as Resolved
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <Textarea
          placeholder="Type your reply here..."
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          className="min-h-[150px] rounded-xl border-[#1B3A5C]/10 bg-[#FBF9F4]/50 text-[13px] text-[#1B3A5C] placeholder:text-[#1B3A5C]/30 focus:border-[#1B3A5C]/30 focus:ring-0"
        />
        <Button
          onClick={handleReply}
          disabled={!reply.trim() || isSending}
          className="rounded-lg bg-[#1B3A5C] text-[#FFFAF3] text-[12px] font-medium hover:bg-[#2A4F7A]"
        >
          <Send className="w-3.5 h-3.5 mr-2" /> {isSending ? "Sending..." : "Send Reply"}
        </Button>
      </div>
    </div>
  )
}
