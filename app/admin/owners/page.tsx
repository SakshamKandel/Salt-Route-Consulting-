import { prisma } from "@/lib/db"
import { UsersTable } from "../users/UsersTable"
import Link from "next/link"
import { Plus, Mail } from "lucide-react"
import { parseAdminQuery, buildPagination, buildDateFilter } from "@/lib/admin/query"
import { auth } from "@/auth"

export default async function AdminOwnersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await auth()
  const params = await searchParams
  const query = parseAdminQuery(params)

  const where = {
    role: "OWNER" as const,
    ...(query.search
      ? {
          OR: [
            { email: { contains: query.search, mode: "insensitive" as const } },
            { name: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...buildDateFilter(query.dateFrom, query.dateTo),
  }

  const total = await prisma.user.count({ where })
  const pagination = buildPagination(query, total)

  const owners = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: pagination.skip,
    take: pagination.take,
    select: {
      id: true, name: true, email: true, role: true,
      status: true, image: true, createdAt: true,
    },
  })

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Owners</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage property owners and their accounts.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/invitations/new"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Mail className="h-3.5 w-3.5 text-slate-400" /> Invite
          </Link>
          <Link
            href="/admin/users/new?role=OWNER"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#1B3A5C] text-white text-sm font-medium hover:bg-[#1B3A5C]/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add Owner
          </Link>
        </div>
      </div>

      <UsersTable
        users={owners}
        currentUser={session?.user}
        total={total}
        page={pagination.currentPage}
        pageSize={pagination.pageSize}
        sort={query.sort}
        order={query.order}
        searchValue={query.search}
      />
    </div>
  )
}
