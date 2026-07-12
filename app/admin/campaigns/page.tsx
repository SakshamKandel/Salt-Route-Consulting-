import { prisma } from "@/lib/db"
import Link from "next/link"
import { Plus, Send, Pause, CheckCircle, Clock, AlertCircle, ExternalLink } from "lucide-react"
import { parseAdminQuery, buildPagination } from "@/lib/admin/query"
import type { CampaignStatus } from "@prisma/client"

const STATUS_CONFIG: Record<CampaignStatus, { label: string; className: string; icon: React.ReactNode }> = {
  DRAFT:     { label: "Draft",     className: "bg-[#1B3A5C]/5 text-[#1B3A5C]/60 border-[#1B3A5C]/10",   icon: <Clock className="h-3 w-3" /> },
  QUEUED:    { label: "Queued",    className: "bg-sky-50 text-sky-600 border-sky-200/60",        icon: <Clock className="h-3 w-3" /> },
  SENDING:   { label: "Sending",   className: "bg-emerald-50 text-emerald-600 border-emerald-200/60", icon: <Send className="h-3 w-3" /> },
  PAUSED:    { label: "Paused",    className: "bg-amber-50 text-amber-700 border-amber-200/60",   icon: <Pause className="h-3 w-3" /> },
  COMPLETED: { label: "Completed", className: "bg-emerald-50 text-emerald-600 border-emerald-200/60", icon: <CheckCircle className="h-3 w-3" /> },
  FAILED:    { label: "Failed",    className: "bg-rose-50 text-rose-500 border-rose-200/60",       icon: <AlertCircle className="h-3 w-3" /> },
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Outreach</p>
          <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Campaigns</h1>
          <p className="text-[12px] text-[#1B3A5C]/45 mt-1">Send bulk emails to specific user segments.</p>
        </div>
        <Link
          href="/admin/campaigns/new"
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#1B3A5C] text-[#FFFAF3] text-[12px] font-medium hover:bg-[#2A4F7A] transition-colors shrink-0"
        >
          <Plus className="h-3.5 w-3.5" /> New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl p-16 text-center">
          <Send className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-3" />
          <p className="text-[13px] text-[#1B3A5C]/50 font-medium">No campaigns yet</p>
          <p className="text-[11px] text-[#1B3A5C]/35 mt-1 mb-6">Create your first campaign to send emails to your users.</p>
          <Link
            href="/admin/campaigns/new"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#1B3A5C] text-[#FFFAF3] text-[12px] font-medium hover:bg-[#2A4F7A] transition-colors"
          >
            Create Campaign
          </Link>
        </div>
      ) : (
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#1B3A5C]/8">
                <th className="text-[10px] uppercase tracking-[0.15em] font-medium text-[#1B3A5C]/35 px-5 py-3">Campaign</th>
                <th className="text-[10px] uppercase tracking-[0.15em] font-medium text-[#1B3A5C]/35 px-5 py-3">Status</th>
                <th className="text-[10px] uppercase tracking-[0.15em] font-medium text-[#1B3A5C]/35 px-5 py-3">Progress</th>
                <th className="text-[10px] uppercase tracking-[0.15em] font-medium text-[#1B3A5C]/35 px-5 py-3">Created by</th>
                <th className="text-[10px] uppercase tracking-[0.15em] font-medium text-[#1B3A5C]/35 px-5 py-3">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B3A5C]/5">
              {campaigns.map((c) => {
                const s = STATUS_CONFIG[c.status]
                const pct = c.totalCount > 0 ? Math.round((c.sentCount / c.totalCount) * 100) : 0
                return (
                  <tr key={c.id} className="hover:bg-[#FBF9F4] transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-[13px] font-medium text-[#1B3A5C]">{c.name}</p>
                      <p className="text-[11px] text-[#1B3A5C]/40 mt-0.5 truncate max-w-[220px]">{c.subject}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full text-[9px] font-semibold border uppercase tracking-[0.15em] px-2.5 py-1 ${s.className}`}>
                        {s.icon} {s.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-20 h-1.5 bg-[#1B3A5C]/8 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#C9A96E] rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-[#1B3A5C]/60 font-medium tabular-nums">{c.sentCount}/{c.totalCount}</span>
                        {c.failedCount > 0 && (
                          <span className="text-[11px] text-rose-500 tabular-nums">({c.failedCount} failed)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[12px] text-[#1B3A5C]/50">{c.createdBy.name || "Admin"}</td>
                    <td className="px-5 py-4 text-[12px] text-[#1B3A5C]/40 tabular-nums">{c.createdAt.toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/campaigns/${c.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#1B3A5C]/5 text-[#1B3A5C]/30 hover:text-[#C9A96E] transition-colors"
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
