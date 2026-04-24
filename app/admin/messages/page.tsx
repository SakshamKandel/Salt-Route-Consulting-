import { prisma } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { InquiryStatus } from "@prisma/client"

const STATUS_COLORS: Record<InquiryStatus, string> = {
  NEW: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  RESPONDED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-500",
}

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const status = (params.status as InquiryStatus) || undefined

  const inquiries = await prisma.inquiry.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const counts = await prisma.inquiry.groupBy({
    by: ["status"],
    _count: { _all: true },
  })

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count._all]))

  const tabs = [
    { label: "All", value: undefined },
    { label: "New", value: "NEW" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Responded", value: "RESPONDED" },
    { label: "Closed", value: "CLOSED" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display text-navy">Messages</h2>
        <p className="text-slate-500">Manage contact form inquiries from guests and prospective travelers.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => {
          const isActive = status === tab.value || (!status && tab.value === undefined)
          const href = tab.value ? `/admin/messages?status=${tab.value}` : "/admin/messages"
          const count = tab.value ? (countMap[tab.value] ?? 0) : inquiries.length
          return (
            <Button
              key={tab.label}
              asChild
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={isActive ? "bg-navy text-cream" : "text-navy border-navy/20"}
            >
              <Link href={href}>
                {tab.label} {count > 0 && <span className="ml-1.5 bg-white/20 rounded-full px-1.5 text-xs">{count}</span>}
              </Link>
            </Button>
          )
        })}
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        {inquiries.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No messages found.</div>
        ) : (
          <div className="divide-y">
            {inquiries.map((inq) => (
              <Link
                key={inq.id}
                href={`/admin/inquiries/${inq.id}`}
                className="block p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium text-navy">{inq.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[inq.status]}`}>
                        {inq.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-1">{inq.subject}</p>
                    <p className="text-xs text-slate-400 truncate">{inq.message}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-slate-400">{new Date(inq.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{inq.email}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
