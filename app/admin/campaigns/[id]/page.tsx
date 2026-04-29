import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Send, Pause, StopCircle } from "lucide-react"
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

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: { createdBy: { select: { name: true } } },
  })

  if (!campaign) notFound()

  const totalRecipients = await prisma.campaignRecipient.count({ where: { campaignId: id } })
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

  const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    DRAFT: "outline",
    QUEUED: "secondary",
    SENDING: "default",
    PAUSED: "outline",
    COMPLETED: "default",
    FAILED: "destructive",
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/campaigns">
            <ArrowLeft className="h-4 w-4 mr-1" /> Campaigns
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-display text-navy">{campaign.name}</h2>
            <Badge variant={statusVariant[campaign.status]}>{campaign.status}</Badge>
          </div>
          <p className="text-slate-500">{campaign.subject}</p>
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
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-2xl font-display text-navy">{value}</p>
          </div>
        ))}
      </div>

      {campaign.totalCount > 0 && (
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-navy transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {/* Email preview */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">Email Preview</p>
        <p className="font-semibold text-navy mb-2">{campaign.subject}</p>
        <div className="text-sm text-slate-600 whitespace-pre-line border-t border-slate-100 pt-4">
          {campaign.body}
        </div>
      </div>

      {/* Recipients */}
      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Recipients ({totalRecipients.toLocaleString()})
        </h3>
        <div className="border border-slate-200 rounded-md bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Sent At</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recipients.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{r.email}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        r.status === "SENT"
                          ? "default"
                          : r.status === "FAILED" || r.status === "BOUNCED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {r.sentAt ? r.sentAt.toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-red-500 text-xs truncate max-w-[200px]">
                    {r.errorMsg || "—"}
                  </td>
                </tr>
              ))}
              {recipients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    No recipients yet
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
