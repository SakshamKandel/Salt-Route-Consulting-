import { prisma } from "@/lib/db"
import { BookingsTable } from "./BookingsTable"
import { BookingGanttChart } from "./BookingGanttChart"
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

  const [total, counts, ganttBookings] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.booking.findMany({
      where,
      orderBy: [{ checkIn: "asc" }, { createdAt: "desc" }],
      take: 80,
      select: {
        id: true, bookingCode: true, checkIn: true, checkOut: true,
        status: true, units: true, guests: true,
        guest: { select: { name: true } },
        property: { select: { title: true } },
        roomType: { select: { name: true, classType: true } },
      },
    }),
  ])

  const pagination = buildPagination(query, total)

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { [query.sort === "createdAt" || query.sort === "checkIn" || query.sort === "totalPrice" ? query.sort : "createdAt"]: query.order },
    skip: pagination.skip,
    take: pagination.take,
    select: {
      id: true, bookingCode: true, checkIn: true, checkOut: true,
      totalPrice: true, status: true, createdAt: true,
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Reservations</p>
          <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Bookings</h1>
          <p className="text-[13px] text-[#1B3A5C]/45 mt-1">Manage all reservation requests across your properties.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/api/admin/export/bookings?status=${statusFilter}`}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[#1B3A5C]/15 bg-[#FFFAF3] text-[12px] font-medium text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-[#1B3A5C]/35" /> Export
          </Link>
          <Link
            href="/admin/bookings/new"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#1B3A5C] text-[#FFFAF3] text-[12px] font-medium hover:bg-[#2A4F7A] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> New Booking
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#1B3A5C]/10">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide -mb-px">
          {tabs.map((tab) => {
            const count = tab.value === "ALL" ? totalAll : (countMap[tab.value] ?? 0)
            const active = statusFilter === tab.value
            return (
              <Link
                key={tab.value}
                href={`/admin/bookings?status=${tab.value}`}
                className={`flex items-center gap-2 px-4 py-2.5 text-[12px] font-medium border-b-2 whitespace-nowrap transition-colors ${
                  active
                    ? "border-[#C9A96E] text-[#1B3A5C]"
                    : "border-transparent text-[#1B3A5C]/40 hover:text-[#1B3A5C]/70 hover:border-[#1B3A5C]/15"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-semibold tabular-nums ${
                    active ? "bg-[#C9A96E]/15 text-[#1B3A5C]" : "bg-[#1B3A5C]/5 text-[#1B3A5C]/40"
                  }`}>
                    {count}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      <BookingGanttChart bookings={serializeForClient(ganttBookings)} />

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
