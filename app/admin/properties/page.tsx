import { prisma } from "@/lib/db"
import { PropertiesTable } from "./PropertiesTable"
import Link from "next/link"
import { Plus, Download } from "lucide-react"
import { PropertyStatus } from "@prisma/client"
import { parseAdminQuery, buildPagination, buildDateFilter } from "@/lib/admin/query"

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const query = parseAdminQuery(params)

  const statusParam = typeof params.status === "string" ? params.status : "ALL"
  const validStatuses = Object.values(PropertyStatus) as string[]
  const statusFilter = statusParam === "ALL" || !validStatuses.includes(statusParam) ? "ALL" : statusParam

  const where = {
    ...(statusFilter !== "ALL" ? { status: statusFilter as PropertyStatus } : {}),
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: "insensitive" as const } },
            { location: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...buildDateFilter(query.dateFrom, query.dateTo),
  }

  const total = await prisma.property.count({ where })
  const pagination = buildPagination(query, total)

  const properties = await prisma.property.findMany({
    where,
    orderBy: { [query.sort === "pricePerNight" || query.sort === "title" ? query.sort : "createdAt"]: query.order },
    skip: pagination.skip,
    take: pagination.take,
    select: {
      id: true, title: true, location: true,
      status: true, pricePerNight: true, createdAt: true,
    },
  })

  const rows = properties.map((p) => ({ ...p, pricePerNight: Number(p.pricePerNight) }))

  const tabs = [
    { label: "All",      value: "ALL"      },
    { label: "Active",   value: "ACTIVE"   },
    { label: "Draft",    value: "DRAFT"    },
    { label: "Archived", value: "ARCHIVED" },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Properties</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage listings, availability, and pricing.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/api/admin/export/properties?status=${statusFilter}`}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" /> Export
          </Link>
          <Link
            href="/admin/properties/new"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#1B3A5C] text-white text-sm font-medium hover:bg-[#1B3A5C]/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add Property
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide -mb-px">
          {tabs.map((tab) => {
            const active = statusFilter === tab.value
            return (
              <Link
                key={tab.value}
                href={`/admin/properties?status=${tab.value}`}
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

      <PropertiesTable
        properties={rows}
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
