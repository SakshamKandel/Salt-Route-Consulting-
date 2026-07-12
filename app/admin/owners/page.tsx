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

  const [session, total] = await Promise.all([auth(), prisma.user.count({ where })])
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Directory</p>
          <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Owners</h1>
          <p className="text-[12px] text-[#1B3A5C]/45 mt-1">Manage property owners and their accounts.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/invitations/new"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[#1B3A5C]/15 text-[12px] font-medium text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 transition-colors"
          >
            <Mail className="h-3.5 w-3.5 opacity-60" /> Invite
          </Link>
          <Link
            href="/admin/users/new?role=OWNER"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#1B3A5C] text-[#FFFAF3] text-[12px] font-medium hover:bg-[#2A4F7A] transition-colors"
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
