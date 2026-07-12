import { prisma } from "@/lib/db"
import { UsersTable } from "./UsersTable"
import Link from "next/link"
import { Role } from "@prisma/client"
import { Plus, Download } from "lucide-react"
import { parseAdminQuery, buildPagination, buildDateFilter } from "@/lib/admin/query"
import { auth } from "@/auth"

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const query = parseAdminQuery(params)

  const roleParam = typeof params.role === "string" ? params.role : "ALL"
  const roleFilter = Object.values(Role).includes(roleParam as Role) ? (roleParam as Role) : "ALL"

  const where = {
    ...(roleFilter !== "ALL" ? { role: roleFilter } : {}),
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

  const users = await prisma.user.findMany({
    where,
    orderBy: { [query.sort === "createdAt" || query.sort === "name" || query.sort === "email" ? query.sort : "createdAt"]: query.order },
    skip: pagination.skip,
    take: pagination.take,
    select: {
      id: true, name: true, email: true, role: true,
      status: true, image: true, createdAt: true,
    },
  })

  const tabs = [
    { label: "All Users", value: "ALL"   },
    { label: "Guests",    value: "GUEST" },
    { label: "Owners",    value: "OWNER" },
    { label: "Admins",    value: "ADMIN" },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Directory</p>
          <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Users</h1>
          <p className="text-[12px] text-[#1B3A5C]/45 mt-1">Manage all accounts registered on the platform.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/api/admin/export/users?role=${roleFilter}&q=${query.search}`}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[#1B3A5C]/15 text-[12px] font-medium text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 transition-colors"
          >
            <Download className="h-3.5 w-3.5 opacity-60" /> Export
          </Link>
          <Link
            href={`/admin/users/new${roleFilter !== "ALL" ? `?role=${roleFilter}` : ""}`}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#1B3A5C] text-[#FFFAF3] text-[12px] font-medium hover:bg-[#2A4F7A] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add User
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#1B3A5C]/10">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide -mb-px">
          {tabs.map((tab) => {
            const active = roleFilter === tab.value
            return (
              <Link
                key={tab.value}
                href={`/admin/users?role=${tab.value}`}
                className={`px-4 py-2.5 text-[12px] font-medium border-b-2 whitespace-nowrap transition-colors ${
                  active
                    ? "border-[#C9A96E] text-[#1B3A5C]"
                    : "border-transparent text-[#1B3A5C]/40 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/20"
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>

      <UsersTable
        users={users}
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
