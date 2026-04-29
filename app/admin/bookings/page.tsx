import { prisma } from "@/lib/db"
import { BookingsTable } from "./BookingsTable"
import Link from "next/link"
import { Plus, Download } from "lucide-react"
import { BookingStatus } from "@prisma/client"
import { serializeForClient } from "@/lib/serialize"
import { parseAdminQuery, buildPagination, buildDateFilter } from "@/lib/admin/query"

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const query = parseAdminQuery(params)

  const statusParam = typeof params.status === "string" ? params.status : "PENDING"
  const validStatuses = Object.values(BookingStatus) as string[]
  const statusFilter = statusParam === "ALL" || !validStatuses.includes(statusParam) ? "ALL" : statusParam

  const searchWhere = query.search
    ? { bookingCode: { contains: query.search, mode: "insensitive" as const } }
    : {}

  const where = {
    ...(statusFilter !== "ALL" ? { status: statusFilter as BookingStatus } : {}),
    ...searchWhere,
    ...buildDateFilter(query.dateFrom, query.dateTo, "createdAt"),
  }

  const [total, counts] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.groupBy({ by: ["status"], _count: { _all: true } }),
  ])

  const pagination = buildPagination(query, total)

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { [query.sort === "createdAt" || query.sort === "checkIn" || query.sort === "totalPrice" ? query.sort : "createdAt"]: query.order },
    skip: pagination.skip,
    take: pagination.take,
    include: {
      guest: { select: { name: true, email: true } },
      property: { select: { title: true } },
    },
  })

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count._all]))
  const totalAll = Object.values(countMap).reduce((a, b) => a + b, 0)

  const tabs = [
    { label: "Pending",    value: "PENDING"    },
    { label: "Confirmed",  value: "CONFIRMED"  },
    { label: "Checked In", value: "CHECKED_IN" },
    { label: "Completed",  value: "COMPLETED"  },
    { label: "No Show",    value: "NO_SHOW"    },
    { label: "Cancelled",  value: "CANCELLED"  },
    { label: "All",        value: "ALL"        },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Bookings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage all reservation requests across your properties.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/api/admin/export/bookings?status=${statusFilter}`}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" /> Export
          </Link>
          <Link
            href="/admin/bookings/new"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#1B3A5C] text-white text-sm font-medium hover:bg-[#1B3A5C]/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> New Booking
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide -mb-px">
          {tabs.map((tab) => {
            const count = tab.value === "ALL" ? totalAll : (countMap[tab.value] ?? 0)
            const active = statusFilter === tab.value
            return (
              <Link
                key={tab.value}
                href={`/admin/bookings?status=${tab.value}`}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  active
                    ? "border-[#1B3A5C] text-[#1B3A5C]"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`text-xs rounded-full px-1.5 py-0.5 font-medium ${
                    active ? "bg-[#1B3A5C]/10 text-[#1B3A5C]" : "bg-slate-100 text-slate-500"
                  }`}>
                    {count}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      <BookingsTable
        bookings={serializeForClient(bookings)}
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
