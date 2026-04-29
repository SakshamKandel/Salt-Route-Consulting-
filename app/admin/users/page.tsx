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
  const session = await auth()
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

  const total = await prisma.user.count({ where })
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Users</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage all accounts registered on the platform.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/api/admin/export/users?role=${roleFilter}&q=${query.search}`}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" /> Export
          </Link>
          <Link
            href={`/admin/users/new${roleFilter !== "ALL" ? `?role=${roleFilter}` : ""}`}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#1B3A5C] text-white text-sm font-medium hover:bg-[#1B3A5C]/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add User
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide -mb-px">
          {tabs.map((tab) => {
            const active = roleFilter === tab.value
            return (
              <Link
                key={tab.value}
                href={`/admin/users?role=${tab.value}`}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  active
                    ? "border-[#1B3A5C] text-[#1B3A5C]"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
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
