"use client"

import { useState, useTransition } from "react"
import { ServerDataTable, ColumnDef } from "@/components/admin/server-data-table"
import { BulkActionBar } from "@/components/admin/bulk-action-bar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Star, CheckCircle, EyeOff, ExternalLink } from "lucide-react"
import { bulkApproveReviewsAction, bulkHideReviewsAction } from "./bulk-actions"
import type { ReviewStatus } from "@prisma/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type ReviewTableRow = {
  id: string
  comment: string
  rating: number
  isApproved: boolean
  status: ReviewStatus
  createdAt: Date | string
  property: { title: string }
  guest: { name: string | null; email: string | null; image: string | null } | null
}

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: "bg-emerald-50 text-emerald-600 border-emerald-200/50",
  HIDDEN: "bg-red-50 text-red-500 border-red-200/50",
  PENDING: "bg-amber-50 text-amber-600 border-amber-200/50",
}

interface ReviewsTableProps {
  reviews: ReviewTableRow[]
  total: number
  page: number
  pageSize: number
  sort: string
  order: "asc" | "desc"
  searchValue: string
}

export function ReviewsTable({
  reviews,
  total,
  page,
  pageSize,
  sort,
  order,
  searchValue,
}: ReviewsTableProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [, startTransition] = useTransition()

  const handleBulkApprove = () => {
    if (!confirm(`Approve ${selectedIds.length} reviews?`)) return
    startTransition(async () => {
      const res = await bulkApproveReviewsAction(selectedIds)
      if (res.error) toast.error(res.error)
      else {
        toast.success(`${res.count} reviews approved`)
        setSelectedIds([])
        router.refresh()
      }
    })
  }

  const handleBulkHide = () => {
    if (!confirm(`Hide ${selectedIds.length} reviews?`)) return
    startTransition(async () => {
      const res = await bulkHideReviewsAction(selectedIds)
      if (res.error) toast.error(res.error)
      else {
        toast.success(`${res.count} reviews hidden`)
        setSelectedIds([])
        router.refresh()
      }
    })
  }

  const columns: ColumnDef<ReviewTableRow>[] = [
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
      id: "propertyTitle",
      header: "Property",
      enableSorting: false,
      cell: ({ row }) => <span className="font-medium text-navy text-xs">{row.original.property.title}</span>,
    },
    {
      id: "guestName",
      header: "Guest",
      enableSorting: false,
      cell: ({ row }) => {
        const g = row.original.guest
        return (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-navy/[0.05] flex items-center justify-center overflow-hidden border border-navy/10 shrink-0">
              {g?.image ? (
                <img src={g.image} alt={g.name || ""} className="h-full w-full object-cover" />
              ) : (
                <span className="text-gold text-[8px] font-bold uppercase">
                  {g?.name?.charAt(0) || "G"}
                </span>
              )}
            </div>
            <span className="truncate max-w-[120px] text-navy text-xs font-light">{g?.name || g?.email}</span>
          </div>
        )
      },
    },
    {
      id: "rating",
      header: "Rating",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-navy text-xs font-semibold">
          <span>{row.original.rating}</span>
          <Star className="w-3.5 h-3.5 fill-gold text-gold" />
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const text =
          row.original.status === "PUBLISHED"
            ? "Published"
            : row.original.status === "HIDDEN"
            ? "Hidden"
            : "Pending"
        return (
          <span
            className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
              STATUS_STYLES[row.original.status] || "bg-slate-50 text-slate-500 border-slate-200"
            }`}
          >
            {text}
          </span>
        )
      },
    },
    {
      id: "action",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <Button asChild variant="ghost" className="hover:bg-gold/10 hover:text-gold rounded-lg h-8 px-2 transition-colors">
          <Link href={`/admin/reviews/${row.original.id}`}>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </Button>
      ),
    },
  ]

  const bulkActions = [
    {
      label: "Approve All",
      icon: <CheckCircle className="h-3.5 w-3.5" />,
      onClick: handleBulkApprove,
    },
    {
      label: "Hide All",
      icon: <EyeOff className="h-3.5 w-3.5" />,
      variant: "danger" as const,
      onClick: handleBulkHide,
    },
  ]

  return (
    <ServerDataTable
      data={reviews}
      columns={columns}
      total={total}
      page={page}
      pageSize={pageSize}
      sort={sort}
      order={order}
      searchValue={searchValue}
      searchPlaceholder="Search review content..."
      emptyMessage="No reviews found."
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
