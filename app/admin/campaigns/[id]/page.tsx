import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CampaignActions } from "./CampaignActions"
import { parseAdminQuery, buildPagination } from "@/lib/admin/query"

export default async function CampaignDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { id } = await params
  const spParams = await searchParams
  const query = parseAdminQuery(spParams)

  const [campaign, totalRecipients] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id },
      include: { createdBy: { select: { name: true } } },
    }),
    prisma.campaignRecipient.count({ where: { campaignId: id } }),
  ])

  if (!campaign) notFound()
  const pagination = buildPagination(query, totalRecipients)

  const recipients = await prisma.campaignRecipient.findMany({
    where: { campaignId: id },
    orderBy: { status: "asc" },
    skip: pagination.skip,
    take: pagination.take,
  })

  const pct =
    campaign.totalCount > 0
      ? Math.round((campaign.sentCount / campaign.totalCount) * 100)
      : 0

  const chip = "inline-flex items-center rounded-full text-[9px] font-semibold border uppercase tracking-[0.15em] px-2.5 py-1"
  const statusChip: Record<string, string> = {
    DRAFT: "bg-[#1B3A5C]/5 text-[#1B3A5C]/60 border-[#1B3A5C]/10",
    QUEUED: "bg-sky-50 text-sky-600 border-sky-200/60",
    SENDING: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
    PAUSED: "bg-amber-50 text-amber-700 border-amber-200/60",
    COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
    FAILED: "bg-rose-50 text-rose-500 border-rose-200/60",
  }
  const recipientChip = (s: string) =>
    s === "SENT" ? "bg-emerald-50 text-emerald-600 border-emerald-200/60"
    : s === "FAILED" || s === "BOUNCED" ? "bg-rose-50 text-rose-500 border-rose-200/60"
    : "bg-[#1B3A5C]/5 text-[#1B3A5C]/50 border-[#1B3A5C]/10"

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm" className="text-[#1B3A5C]/50 hover:text-[#1B3A5C] hover:bg-[#1B3A5C]/5 rounded-lg text-[12px]">
          <Link href="/admin/campaigns">
            <ArrowLeft className="h-4 w-4 mr-1" /> Campaigns
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Campaign</p>
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h2 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">{campaign.name}</h2>
            <span className={`${chip} ${statusChip[campaign.status] || statusChip.DRAFT}`}>{campaign.status}</span>
          </div>
          <p className="text-[12px] text-[#1B3A5C]/45">{campaign.subject}</p>
        </div>
        <CampaignActions campaign={{ id: campaign.id, status: campaign.status }} />
      </div>

      {/* Progress */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Recipients", value: campaign.totalCount.toLocaleString() },
          { label: "Sent", value: campaign.sentCount.toLocaleString() },
          { label: "Failed", value: campaign.failedCount.toLocaleString() },
          { label: "Progress", value: `${pct}%` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-[#1B3A5C]/8 bg-[#FFFAF3] p-4">
            <p className="text-[10px] text-[#1B3A5C]/40 uppercase tracking-[0.2em] font-medium mb-1">{label}</p>
            <p className="text-2xl font-display text-[#1B3A5C] tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {campaign.totalCount > 0 && (
        <div className="h-2 rounded-full bg-[#1B3A5C]/8 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#C9A96E] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {/* Email preview */}
      <div className="rounded-2xl border border-[#1B3A5C]/8 bg-[#FFFAF3] p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1B3A5C]/35 mb-3">Email Preview</p>
        <p className="text-[14px] font-semibold text-[#1B3A5C] mb-2">{campaign.subject}</p>
        <div className="text-[13px] text-[#1B3A5C]/60 whitespace-pre-line border-t border-[#1B3A5C]/8 pt-4">
          {campaign.body}
        </div>
      </div>

      {/* Recipients */}
      <div>
        <h3 className="text-[15px] font-semibold text-[#1B3A5C] mb-4">
          Recipients <span className="text-[#1B3A5C]/40 tabular-nums">({totalRecipients.toLocaleString()})</span>
        </h3>
        <div className="border border-[#1B3A5C]/8 rounded-2xl bg-[#FFFAF3] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="border-b border-[#1B3A5C]/8">
              <tr>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] font-medium text-[#1B3A5C]/35">Email</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] font-medium text-[#1B3A5C]/35">Status</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] font-medium text-[#1B3A5C]/35">Sent At</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] font-medium text-[#1B3A5C]/35">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B3A5C]/5">
              {recipients.map((r) => (
                <tr key={r.id} className="hover:bg-[#FBF9F4] transition-colors">
                  <td className="px-4 py-3 text-[#1B3A5C]">{r.email}</td>
                  <td className="px-4 py-3">
                    <span className={`${chip} ${recipientChip(r.status)}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-[#1B3A5C]/40 text-xs tabular-nums">
                    {r.sentAt ? r.sentAt.toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-rose-500 text-xs truncate max-w-[200px]">
                    {r.errorMsg || "—"}
                  </td>
                </tr>
              ))}
              {recipients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center">
                    <p className="text-[13px] text-[#1B3A5C]/40">No recipients yet</p>
                    <p className="text-[11px] text-[#1B3A5C]/30 mt-1">Recipients are added when the campaign is queued.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
