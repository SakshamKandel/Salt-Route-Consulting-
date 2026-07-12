import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { MessageSquare, Send, User, ShieldCheck } from "lucide-react"
import { SendMessageForm } from "./SendMessageForm"
import { GuestReplyForm } from "./GuestReplyForm"
import { isInquiryUnreadForGuest, normalizeInquiryMessages } from "@/lib/inquiries"
import { getPagination, parsePage } from "@/lib/pagination"
import { PaginationControls } from "@/components/shared/pagination-controls"

const INQUIRY_STATUS_CHIP: Record<string, string> = {
  RESPONDED:   "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  CLOSED:      "bg-[#1B3A5C]/5 text-[#1B3A5C]/55 border-[#1B3A5C]/10",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200/60",
}

export default async function GuestMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()
  if (!session?.user?.id) return redirect("/login")
  const params = await searchParams
  const requestedPage = parsePage(params.page)
  const where = { email: session.user.email! }
  const total = await prisma.inquiry.count({ where })
  const pagination = getPagination(requestedPage, total, 10)

  const inquiries = await prisma.inquiry.findMany({
    where,
    orderBy: { lastMessageAt: "desc" },
    skip: pagination.skip,
    take: pagination.take,
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, sender: true, body: true, createdAt: true },
      },
    },
  })

  return (
    <div className="space-y-10">
      {/* ─── PAGE HEADER ─── */}
      <div>
        <p className="text-[11px] font-medium text-[#C9A96E] uppercase tracking-[0.18em] mb-1.5">
          Concierge
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-[#1B3A5C] tracking-wide">
          Conversations
        </h1>
        <p className="text-[13px] text-[#1B3A5C]/60 mt-2">
          Speak with our team about any stay, request, or detail of your journey.
        </p>
      </div>

      {/* ─── COMPOSE NEW MESSAGE ─── */}
      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-7">
          <div className="w-9 h-9 rounded-full bg-[#1B3A5C]/[0.04] flex items-center justify-center border border-[#1B3A5C]/8">
            <Send className="w-3.5 h-3.5 text-[#1B3A5C]/40" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-display text-lg text-[#1B3A5C] tracking-wide">Start a conversation</h2>
            <p className="text-[13px] text-[#1B3A5C]/60 mt-0.5">Our team typically replies within a day.</p>
          </div>
        </div>
        <SendMessageForm userEmail={session.user.email!} userName={session.user.name || "Guest"} />
      </div>

      {/* ─── CONVERSATION HISTORY ─── */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1B3A5C]/[0.04] flex items-center justify-center border border-[#1B3A5C]/8">
            <MessageSquare className="w-3.5 h-3.5 text-[#1B3A5C]/40" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-lg text-[#1B3A5C] tracking-wide">Your conversations</h2>
        </div>

        {inquiries.length === 0 ? (
          <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl py-16 text-center">
            <MessageSquare className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="font-display text-lg text-[#1B3A5C] tracking-wide mb-1.5">No messages yet</h3>
            <p className="text-[13px] text-[#1B3A5C]/60">Start a conversation above and we will take it from there.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inq) => {
              const messages = normalizeInquiryMessages(inq)
              const unread = isInquiryUnreadForGuest(inq)
              return (
                <div
                  key={inq.id}
                  className={`bg-[#FFFAF3] border rounded-xl p-5 sm:p-7 space-y-6 transition-colors ${
                    unread ? "border-[#1B3A5C]/20" : "border-[#1B3A5C]/8"
                  }`}
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pb-5 border-b border-[#1B3A5C]/5">
                    <div>
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="font-display text-lg text-[#1B3A5C] tracking-wide">{inq.subject}</h3>
                        {unread && (
                          <span className="w-2 h-2 rounded-full bg-[#C9A96E]" />
                        )}
                      </div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[#1B3A5C]/55 font-medium">
                        {new Date(inq.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <span className={`inline-flex items-center rounded-full text-[11px] font-semibold border uppercase tracking-[0.15em] px-2.5 py-1 shrink-0 ${
                      INQUIRY_STATUS_CHIP[inq.status] ?? "bg-[#1B3A5C]/5 text-[#1B3A5C]/55 border-[#1B3A5C]/10"
                    }`}>
                      {inq.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Thread */}
                  <div className="space-y-5">
                    {messages.map((reply) => (
                      <div key={reply.id} className="flex gap-4">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${
                          reply.sender === "ADMIN"
                            ? "bg-[#1B3A5C]/[0.04] border-[#1B3A5C]/10"
                            : "bg-transparent border-[#1B3A5C]/8"
                        }`}>
                          {reply.sender === "ADMIN"
                            ? <ShieldCheck className="w-3.5 h-3.5 text-[#C9A96E]" strokeWidth={1.5} />
                            : <User className="w-3.5 h-3.5 text-[#1B3A5C]/30" strokeWidth={1.5} />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] uppercase tracking-[0.16em] font-medium mb-1.5 ${
                            reply.sender === "ADMIN" ? "text-[#1B3A5C]/70" : "text-[#1B3A5C]/55"
                          }`}>
                            {reply.sender === "ADMIN" ? "Salt Route Team" : "You"}
                          </p>
                          <p className="text-[15px] text-[#1B3A5C]/75 leading-relaxed">{reply.body}</p>
                          <p className="text-[13px] text-[#1B3A5C]/60 mt-2">
                            {new Date(reply.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Form */}
                  {inq.status !== "CLOSED" && (
                    <div className="pt-4 border-t border-[#1B3A5C]/5">
                      <GuestReplyForm inquiryId={inq.id} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      <PaginationControls
        basePath="/account/messages"
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
