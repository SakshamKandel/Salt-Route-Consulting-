import { prisma } from "@/lib/db"
import { UsersTable } from "../users/UsersTable"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Mail } from "lucide-react"
import { getPagination, parsePage } from "@/lib/pagination"
import { PaginationControls } from "@/components/shared/pagination-controls"

export default async function AdminOwnersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const requestedPage = parsePage(params.page)
  const where = { role: "OWNER" as const }
  const total = await prisma.user.count({ where })
  const pagination = getPagination(requestedPage, total)

  const owners = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: pagination.skip,
    take: pagination.take,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      _count: { select: { properties: true } }
    },
  })

  const ownersWithCount = owners.map(owner => ({
    ...owner,
    propertiesCount: owner._count.properties
  }))

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-display text-navy">Owners</h2>
          <p className="text-slate-500">Manage property owners and their assigned properties.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="text-navy border-navy/20">
            <Link href="/admin/invitations/new">
              <Mail className="w-4 h-4 mr-2" /> Invite by Email
            </Link>
          </Button>
          <Button asChild className="bg-navy text-cream">
            <Link href="/admin/users/new?role=OWNER">
              <Plus className="w-4 h-4 mr-2" /> Add Owner
            </Link>
          </Button>
        </div>
      </div>

      <UsersTable users={ownersWithCount} />
      <PaginationControls
        basePath="/admin/owners"
        page={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={total}
        startItem={pagination.startItem}
        endItem={pagination.endItem}
        label="owners"
      />
    </div>
  )
}
