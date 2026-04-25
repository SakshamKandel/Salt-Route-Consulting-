import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { MessageSquare, ShieldCheck, User } from "lucide-react"
import { GuestReplyForm } from "@/app/(guest)/account/messages/GuestReplyForm"
import { isInquiryUnreadForOwner, normalizeInquiryMessages } from "@/lib/inquiries"
import { getPagination, parsePage } from "@/lib/pagination"
import { PaginationControls } from "@/components/shared/pagination-controls"

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
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  })

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center gap-4 shrink-0">
        <span className="w-8 h-[1px] bg-gold/50" />
        <h2 className="text-[11px] font-sans text-sand uppercase tracking-[0.4em]">Administrative Communications</h2>
      </div>

      {inquiries.length === 0 ? (
        <div className="py-24 text-center border border-white/[0.05] bg-white/[0.02]">
          <MessageSquare className="mx-auto mb-6 h-8 w-8 text-gold/30 stroke-[1.2]" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-sand/30 font-sans">
            No owner communications yet.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {inquiries.map((inquiry) => {
            const messages = normalizeInquiryMessages(inquiry)
            const unread = isInquiryUnreadForOwner(inquiry)

            return (
              <div
                key={inquiry.id}
                className={`border p-8 md:p-10 space-y-8 transition-colors duration-500 ${
                  unread ? "border-gold/30 bg-gold/[0.04]" : "border-white/[0.08] bg-white/[0.02]"
                }`}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 pb-6 border-b border-white/[0.05]">
                  <div>
                    <p className="text-sm font-display text-sand uppercase tracking-widest mb-2">{inquiry.subject}</p>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-sand/30 font-sans">
                      Last activity {new Date(inquiry.lastMessageAt).toLocaleString()}
                      {unread ? " - New reply" : ""}
                    </p>
                  </div>
                  <span className={`text-[8px] uppercase tracking-[0.3em] px-4 py-2 border inline-block ${
                    inquiry.status === "RESPONDED" ? "border-green-500/30 text-green-400 bg-green-500/5" :
                    inquiry.status === "CLOSED" ? "border-sand/20 text-sand/40 bg-white/5" :
                    inquiry.status === "IN_PROGRESS" ? "border-amber-500/30 text-amber-400 bg-amber-500/5" :
                    "border-blue-500/30 text-blue-400 bg-blue-500/5"
                  }`}>
                    {inquiry.status.replace("_", " ")}
                  </span>
                </div>

                <div className="space-y-8">
                  {messages.map((message) => (
                    <div key={message.id} className="flex gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        message.sender === "ADMIN" ? "bg-gold/10" : "bg-white/5"
                      }`}>
                        {message.sender === "ADMIN" ? (
                          <ShieldCheck className="w-3 h-3 text-gold" />
                        ) : (
                          <User className="w-3 h-3 text-sand/40" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className={`text-[9px] uppercase tracking-[0.3em] font-sans ${
                          message.sender === "ADMIN" ? "text-gold" : "text-sand/30"
                        }`}>
                          {message.sender === "ADMIN" ? "Salt Route Team" : "You"}
                        </p>
                        <p className="text-sand/70 text-sm leading-relaxed font-sans font-light whitespace-pre-wrap">
                          {message.body}
                        </p>
                        <p className="text-[8px] text-white/10 uppercase tracking-widest">
                          {new Date(message.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {inquiry.status !== "CLOSED" && <GuestReplyForm inquiryId={inquiry.id} />}
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
