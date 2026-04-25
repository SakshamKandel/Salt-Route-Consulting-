import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { ShieldCheck, User, MessageSquare } from "lucide-react"
import { OwnerReplyForm } from "@/components/owner/OwnerReplyForm"
import { isInquiryUnreadForOwner, normalizeInquiryMessages } from "@/lib/inquiries"
import { getPagination, parsePage } from "@/lib/pagination"
import { PaginationControls } from "@/components/shared/pagination-controls"

const statusConfig: Record<string, { label: string; color: string; border: string }> = {
  NEW:         { label: "New",         color: "rgba(197,168,128,0.9)", border: "rgba(197,168,128,0.25)" },
  OPEN:        { label: "Open",        color: "rgba(96,165,250,0.8)",  border: "rgba(96,165,250,0.2)"  },
  IN_PROGRESS: { label: "In Progress", color: "rgba(251,191,36,0.8)",  border: "rgba(251,191,36,0.2)"  },
  RESPONDED:   { label: "Responded",   color: "rgba(52,211,153,0.8)",  border: "rgba(52,211,153,0.2)"  },
  CLOSED:      { label: "Closed",      color: "rgba(247,245,240,0.3)", border: "rgba(247,245,240,0.08)" },
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
    <div className="space-y-14">

      {/* ─── PAGE HEADER ─── */}
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <span className="w-8 h-px bg-gold/40" />
          <p className="text-[9px] uppercase tracking-[0.45em] text-gold/60 font-medium">
            Owner Support
          </p>
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-sand/85 tracking-wide">
          Salt Route Support
        </h1>
        <p className="text-[12.5px] text-sand/35 font-light max-w-lg leading-[1.8]">
          Your direct channel for property edits, guest operations, calendar questions, listing care, and owner support.
        </p>
      </div>

      {inquiries.length === 0 ? (
        <div
          className="py-24 flex flex-col items-center justify-center text-center"
          style={{ border: "1px solid rgba(197,168,128,0.07)" }}
        >
          <MessageSquare
            className="mb-6 h-8 w-8 stroke-[1.2]"
            style={{ color: "rgba(197,168,128,0.25)" }}
          />
          <p className="text-[10px] uppercase tracking-[0.4em] text-sand/25 font-medium">
            No communications yet
          </p>
          <p className="text-[11px] text-sand/18 font-light mt-2">
            Your messages with the Salt Route team will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {inquiries.map((inquiry) => {
            const messages = normalizeInquiryMessages(inquiry)
            const unread = isInquiryUnreadForOwner(inquiry)
            const statusStyle = statusConfig[inquiry.status] ?? statusConfig.CLOSED

            return (
              <div
                key={inquiry.id}
                className="space-y-0 overflow-hidden transition-all duration-500"
                style={{
                  border: unread
                    ? "1px solid rgba(197,168,128,0.25)"
                    : "1px solid rgba(197,168,128,0.08)",
                  background: unread
                    ? "rgba(197,168,128,0.04)"
                    : "rgba(197,168,128,0.015)",
                }}
              >
                {/* Thread header */}
                <div
                  className="px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  style={{ borderBottom: "1px solid rgba(197,168,128,0.07)" }}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      {unread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                      )}
                      <p className="font-display text-lg text-sand/80 tracking-wide">
                        {inquiry.subject}
                      </p>
                    </div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-sand/30 font-light">
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
                  <span
                    className="self-start sm:self-auto px-4 py-2 text-[8.5px] uppercase tracking-[0.3em] font-medium shrink-0"
                    style={{
                      color: statusStyle.color,
                      border: `1px solid ${statusStyle.border}`,
                    }}
                  >
                    {statusStyle.label}
                  </span>
                </div>

                {/* Messages */}
                <div className="px-8 py-6 space-y-7">
                  {messages.map((msg) => {
                    const isAdmin = msg.sender === "ADMIN"
                    return (
                      <div key={msg.id} className="flex gap-4 items-start">
                        <div
                          className="w-8 h-8 flex items-center justify-center shrink-0 mt-0.5"
                          style={{
                            background: isAdmin ? "rgba(197,168,128,0.1)" : "rgba(247,245,240,0.05)",
                            border: isAdmin ? "1px solid rgba(197,168,128,0.2)" : "1px solid rgba(247,245,240,0.08)",
                          }}
                        >
                          {isAdmin ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-gold/70" strokeWidth={1.3} />
                          ) : (
                            <User className="w-3.5 h-3.5 text-sand/35" strokeWidth={1.3} />
                          )}
                        </div>
                        <div className="space-y-2 flex-1 min-w-0">
                          <p
                            className="text-[9px] uppercase tracking-[0.35em] font-medium"
                            style={{ color: isAdmin ? "rgba(197,168,128,0.8)" : "rgba(247,245,240,0.35)" }}
                          >
                            {isAdmin ? "Salt Route Team" : "You"}
                          </p>
                          <p className="text-[13px] text-sand/60 leading-[1.9] font-light whitespace-pre-wrap">
                            {msg.body}
                          </p>
                          <p className="text-[8.5px] uppercase tracking-[0.25em] text-sand/20">
                            {new Date(msg.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Reply form */}
                {inquiry.status !== "CLOSED" && (
                  <div className="px-8 pb-8">
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
