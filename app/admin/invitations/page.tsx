import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { getPagination, parsePage } from "@/lib/pagination"
import { PaginationControls } from "@/components/shared/pagination-controls"

export default async function AdminInvitationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const requestedPage = parsePage(params.page)
  const total = await prisma.invitation.count()
  const pagination = getPagination(requestedPage, total)

  const invitations = await prisma.invitation.findMany({
    orderBy: { createdAt: "desc" },
    skip: pagination.skip,
    take: pagination.take,
  })

  return (
    <div className="space-y-6">
      
      {/* ━━━ HEADER ━━━ */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Access</p>
          <h2 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Invitations</h2>
          <p className="text-[12px] text-[#1B3A5C]/45 mt-1">Manage invites for new owners and admins.</p>
        </div>
        <div className="flex gap-2.5 shrink-0">
          <Button asChild className="bg-[#1B3A5C] hover:bg-[#2A4F7A] text-[#FFFAF3] text-[12px] font-medium rounded-lg h-9 px-4">
            <Link href="/admin/invitations/new">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Send Invite
            </Link>
          </Button>
        </div>
      </div>

      {/* ━━━ TABLE ━━━ */}
      <div className="rounded-2xl border border-[#1B3A5C]/8 bg-[#FFFAF3] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1B3A5C]/8">
                <th className="text-[10px] uppercase font-medium tracking-[0.15em] text-[#1B3A5C]/35 px-5 py-4">Email</th>
                <th className="text-[10px] uppercase font-medium tracking-[0.15em] text-[#1B3A5C]/35 px-5 py-4">Role</th>
                <th className="text-[10px] uppercase font-medium tracking-[0.15em] text-[#1B3A5C]/35 px-5 py-4">Status</th>
                <th className="text-[10px] uppercase font-medium tracking-[0.15em] text-[#1B3A5C]/35 px-5 py-4">Sent At</th>
                <th className="text-[10px] uppercase font-medium tracking-[0.15em] text-[#1B3A5C]/35 px-5 py-4">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B3A5C]/5">
              {invitations.map(inv => {
                const isExpired = new Date() > new Date(inv.expiresAt)
                const status = inv.status === "ACCEPTED" ? "ACCEPTED" : isExpired && inv.status === "PENDING" ? "EXPIRED" : inv.status
                
                const statusStyles: Record<string, string> = {
                  ACCEPTED: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
                  EXPIRED: "bg-rose-50 text-rose-500 border-rose-200/60",
                  PENDING: "bg-amber-50 text-amber-700 border-amber-200/60",
                }

                return (
                  <tr key={inv.id} className="hover:bg-[#FBF9F4] transition-colors">
                    <td className="px-5 py-4 font-medium text-[#1B3A5C] text-xs">{inv.email}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full text-[9px] font-semibold border uppercase tracking-[0.15em] px-2.5 py-1 bg-[#1B3A5C]/5 text-[#1B3A5C]/70 border-[#1B3A5C]/10">
                        {inv.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full text-[9px] font-semibold border uppercase tracking-[0.15em] px-2.5 py-1 ${statusStyles[status] || "bg-[#1B3A5C]/5 text-[#1B3A5C]/50 border-[#1B3A5C]/10"}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#1B3A5C]/40 text-[11px] tabular-nums">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-[#1B3A5C]/40 text-[11px] tabular-nums">{new Date(inv.expiresAt).toLocaleDateString()}</td>
                  </tr>
                )
              })}
              {invitations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <p className="text-[13px] text-[#1B3A5C]/40">No invitations found.</p>
                    <p className="text-[11px] text-[#1B3A5C]/30 mt-1">Sent invites will appear here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaginationControls
        basePath="/admin/invitations"
        page={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={total}
        startItem={pagination.startItem}
        endItem={pagination.endItem}
        label="invitations"
      />
    </div>
  )
}
