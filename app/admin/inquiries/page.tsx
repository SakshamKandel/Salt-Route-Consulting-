import { prisma } from "@/lib/db"
import { InquiriesTable } from "./InquiriesTable"
import Link from "next/link"
import { InquiryStatus } from "@prisma/client"
import { isInquiryUnreadForAdmin } from "@/lib/inquiries"
import { parseAdminQuery, buildPagination, buildDateFilter } from "@/lib/admin/query"
import { Download } from "lucide-react"

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const query = parseAdminQuery(params)

  const statusParam = typeof params.status === "string" ? params.status : "NEW"
  const validStatuses = Object.values(InquiryStatus) as string[]
  const statusFilter = statusParam === "ALL" || !validStatuses.includes(statusParam) ? "ALL" : statusParam

  const where = {
    ...(statusFilter !== "ALL" ? { status: statusFilter as InquiryStatus } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" as const } },
            { email: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...buildDateFilter(query.dateFrom, query.dateTo),
  }

  const total = await prisma.inquiry.count({ where })
  const pagination = buildPagination(query, total)

  const inquiries = await prisma.inquiry.findMany({
    where,
    orderBy: { [query.sort === "lastMessageAt" ? "lastMessageAt" : "createdAt"]: query.order },
    skip: pagination.skip,
    take: pagination.take,
  })

  const unreadCount = inquiries.filter(isInquiryUnreadForAdmin).length

  const tabs = [
    { label: "New",         value: "NEW"         },
    { label: "In Progress", value: "IN_PROGRESS"  },
    { label: "Responded",   value: "RESPONDED"    },
    { label: "Closed",      value: "CLOSED"       },
    { label: "All",         value: "ALL"          },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Inquiries
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage messages and inquiries from guests.</p>
        </div>
        <Link
          href={`/api/admin/export/inquiries?status=${statusFilter}`}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
        >
          <Download className="h-3.5 w-3.5 text-slate-400" /> Export
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide -mb-px">
          {tabs.map((tab) => {
            const active = statusFilter === tab.value
            return (
              <Link
                key={tab.value}
                href={`/admin/inquiries?status=${tab.value}`}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
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

      <InquiriesTable
        inquiries={inquiries}
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
