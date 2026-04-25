"use client"
import { DataTable, Column } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BOOKING_STATUS_LABELS } from "@/lib/booking-lifecycle"
import { formatNpr } from "@/lib/currency"

type BookingTableRow = {
  id: string
  bookingCode: string
  checkIn: Date | string
  checkOut: Date | string
  totalPrice: number
  status: string
  guest: { name: string | null; email: string | null } | null
  property: { title: string } | null
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CHECKED_IN: "bg-sky-100 text-sky-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-orange-100 text-orange-800",
}

export function BookingsTable({ bookings }: { bookings: BookingTableRow[] }) {
  const columns: Column<BookingTableRow>[] = [
    {
      header: "Ref Code",
      cell: (row) => <span className="font-mono text-sm">{row.bookingCode}</span>
    },
    {
      header: "Guest",
      cell: (row) => (
        <div>
          <p className="font-medium text-sm">{row.guest?.name || "—"}</p>
          <p className="text-xs text-slate-400">{row.guest?.email}</p>
        </div>
      )
    },
    {
      header: "Property",
      cell: (row) => <span className="font-medium">{row.property?.title}</span>
    },
    {
      header: "Dates",
      cell: (row) => (
        <span className="text-sm">
          {new Date(row.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – {new Date(row.checkOut).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
      )
    },
    {
      header: "Total",
      cell: (row) => <span className="font-semibold">{formatNpr(row.totalPrice)}</span>
    },
    {
      header: "Status",
      cell: (row) => (
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_STYLES[row.status] || "bg-gray-100 text-gray-600"}`}>
          {BOOKING_STATUS_LABELS[row.status as keyof typeof BOOKING_STATUS_LABELS] ?? row.status.replace("_", " ")}
        </span>
      )
    },
    {
      header: "Actions",
      cell: (row) => (
        <Button asChild variant="ghost" size="sm">
          <Link href={`/admin/bookings/${row.id}`}>Manage →</Link>
        </Button>
      )
    }
  ]

  // Using bookingCode for search functionality
  return <DataTable data={bookings} columns={columns} searchKey="bookingCode" searchPlaceholder="Search by reference code..." />
}
