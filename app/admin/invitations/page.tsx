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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display text-navy tracking-wide">Invitations</h2>
          <p className="text-navy/40 text-xs uppercase tracking-wider font-medium mt-1">
            Manage invites for new owners and admins.
          </p>
        </div>
        <div className="flex gap-2.5 shrink-0">
          <Button asChild className="bg-navy hover:bg-navy/90 text-cream text-[10px] font-semibold uppercase tracking-widest rounded-xl h-10 px-4 shadow-md shadow-navy/10">
            <Link href="/admin/invitations/new">
              <Plus className="w-4 h-4 mr-1.5" /> Send Invite
            </Link>
          </Button>
        </div>
      </div>

      {/* ━━━ TABLE ━━━ */}
      <div className="rounded-2xl border border-[#1B3A5C]/8 bg-[#FFFDF8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-navy/10 bg-navy/[0.02]">
                <th className="text-[10px] uppercase font-bold tracking-widest text-navy/60 px-5 py-4">Email</th>
                <th className="text-[10px] uppercase font-bold tracking-widest text-navy/60 px-5 py-4">Role</th>
                <th className="text-[10px] uppercase font-bold tracking-widest text-navy/60 px-5 py-4">Status</th>
                <th className="text-[10px] uppercase font-bold tracking-widest text-navy/60 px-5 py-4">Sent At</th>
                <th className="text-[10px] uppercase font-bold tracking-widest text-navy/60 px-5 py-4">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/[0.04]">
              {invitations.map(inv => {
                const isExpired = new Date() > new Date(inv.expiresAt)
                const status = inv.status === "ACCEPTED" ? "ACCEPTED" : isExpired && inv.status === "PENDING" ? "EXPIRED" : inv.status
                
                const statusStyles: Record<string, string> = {
                  ACCEPTED: "bg-emerald-50 text-emerald-600 border-emerald-200/50",
                  EXPIRED: "bg-red-50 text-red-500 border-red-200/50",
                  PENDING: "bg-amber-50 text-amber-600 border-amber-200/50",
                }

                return (
                  <tr key={inv.id} className="hover:bg-navy/[0.02] transition-colors">
                    <td className="px-5 py-4 font-medium text-navy text-xs">{inv.email}</td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-navy/5 border border-navy/10 text-navy/70 font-semibold tracking-wider">
                        {inv.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${statusStyles[status] || "bg-slate-50 text-slate-500 border-slate-200"}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-navy/40 text-[10px]">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-navy/40 text-[10px]">{new Date(inv.expiresAt).toLocaleDateString()}</td>
                  </tr>
                )
              })}
              {invitations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-xs font-light text-navy/40">No invitations found.</td>
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
