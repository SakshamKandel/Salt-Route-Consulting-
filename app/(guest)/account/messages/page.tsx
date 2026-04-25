import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { MessageSquare, Send, User, ShieldCheck } from "lucide-react"
import { SendMessageForm } from "./SendMessageForm"
import { GuestReplyForm } from "./GuestReplyForm"
import { isInquiryUnreadForGuest, normalizeInquiryMessages } from "@/lib/inquiries"
import { getPagination, parsePage } from "@/lib/pagination"
import { PaginationControls } from "@/components/shared/pagination-controls"

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
      messages: { orderBy: { createdAt: "asc" } },
    },
  })

  return (
    <div className="space-y-12">
      {/* ─── PAGE HEADER ─── */}
      <div className="flex items-center gap-4">
        <div className="w-8 h-[1px] bg-charcoal/20" />
        <h1 className="text-[11px] uppercase tracking-[0.3em] text-charcoal/50 font-medium">
          Messages & Inquiries
        </h1>
      </div>

      {/* ─── COMPOSE NEW MESSAGE ─── */}
      <div className="bg-white border border-charcoal/5 p-8 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-full bg-charcoal/[0.03] flex items-center justify-center border border-charcoal/5">
            <Send className="w-3.5 h-3.5 text-charcoal/30" strokeWidth={1.5} />
          </div>
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-charcoal/50 font-medium">New Message</h2>
        </div>
        <SendMessageForm userEmail={session.user.email!} userName={session.user.name || "Guest"} />
      </div>

      {/* ─── CONVERSATION HISTORY ─── */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-charcoal/[0.03] flex items-center justify-center border border-charcoal/5">
            <MessageSquare className="w-3.5 h-3.5 text-charcoal/30" strokeWidth={1.5} />
          </div>
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-charcoal/50 font-medium">Conversations</h2>
        </div>

        {inquiries.length === 0 ? (
          <div className="text-center py-20 bg-white border border-charcoal/5">
            <MessageSquare className="w-8 h-8 text-charcoal/15 mx-auto mb-6" strokeWidth={1} />
            <p className="text-charcoal/40 text-sm font-sans">No messages yet. Start a conversation above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inq) => {
              const messages = normalizeInquiryMessages(inq)
              const unread = isInquiryUnreadForGuest(inq)
              return (
                <div
                  key={inq.id}
                  className={`bg-white border p-6 md:p-8 space-y-6 transition-colors duration-300 ${
                    unread ? "border-charcoal/15" : "border-charcoal/5"
                  }`}
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pb-5 border-b border-charcoal/5">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-display text-base text-charcoal tracking-wide">{inq.subject}</h3>
                        {unread && (
                          <span className="w-2 h-2 rounded-full bg-charcoal" />
                        )}
                      </div>
                      <p className="text-[8px] uppercase tracking-[0.2em] text-charcoal/25">
                        {new Date(inq.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <span className={`text-[8px] uppercase tracking-[0.2em] px-3 py-1.5 border shrink-0 ${
                      inq.status === "RESPONDED" ? "border-charcoal/15 text-charcoal/50" :
                      inq.status === "CLOSED" ? "border-charcoal/10 text-charcoal/25" :
                      inq.status === "IN_PROGRESS" ? "border-gold/25 text-gold-dark" :
                      "border-charcoal/10 text-charcoal/40"
                    }`}>
                      {inq.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Thread */}
                  <div className="space-y-5">
                    {messages.map((reply) => (
                      <div key={reply.id} className="flex gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                          reply.sender === "ADMIN"
                            ? "bg-charcoal/[0.03] border-charcoal/10"
                            : "bg-transparent border-charcoal/5"
                        }`}>
                          {reply.sender === "ADMIN"
                            ? <ShieldCheck className="w-3 h-3 text-charcoal/40" strokeWidth={1.5} />
                            : <User className="w-3 h-3 text-charcoal/25" strokeWidth={1.5} />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[9px] uppercase tracking-[0.2em] font-medium mb-1.5 ${
                            reply.sender === "ADMIN" ? "text-charcoal/60" : "text-charcoal/30"
                          }`}>
                            {reply.sender === "ADMIN" ? "Salt Route Team" : "You"}
                          </p>
                          <p className="text-charcoal/65 text-sm leading-relaxed font-sans">{reply.body}</p>
                          <p className="text-[8px] text-charcoal/15 uppercase tracking-[0.15em] mt-2">
                            {new Date(reply.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Form */}
                  {inq.status !== "CLOSED" && (
                    <div className="pt-4 border-t border-charcoal/5">
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
