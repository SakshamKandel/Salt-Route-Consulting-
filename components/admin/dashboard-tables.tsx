"use client"

import { DataTable, Column } from "./data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type DashboardBookingRow = {
  id: string
  bookingCode: string
  checkIn: Date | string
  status: string
  property: { title: string }
  guest: { name: string | null; email: string | null }
}

type DashboardInquiryRow = {
  id: string
  name: string
  message: string
  status: string
  property?: { title: string } | null
}

export function DashboardBookingsTable({ bookings }: { bookings: DashboardBookingRow[] }) {
  const columns: Column<DashboardBookingRow>[] = [
    {
      header: "Code",
      cell: (row) => <span className="font-mono text-sm">{row.bookingCode}</span>
    },
    {
      header: "Property",
      cell: (row) => <span className="font-medium">{row.property.title}</span>
    },
    {
      header: "Guest",
      cell: (row) => <span>{row.guest.name || row.guest.email}</span>
    },
    {
      header: "Check-in",
      cell: (row) => <span>{new Date(row.checkIn).toLocaleDateString()}</span>
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
      header: "Action",
      cell: (row) => (
        <Button asChild variant="ghost" size="sm">
          <Link href={`/admin/bookings/${row.id}`}>View</Link>
        </Button>
      )
    }
  ]

  return <DataTable data={bookings} columns={columns} />
}

export function DashboardInquiriesTable({ inquiries }: { inquiries: DashboardInquiryRow[] }) {
  const columns: Column<DashboardInquiryRow>[] = [
    {
      header: "Name",
      accessorKey: "name"
    },
    {
      header: "Property",
      cell: (row) => <span>{row.property?.title || "General"}</span>
    },
    {
      header: "Message",
      cell: (row) => <span className="truncate max-w-[200px] inline-block">{row.message}</span>
    },
    {
      header: "Status",
      cell: (row) => (
        <Badge variant={row.status === "NEW" ? "destructive" : "secondary"}>
          {row.status}
        </Badge>
      )
    },
    {
      header: "Action",
      cell: (row) => (
        <Button asChild variant="ghost" size="sm">
          <Link href={`/admin/inquiries/${row.id}`}>View</Link>
        </Button>
      )
    }
  ]

  return <DataTable data={inquiries} columns={columns} />
}
