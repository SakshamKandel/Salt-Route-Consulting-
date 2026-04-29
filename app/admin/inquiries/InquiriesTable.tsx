"use client"

import { useState, useTransition } from "react"
import { ServerDataTable, ColumnDef } from "@/components/admin/server-data-table"
import { BulkActionBar } from "@/components/admin/bulk-action-bar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { isInquiryUnreadForAdmin } from "@/lib/inquiries"
import { bulkUpdateInquiryStatusAction } from "./bulk-actions"
import type { InquirySender, InquiryStatus } from "@prisma/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CheckCheck, Archive, ExternalLink } from "lucide-react"

type InquiryTableRow = {
  id: string
  name: string
  email: string
  message: string
  status: InquiryStatus
  createdAt: Date | string
  lastMessageAt: Date | string
  lastMessageBy: InquirySender
  adminLastReadAt: Date | string | null
}

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-rose-50 text-rose-600 border-rose-200/50",
  IN_PROGRESS: "bg-amber-50 text-amber-600 border-amber-200/50",
  RESPONDED: "bg-sky-50 text-sky-600 border-sky-200/50",
  CLOSED: "bg-slate-50 text-slate-500 border-slate-200",
}

interface InquiriesTableProps {
  inquiries: InquiryTableRow[]
  total: number
  page: number
  pageSize: number
  sort: string
  order: "asc" | "desc"
  searchValue: string
}

export function InquiriesTable({
  inquiries,
  total,
  page,
  pageSize,
  sort,
  order,
  searchValue,
}: InquiriesTableProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [, startTransition] = useTransition()

  const handleBulkStatus = (status: InquiryStatus, label: string) => {
    if (!confirm(`Mark ${selectedIds.length} inquiries as "${label}"?`)) return
    startTransition(async () => {
      const res = await bulkUpdateInquiryStatusAction(selectedIds, status)
      if (res.error) toast.error(res.error)
      else {
        toast.success(`${res.count} inquiries updated`)
        setSelectedIds([])
        router.refresh()
      }
    })
  }

  const columns: ColumnDef<InquiryTableRow>[] = [
    {
      id: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-[10px] text-navy/40">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-2 font-medium text-navy text-xs">
          {isInquiryUnreadForAdmin(row.original) && (
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
          )}
          {row.original.name}
        </span>
      ),
    },
    {
      id: "email",
      header: "Email",
      cell: ({ row }) => <span className="text-navy/60 font-light text-xs">{row.original.email}</span>,
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
          {row.original.status.replace("_", " ")}
        </span>
      ),
    },
    {
      id: "action",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <Button asChild variant="ghost" className="hover:bg-gold/10 hover:text-gold rounded-lg h-8 px-2 transition-colors">
          <Link href={`/admin/inquiries/${row.original.id}`}>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </Button>
      ),
    },
  ]

  const bulkActions = [
    {
      label: "Mark Responded",
      icon: <CheckCheck className="h-3.5 w-3.5" />,
      onClick: () => handleBulkStatus("RESPONDED", "Responded"),
    },
    {
      label: "Close",
      icon: <Archive className="h-3.5 w-3.5" />,
      onClick: () => handleBulkStatus("CLOSED", "Closed"),
    },
  ]

  return (
    <ServerDataTable
      data={inquiries}
      columns={columns}
      total={total}
      page={page}
      pageSize={pageSize}
      sort={sort}
      order={order}
      searchValue={searchValue}
      searchPlaceholder="Search by name or email..."
      emptyMessage="No inquiries found."
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
