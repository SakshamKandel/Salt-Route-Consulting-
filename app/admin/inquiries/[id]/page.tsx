import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, User, Phone, MessageSquare, Clock, Check } from "lucide-react"
import { InquiryReplyForm } from "./InquiryReplyForm"
import { markInquiryReadAction } from "./actions"
import { normalizeInquiryMessages } from "@/lib/inquiries"

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-rose-50 text-rose-600 border-rose-200/60",
  IN_PROGRESS: "bg-amber-50 text-amber-600 border-amber-200/60",
  RESPONDED: "bg-sky-50 text-sky-600 border-sky-200/60",
  CLOSED: "bg-[#1B3A5C]/5 text-[#1B3A5C]/60 border-[#1B3A5C]/10",
}

export default async function AdminInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  })

  if (!inquiry) return notFound()

  const messages = normalizeInquiryMessages(inquiry)

  const card = "bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl"
  const microLabel = "text-[10px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.2em]"

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/inquiries"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#1B3A5C]/40 hover:text-[#1B3A5C] hover:bg-[#1B3A5C]/5 transition-colors shrink-0"
            aria-label="Back to inquiries"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Guest Relations</p>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">{inquiry.subject}</h1>
              <span className={`inline-flex rounded-full text-[9px] font-semibold border uppercase tracking-[0.15em] px-2.5 py-1 ${STATUS_STYLES[inquiry.status] || "bg-[#1B3A5C]/5 text-[#1B3A5C]/60 border-[#1B3A5C]/10"}`}>
                {inquiry.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-[13px] text-[#1B3A5C]/45 mt-1">Received {inquiry.createdAt.toLocaleString()}</p>
          </div>
        </div>
        <form action={async () => {
          "use server"
          await markInquiryReadAction(inquiry.id)
        }}>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[#1B3A5C]/15 bg-[#FFFAF3] text-[12px] font-medium text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 transition-colors"
          >
            <Check className="h-3.5 w-3.5 text-[#1B3A5C]/35" /> Mark read
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── CONVERSATION THREAD ─── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <h3 className={`${microLabel} flex items-center gap-2`}>
              <MessageSquare className="w-3 h-3 text-[#C9A96E]" /> Conversation History
            </h3>

            {messages.map((reply) => (
              <div
                key={reply.id}
                className={`p-5 rounded-2xl border ${
                  reply.sender === "ADMIN"
                    ? "bg-[#FBF9F4] border-[#1B3A5C]/8 ml-8 border-l-2 border-l-[#C9A96E]"
                    : "bg-[#FFFAF3] border-[#1B3A5C]/8 border-l-2 border-l-sky-300"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[9px] uppercase tracking-[0.2em] font-semibold ${
                    reply.sender === "ADMIN" ? "text-[#C9A96E]" : "text-sky-600"
                  }`}>
                    {reply.sender === "ADMIN" ? "Salt Route Team" : reply.sender === "OWNER" ? "Property Owner" : inquiry.name}
                  </span>
                  <span className="text-[10px] text-[#1B3A5C]/35 tabular-nums">
                    {new Date(reply.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-[13px] text-[#1B3A5C]/75 whitespace-pre-wrap leading-relaxed">{reply.body}</p>
              </div>
            ))}
          </div>

          {/* Reply Form */}
          <div className={`${card} p-6`}>
            <InquiryReplyForm inquiry={{ id: inquiry.id, status: inquiry.status }} />
          </div>
        </div>

        {/* ─── SENDER INFO SIDEBAR ─── */}
        <div className="space-y-6">
          <div className={`${card} p-5 space-y-5 sticky top-24`}>
            <h3 className={`${microLabel} flex items-center gap-2`}>
              <User className="w-3 h-3 text-[#C9A96E]" /> Sender Details
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-[#1B3A5C]/35 uppercase tracking-[0.15em] mb-1">Name</p>
                <p className="text-[13px] font-medium text-[#1B3A5C]">{inquiry.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#1B3A5C]/35 uppercase tracking-[0.15em] mb-1">Email</p>
                <a href={`mailto:${inquiry.email}`} className="text-[12px] text-[#1B3A5C]/70 hover:text-[#C9A96E] transition-colors break-all">{inquiry.email}</a>
              </div>
              {inquiry.phone && (
                <div>
                  <p className="text-[10px] text-[#1B3A5C]/35 uppercase tracking-[0.15em] mb-1">Phone</p>
                  <a href={`tel:${inquiry.phone}`} className="text-[12px] text-[#1B3A5C]/70 hover:text-[#C9A96E] transition-colors flex items-center gap-2">
                    <Phone className="w-3 h-3 text-[#1B3A5C]/30" /> {inquiry.phone}
                  </a>
                </div>
              )}
            </div>

            <div className="pt-5 border-t border-[#1B3A5C]/8">
              <p className="text-[10px] text-[#1B3A5C]/35 uppercase tracking-[0.15em] mb-3">Activity</p>
              <div className="flex items-center gap-2 text-[11px] text-[#1B3A5C]/55">
                <Clock className="w-3 h-3 text-[#1B3A5C]/30" />
                <span>Last activity: {new Date(inquiry.lastMessageAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
