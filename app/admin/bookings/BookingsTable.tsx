"use client"
import { DataTable, Column } from "@/components/admin/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type BookingTableRow = {
  id: string
  bookingCode: string
  checkIn: Date | string
  checkOut: Date | string
  totalPrice: { toString(): string }
  status: string
  guest: { name: string | null; email: string | null } | null
  property: { title: string } | null
}

export function BookingsTable({ bookings }: { bookings: BookingTableRow[] }) {
  const columns: Column<BookingTableRow>[] = [
    {
      header: "Ref Code",
      cell: (row) => <span className="font-mono text-sm">{row.bookingCode}</span>
    },
    {
      header: "Guest",
      cell: (row) => <span>{row.guest?.name || row.guest?.email}</span>
    },
    {
      header: "Property",
      cell: (row) => <span className="font-medium">{row.property?.title}</span>
    },
    {
      header: "Dates",
      cell: (row) => (
        <span className="text-sm">
          {new Date(row.checkIn).toLocaleDateString()} - {new Date(row.checkOut).toLocaleDateString()}
        </span>
      )
    },
    {
      header: "Total",
      cell: (row) => <span>${row.totalPrice.toString()}</span>
    },
    {
      header: "Status",
      cell: (row) => (
        <Badge variant={row.status === "CONFIRMED" ? "default" : row.status === "PENDING" ? "secondary" : "outline"}>
          {row.status}
        </Badge>
      )
    },
    {
      header: "Actions",
      cell: (row) => (
        <Button asChild variant="ghost" size="sm">
          <Link href={`/admin/bookings/${row.id}`}>Review</Link>
        </Button>
      )
    }
  ]

  // Using bookingCode for search functionality
  return <DataTable data={bookings} columns={columns} searchKey="bookingCode" searchPlaceholder="Search by reference code..." />
}
