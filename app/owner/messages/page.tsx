import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { ShieldCheck, User, MessageSquare } from "lucide-react"
import { OwnerReplyForm } from "@/components/owner/OwnerReplyForm"
import { isInquiryUnreadForOwner, normalizeInquiryMessages } from "@/lib/inquiries"
import { getPagination, parsePage } from "@/lib/pagination"
import { PaginationControls } from "@/components/shared/pagination-controls"

const STATUS_CHIP: Record<string, { label: string; cls: string }> = {
  NEW:         { label: "New",       cls: "bg-[#C9A96E]/10 text-[#A8863F] border-[#C9A96E]/30" },
  OPEN:        { label: "Open",      cls: "bg-sky-50 text-sky-600 border-sky-200/60" },
  IN_PROGRESS: { label: "In care",   cls: "bg-amber-50 text-amber-600 border-amber-200/60" },
  RESPONDED:   { label: "Responded", cls: "bg-emerald-50 text-emerald-600 border-emerald-200/60" },
  CLOSED:      { label: "Closed",    cls: "bg-[#1B3A5C]/5 text-[#1B3A5C]/50 border-[#1B3A5C]/10" },
}

export default async function OwnerMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const params = await searchParams
  const requestedPage = parsePage(params.page)
  const where = { ownerId: session.user.id }
  const total = await prisma.inquiry.count({ where })
  const pagination = getPagination(requestedPage, total, 10)

  const inquiries = await prisma.inquiry.findMany({
    where,
    orderBy: { lastMessageAt: "desc" },
    skip: pagination.skip,
    take: pagination.take,
    include: { messages: { orderBy: { createdAt: "asc" } } },
  })

  return (
    <div className="pb-12 space-y-8">

      {/* ── PAGE HEADER ── */}
      <div>
        <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.3em] mb-1">
          Owner Conversations
        </p>
        <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">
          Messages
        </h1>
        <p className="text-[12px] text-[#1B3A5C]/45 mt-1.5 max-w-xl">
          Your direct channel for property updates, guest care, calendar questions, and Salt Route support.
        </p>
      </div>

      {inquiries.length === 0 ? (
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl py-16 text-center">
          <MessageSquare className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-3" />
          <p className="text-[13px] text-[#1B3A5C]/35 font-medium">No conversations yet</p>
          <p className="text-[11px] text-[#1B3A5C]/25 mt-1">Your messages with the Salt Route team will appear here</p>
        </div>
      ) : (
        <div className="space-y-5">
          {inquiries.map((inquiry) => {
            const messages = normalizeInquiryMessages(inquiry)
            const unread = isInquiryUnreadForOwner(inquiry)
            const chip = STATUS_CHIP[inquiry.status] ?? STATUS_CHIP.CLOSED

            return (
              <div
                key={inquiry.id}
                className={`bg-[#FFFAF3] rounded-2xl overflow-hidden border ${
                  unread ? "border-[#C9A96E]/40" : "border-[#1B3A5C]/8"
                }`}
              >
                {/* Thread header */}
                <div className="px-5 py-4 border-b border-[#1B3A5C]/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      {unread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E] shrink-0" />
                      )}
                      <p className="text-[14px] font-semibold text-[#1B3A5C] truncate">
                        {inquiry.subject}
                      </p>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[#1B3A5C]/35 font-medium mt-1">
                      Last activity{" "}
                      {new Date(inquiry.lastMessageAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className={`self-start sm:self-auto inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-semibold border uppercase tracking-[0.15em] shrink-0 ${chip.cls}`}>
                    {chip.label}
                  </span>
                </div>

                {/* Messages */}
                <div className="px-5 py-5 space-y-5">
                  {messages.map((msg) => {
                    const isAdmin = msg.sender === "ADMIN"
                    return (
                      <div key={msg.id} className="flex gap-3 items-start">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                            isAdmin
                              ? "bg-[#C9A96E]/10 border-[#C9A96E]/25"
                              : "bg-[#1B3A5C]/5 border-[#1B3A5C]/10"
                          }`}
                        >
                          {isAdmin ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A96E]" strokeWidth={1.5} />
                          ) : (
                            <User className="w-3.5 h-3.5 text-[#1B3A5C]/50" strokeWidth={1.5} />
                          )}
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-baseline gap-2.5">
                            <p className={`text-[10px] uppercase tracking-[0.15em] font-semibold ${
                              isAdmin ? "text-[#A8863F]" : "text-[#1B3A5C]/50"
                            }`}>
                              {isAdmin ? "Salt Route Team" : "You"}
                            </p>
                            <p className="text-[10px] text-[#1B3A5C]/30">
                              {new Date(msg.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <p className="text-[13px] text-[#1B3A5C]/70 leading-relaxed whitespace-pre-wrap">
                            {msg.body}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Reply form */}
                {inquiry.status !== "CLOSED" && (
                  <div className="px-5 pb-5">
                    <OwnerReplyForm inquiryId={inquiry.id} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <PaginationControls
        basePath="/owner/messages"
        page={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={total}
        startItem={pagination.startItem}
        endItem={pagination.endItem}
        label="conversations"
      />
    </div>
  )
}
