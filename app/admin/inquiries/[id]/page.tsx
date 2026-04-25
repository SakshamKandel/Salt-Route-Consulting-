import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Phone, MessageSquare, Clock } from "lucide-react"
import { InquiryReplyForm } from "./InquiryReplyForm"
import { markInquiryReadAction } from "./actions"
import { normalizeInquiryMessages } from "@/lib/inquiries"

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

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/inquiries"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-display text-navy">{inquiry.subject}</h2>
              <Badge variant={inquiry.status === "NEW" ? "destructive" : inquiry.status === "CLOSED" ? "default" : "secondary"}>
                {inquiry.status}
              </Badge>
            </div>
            <p className="text-slate-500 text-sm">Received {inquiry.createdAt.toLocaleString()}</p>
          </div>
        </div>
        <form action={async () => {
          "use server"
          await markInquiryReadAction(inquiry.id)
        }}>
          <Button type="submit" variant="outline" size="sm">Mark read</Button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ─── CONVERSATION THREAD ─── */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-6">
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold flex items-center gap-2">
              <MessageSquare className="w-3 h-3" /> Conversation History
            </h3>

            {messages.map((reply) => (
              <div 
                key={reply.id} 
                className={`p-6 rounded-xl border shadow-sm ${
                  reply.sender === "ADMIN" 
                    ? "bg-slate-50 border-slate-200 ml-8 border-l-4 border-l-gold" 
                    : "bg-white border-slate-200 border-l-4 border-l-blue-400"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] uppercase tracking-widest font-bold ${
                    reply.sender === "ADMIN" ? "text-gold" : "text-blue-500"
                  }`}>
                    {reply.sender === "ADMIN" ? "Salt Route Team" : reply.sender === "OWNER" ? "Property Owner" : inquiry.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(reply.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{reply.body}</p>
              </div>
            ))}
          </div>

          {/* Reply Form */}
          <div className="bg-white border rounded-xl p-8 shadow-sm">
            <InquiryReplyForm inquiry={{ id: inquiry.id, status: inquiry.status }} />
          </div>
        </div>

        {/* ─── SENDER INFO SIDEBAR ─── */}
        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6 sticky top-24">
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold flex items-center gap-2">
              <User className="w-3 h-3" /> Sender Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Name</p>
                <p className="font-medium text-navy">{inquiry.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Email</p>
                <a href={`mailto:${inquiry.email}`} className="text-blue-600 hover:underline text-sm break-all">{inquiry.email}</a>
              </div>
              {inquiry.phone && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                  <a href={`tel:${inquiry.phone}`} className="text-blue-600 hover:underline text-sm flex items-center gap-2">
                    <Phone className="w-3 h-3" /> {inquiry.phone}
                  </a>
                </div>
              )}
            </div>

            <div className="pt-6 border-t">
               <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-4">Quick Stats</p>
               <div className="flex items-center gap-2 text-xs text-slate-600">
                 <Clock className="w-3 h-3" /> 
                 <span>Last activity: {new Date(inquiry.lastMessageAt).toLocaleString()}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
