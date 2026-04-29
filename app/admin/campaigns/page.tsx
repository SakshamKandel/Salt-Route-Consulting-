import { prisma } from "@/lib/db"
import Link from "next/link"
import { Plus, Send, Pause, CheckCircle, Clock, AlertCircle, ExternalLink } from "lucide-react"
import { parseAdminQuery, buildPagination } from "@/lib/admin/query"
import type { CampaignStatus } from "@prisma/client"

const STATUS_CONFIG: Record<CampaignStatus, { label: string; className: string; icon: React.ReactNode }> = {
  DRAFT:     { label: "Draft",     className: "bg-slate-100 text-slate-600",   icon: <Clock className="h-3 w-3" /> },
  QUEUED:    { label: "Queued",    className: "bg-sky-100 text-sky-700",        icon: <Clock className="h-3 w-3" /> },
  SENDING:   { label: "Sending",   className: "bg-emerald-100 text-emerald-700", icon: <Send className="h-3 w-3" /> },
  PAUSED:    { label: "Paused",    className: "bg-amber-100 text-amber-700",   icon: <Pause className="h-3 w-3" /> },
  COMPLETED: { label: "Completed", className: "bg-emerald-100 text-emerald-700", icon: <CheckCircle className="h-3 w-3" /> },
  FAILED:    { label: "Failed",    className: "bg-red-100 text-red-600",       icon: <AlertCircle className="h-3 w-3" /> },
}

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const query = parseAdminQuery(params)
  const total = await prisma.campaign.count()
  const pagination = buildPagination(query, total)

  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    skip: pagination.skip,
    take: pagination.take,
    include: { createdBy: { select: { name: true } } },
  })

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Campaigns</h1>
          <p className="text-sm text-slate-500 mt-0.5">Send bulk emails to specific user segments.</p>
        </div>
        <Link
          href="/admin/campaigns/new"
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#1B3A5C] text-white text-sm font-medium hover:bg-[#1B3A5C]/90 transition-colors shrink-0"
        >
          <Plus className="h-3.5 w-3.5" /> New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-16 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-slate-800 font-semibold">No campaigns yet</p>
          <p className="text-sm text-slate-500 mt-1 mb-6">Create your first campaign to send emails to your users.</p>
          <Link
            href="/admin/campaigns/new"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#1B3A5C] text-white text-sm font-medium hover:bg-[#1B3A5C]/90 transition-colors"
          >
            Create Campaign
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-xs font-semibold text-slate-500 px-5 py-3">Campaign</th>
                <th className="text-xs font-semibold text-slate-500 px-5 py-3">Status</th>
                <th className="text-xs font-semibold text-slate-500 px-5 py-3">Progress</th>
                <th className="text-xs font-semibold text-slate-500 px-5 py-3">Created by</th>
                <th className="text-xs font-semibold text-slate-500 px-5 py-3">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((c) => {
                const s = STATUS_CONFIG[c.status]
                const pct = c.totalCount > 0 ? Math.round((c.sentCount / c.totalCount) * 100) : 0
                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-800">{c.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[220px]">{c.subject}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${s.className}`}>
                        {s.icon} {s.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1B3A5C] rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600 font-medium">{c.sentCount}/{c.totalCount}</span>
                        {c.failedCount > 0 && (
                          <span className="text-xs text-red-500">({c.failedCount} failed)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">{c.createdBy.name || "Admin"}</td>
                    <td className="px-5 py-4 text-sm text-slate-400">{c.createdAt.toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/campaigns/${c.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
