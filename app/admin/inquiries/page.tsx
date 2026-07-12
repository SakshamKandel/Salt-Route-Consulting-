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
    select: {
      id: true, name: true, email: true, message: true, status: true,
      createdAt: true, lastMessageAt: true, lastMessageBy: true, adminLastReadAt: true,
    },
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Guest Relations</p>
          <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide flex items-center gap-3">
            Inquiries
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full text-[9px] font-semibold border uppercase tracking-[0.15em] px-2.5 py-1 bg-amber-50 text-amber-600 border-amber-200/60">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-[13px] text-[#1B3A5C]/45 mt-1">Manage messages and inquiries from guests.</p>
        </div>
        <Link
          href={`/api/admin/export/inquiries?status=${statusFilter}`}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[#1B3A5C]/15 bg-[#FFFAF3] text-[12px] font-medium text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 transition-colors shrink-0"
        >
          <Download className="h-3.5 w-3.5 text-[#1B3A5C]/35" /> Export
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#1B3A5C]/10">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide -mb-px">
          {tabs.map((tab) => {
            const active = statusFilter === tab.value
            return (
              <Link
                key={tab.value}
                href={`/admin/inquiries?status=${tab.value}`}
                className={`flex items-center gap-2 px-4 py-2.5 text-[12px] font-medium border-b-2 whitespace-nowrap transition-colors ${
                  active
                    ? "border-[#C9A96E] text-[#1B3A5C]"
                    : "border-transparent text-[#1B3A5C]/40 hover:text-[#1B3A5C]/70 hover:border-[#1B3A5C]/15"
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
