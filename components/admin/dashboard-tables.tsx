"use client"

import { DataTable, Column } from "./data-table"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

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

const CHIP_BASE =
  "inline-flex rounded-full text-[9px] font-semibold border uppercase tracking-[0.15em] px-2.5 py-1"

const BOOKING_CHIPS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-200/60",
  CONFIRMED: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
  CHECKED_IN: "bg-sky-50 text-sky-600 border-sky-200/60",
  COMPLETED: "bg-[#1B3A5C]/5 text-[#1B3A5C]/60 border-[#1B3A5C]/10",
  CANCELLED: "bg-rose-50 text-rose-600 border-rose-200/60",
  NO_SHOW: "bg-orange-50 text-orange-600 border-orange-200/60",
}

const INQUIRY_CHIPS: Record<string, string> = {
  NEW: "bg-rose-50 text-rose-600 border-rose-200/60",
  IN_PROGRESS: "bg-amber-50 text-amber-600 border-amber-200/60",
  RESPONDED: "bg-sky-50 text-sky-600 border-sky-200/60",
  CLOSED: "bg-[#1B3A5C]/5 text-[#1B3A5C]/60 border-[#1B3A5C]/10",
}

const FALLBACK_CHIP = "bg-[#1B3A5C]/5 text-[#1B3A5C]/60 border-[#1B3A5C]/10"

function ViewLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1B3A5C]/45 hover:text-[#C9A96E] transition-colors"
    >
      View <ArrowUpRight className="h-3 w-3" />
    </Link>
  )
}

export function DashboardBookingsTable({ bookings }: { bookings: DashboardBookingRow[] }) {
  const columns: Column<DashboardBookingRow>[] = [
    {
      header: "Code",
      cell: (row) => <span className="font-mono text-xs text-[#1B3A5C]/70 tracking-wider">{row.bookingCode}</span>
    },
    {
      header: "Property",
      cell: (row) => <span className="text-xs font-medium text-[#1B3A5C]">{row.property.title}</span>
    },
    {
      header: "Guest",
      cell: (row) => <span className="text-xs text-[#1B3A5C]/60">{row.guest.name || row.guest.email}</span>
    },
    {
      header: "Check-in",
      cell: (row) => <span className="text-xs text-[#1B3A5C]/60 tabular-nums">{new Date(row.checkIn).toLocaleDateString()}</span>
    },
    {
      header: "Status",
      cell: (row) => (
        <span className={`${CHIP_BASE} ${BOOKING_CHIPS[row.status] || FALLBACK_CHIP}`}>
          {row.status.replace("_", " ")}
        </span>
      )
    },
    {
      header: "",
      cell: (row) => <ViewLink href={`/admin/bookings/${row.id}`} />
    }
  ]

  return <DataTable data={bookings} columns={columns} />
}

export function DashboardInquiriesTable({ inquiries }: { inquiries: DashboardInquiryRow[] }) {
  const columns: Column<DashboardInquiryRow>[] = [
    {
      header: "Name",
      cell: (row) => <span className="text-xs font-medium text-[#1B3A5C]">{row.name}</span>
    },
    {
      header: "Property",
      cell: (row) => <span className="text-xs text-[#1B3A5C]/60">{row.property?.title || "General"}</span>
    },
    {
      header: "Message",
      cell: (row) => <span className="truncate max-w-[200px] inline-block text-xs text-[#1B3A5C]/50">{row.message}</span>
    },
    {
      header: "Status",
      cell: (row) => (
        <span className={`${CHIP_BASE} ${INQUIRY_CHIPS[row.status] || FALLBACK_CHIP}`}>
          {row.status.replace("_", " ")}
        </span>
      )
    },
    {
      header: "",
      cell: (row) => <ViewLink href={`/admin/inquiries/${row.id}`} />
    }
  ]

  return <DataTable data={inquiries} columns={columns} />
}
