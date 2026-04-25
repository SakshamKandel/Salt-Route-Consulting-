import type { InquirySender, InquiryStatus } from "@prisma/client"

export type InquiryMessageView = {
  id: string
  sender: InquirySender
  body: string
  createdAt: Date | string
}

export type InquiryUnreadShape = {
  status: InquiryStatus
  lastMessageAt: Date | string
  lastMessageBy: InquirySender
  adminLastReadAt?: Date | string | null
  guestLastReadAt?: Date | string | null
  ownerLastReadAt?: Date | string | null
}

function isAfter(value: Date | string, compare?: Date | string | null) {
  if (!compare) return true
  return new Date(value).getTime() > new Date(compare).getTime()
}

export function isInquiryUnreadForAdmin(inquiry: InquiryUnreadShape) {
  return inquiry.status !== "CLOSED" && inquiry.lastMessageBy !== "ADMIN" && isAfter(inquiry.lastMessageAt, inquiry.adminLastReadAt)
}

export function isInquiryUnreadForGuest(inquiry: InquiryUnreadShape) {
  return inquiry.status !== "CLOSED" && inquiry.lastMessageBy === "ADMIN" && isAfter(inquiry.lastMessageAt, inquiry.guestLastReadAt)
}

export function isInquiryUnreadForOwner(inquiry: InquiryUnreadShape) {
  return inquiry.status !== "CLOSED" && inquiry.lastMessageBy === "ADMIN" && isAfter(inquiry.lastMessageAt, inquiry.ownerLastReadAt)
}

export function normalizeInquiryMessages(
  inquiry: {
    id: string
    message: string
    createdAt: Date | string
    messages?: InquiryMessageView[]
  }
): InquiryMessageView[] {
  if (inquiry.messages?.length) {
    return inquiry.messages
  }

  return [
    {
      id: `${inquiry.id}:initial`,
      sender: "GUEST",
      body: inquiry.message,
      createdAt: inquiry.createdAt,
    },
  ]
}
