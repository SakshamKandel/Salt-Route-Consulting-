import { prisma } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
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

  // We need a client component for the table or just render it server side.
  // Since we want actions, we should render a simple table here.
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display text-navy">Invitations</h2>
          <p className="text-slate-500">Manage invites for new owners and admins.</p>
        </div>
        <Button asChild className="bg-navy text-cream">
          <Link href="/admin/invitations/new">
            <Plus className="w-4 h-4 mr-2" /> Send Invite
          </Link>
        </Button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 border-b">
            <tr>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Sent At</th>
              <th className="p-4">Expires</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invitations.map(inv => {
              const isExpired = new Date() > new Date(inv.expiresAt)
              const status = inv.status === "ACCEPTED" ? "ACCEPTED" : isExpired && inv.status === "PENDING" ? "EXPIRED" : inv.status
              return (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium">{inv.email}</td>
                  <td className="p-4"><Badge>{inv.role}</Badge></td>
                  <td className="p-4">
                    <Badge variant={status === "ACCEPTED" ? "default" : status === "EXPIRED" ? "destructive" : "secondary"}>
                      {status}
                    </Badge>
                  </td>
                  <td className="p-4 text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-slate-500">{new Date(inv.expiresAt).toLocaleDateString()}</td>
                </tr>
              )
            })}
            {invitations.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No invitations found.</td>
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
