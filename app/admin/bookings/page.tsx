import { prisma } from "@/lib/db"
import { BookingsTable } from "./BookingsTable"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { BookingStatus } from "@prisma/client"
import { serializeForClient } from "@/lib/serialize"
import { getPagination, parsePage } from "@/lib/pagination"
import { PaginationControls } from "@/components/shared/pagination-controls"

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const statusFilter = (resolvedParams.status as string) || "PENDING"
  const requestedPage = parsePage(resolvedParams.page)
  const where = {
    status: statusFilter !== "ALL" ? (statusFilter as BookingStatus) : undefined
  }

  const [total, counts] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ])
  const pagination = getPagination(requestedPage, total)

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: pagination.skip,
    take: pagination.take,
    include: {
      guest: { select: { name: true, email: true } },
      property: { select: { title: true } }
    }
  })
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count._all]))

  const tabs = [
    { label: "Pending", value: "PENDING", color: "bg-amber-500" },
    { label: "Confirmed", value: "CONFIRMED", color: "bg-green-500" },
    { label: "Checked In", value: "CHECKED_IN", color: "bg-sky-500" },
    { label: "Completed", value: "COMPLETED", color: "bg-blue-500" },
    { label: "No Show", value: "NO_SHOW", color: "bg-orange-500" },
    { label: "Cancelled", value: "CANCELLED", color: "bg-red-500" },
    { label: "All", value: "ALL", color: "bg-gray-500" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display text-navy">Bookings</h2>
          <p className="text-slate-500">Manage all reservation requests across properties.</p>
        </div>
        <Button asChild className="bg-navy text-cream">
          <Link href="/admin/bookings/new">
            <Plus className="w-4 h-4 mr-2" /> Manual Booking
          </Link>
        </Button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const count = tab.value === "ALL"
            ? Object.values(countMap).reduce((a, b) => a + b, 0)
            : (countMap[tab.value] ?? 0)
          return (
            <Button
              key={tab.value}
              asChild
              variant={statusFilter === tab.value ? "default" : "outline"}
              className={statusFilter === tab.value ? "bg-navy" : "text-navy"}
              size="sm"
            >
              <Link href={`/admin/bookings?status=${tab.value}`}>
                <span className={`w-2 h-2 rounded-full ${tab.color} mr-2`} />
                {tab.label}
                {count > 0 && <span className="ml-1.5 bg-white/20 rounded-full px-1.5 text-xs">{count}</span>}
              </Link>
            </Button>
          )
        })}
      </div>

      <BookingsTable bookings={serializeForClient(bookings)} />
      <PaginationControls
        basePath="/admin/bookings"
        page={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={total}
        startItem={pagination.startItem}
        endItem={pagination.endItem}
        params={{ status: statusFilter }}
        label="bookings"
      />
    </div>
  )
}
