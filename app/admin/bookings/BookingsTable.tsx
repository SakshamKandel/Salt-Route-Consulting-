"use client"

import { useState, useTransition } from "react"
import { ServerDataTable, ColumnDef } from "@/components/admin/server-data-table"
import { BulkActionBar } from "@/components/admin/bulk-action-bar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BOOKING_STATUS_LABELS } from "@/lib/booking-lifecycle"
import { formatNpr } from "@/lib/currency"
import { bulkUpdateBookingStatusAction, bulkCancelBookingsAction } from "./bulk-actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CheckCircle, XCircle, LogIn, ExternalLink } from "lucide-react"

type BookingTableRow = {
  id: string
  bookingCode: string
  checkIn: Date | string
  checkOut: Date | string
  totalPrice: number
  status: string
  guest: { name: string | null; email: string | null } | null
  property: { title: string } | null
  createdAt: Date | string
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-200/50",
  CONFIRMED: "bg-emerald-50 text-emerald-600 border-emerald-200/50",
  CHECKED_IN: "bg-sky-50 text-sky-600 border-sky-200/50",
  COMPLETED: "bg-blue-50 text-blue-600 border-blue-200/50",
  CANCELLED: "bg-red-50 text-red-500 border-red-200/50",
  NO_SHOW: "bg-orange-50 text-orange-600 border-orange-200/50",
}

interface BookingsTableProps {
  bookings: BookingTableRow[]
  total: number
  page: number
  pageSize: number
  sort: string
  order: "asc" | "desc"
  searchValue: string
}

export function BookingsTable({
  bookings,
  total,
  page,
  pageSize,
  sort,
  order,
  searchValue,
}: BookingsTableProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [, startTransition] = useTransition()

  const handleBulkStatus = (status: string, label: string) => {
    if (!confirm(`Update ${selectedIds.length} bookings to "${label}"?`)) return
    startTransition(async () => {
      const res = await bulkUpdateBookingStatusAction(
        selectedIds,
        status as "CONFIRMED" | "CANCELLED" | "CHECKED_IN" | "COMPLETED" | "NO_SHOW" | "PENDING",
      )
      if (res.error) toast.error(res.error)
      else {
        toast.success(`${res.count} bookings updated`)
        setSelectedIds([])
        router.refresh()
      }
    })
  }

  const handleBulkCancel = () => {
    const reason = prompt("Cancellation reason (required):")
    if (!reason) return
    startTransition(async () => {
      const res = await bulkCancelBookingsAction(selectedIds, reason)
      if (res.error) toast.error(res.error)
      else {
        toast.success(`${res.count} bookings cancelled`)
        setSelectedIds([])
        router.refresh()
      }
    })
  }

  const columns: ColumnDef<BookingTableRow>[] = [
    {
      id: "bookingCode",
      header: "Ref Code",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-navy/70 tracking-wider">
          {row.original.bookingCode}
        </span>
      ),
    },
    {
      id: "guestName",
      header: "Guest",
      enableSorting: false,
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-navy text-xs">{row.original.guest?.name || "—"}</p>
          <p className="text-[10px] text-navy/40 font-light mt-0.5">{row.original.guest?.email}</p>
        </div>
      ),
    },
    {
      id: "propertyTitle",
      header: "Property",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="font-medium text-navy/80 text-xs">{row.original.property?.title}</span>
      ),
    },
    {
      id: "checkIn",
      header: "Dates",
      cell: ({ row }) => (
        <span className="text-xs text-navy/70">
          {new Date(row.original.checkIn).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}{" "}
          –{" "}
          {new Date(row.original.checkOut).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      id: "totalPrice",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-semibold text-navy/80 text-xs">{formatNpr(row.original.totalPrice)}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
            STATUS_STYLES[row.original.status] || "bg-slate-50 text-slate-500 border-slate-200"
          }`}
        >
          {BOOKING_STATUS_LABELS[row.original.status as keyof typeof BOOKING_STATUS_LABELS] ??
            row.original.status.replace("_", " ")}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-[10px] text-navy/40">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "manage",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <Button asChild variant="ghost" className="hover:bg-gold/10 hover:text-gold rounded-lg h-8 px-2 transition-colors">
          <Link href={`/admin/bookings/${row.original.id}`}>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </Button>
      ),
    },
  ]

  const bulkActions = [
    {
      label: "Confirm",
      icon: <CheckCircle className="h-3.5 w-3.5" />,
      onClick: () => handleBulkStatus("CONFIRMED", "Confirmed"),
    },
    {
      label: "Check In",
      icon: <LogIn className="h-3.5 w-3.5" />,
      onClick: () => handleBulkStatus("CHECKED_IN", "Checked In"),
    },
    {
      label: "Cancel",
      icon: <XCircle className="h-3.5 w-3.5" />,
      variant: "danger" as const,
      onClick: handleBulkCancel,
    },
  ]

  return (
    <ServerDataTable
      data={bookings}
      columns={columns}
      total={total}
      page={page}
      pageSize={pageSize}
      sort={sort}
      order={order}
      searchValue={searchValue}
      searchPlaceholder="Search by reference code..."
      emptyMessage="No bookings found."
      getRowId={(row) => row.id}
      selectedIds={selectedIds}
      onSelectionChange={setSelectedIds}
      bulkActionBar={
        <BulkActionBar
          selectedCount={selectedIds.length}
          actions={bulkActions}
          onClearSelection={() => setSelectedIds([])}
        />
      }
    />
  )
}
