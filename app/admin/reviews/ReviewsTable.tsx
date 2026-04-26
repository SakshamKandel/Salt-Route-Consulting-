"use client"
import { DataTable, Column } from "@/components/admin/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Star } from "lucide-react"
import type { ReviewStatus } from "@prisma/client"

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

export function ReviewsTable({ reviews }: { reviews: ReviewTableRow[] }) {
  const columns: Column<ReviewTableRow>[] = [
    {
      header: "Date",
      cell: (row) => <span className="text-sm">{new Date(row.createdAt).toLocaleDateString()}</span>
    },
    {
      header: "Property",
      cell: (row) => <span className="font-medium">{row.property.title}</span>
    },
    {
      header: "Guest",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
            {row.guest?.image ? (
              <img src={row.guest.image} alt={row.guest.name || ""} className="h-full w-full object-cover" />
            ) : (
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                {row.guest?.name?.charAt(0) || "G"}
              </span>
            )}
          </div>
          <span className="truncate max-w-[120px]">{row.guest?.name || row.guest?.email}</span>
        </div>
      )
    },
    {
      header: "Rating",
      cell: (row) => (
        <div className="flex items-center">
          <span className="font-medium mr-1">{row.rating}</span>
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        </div>
      )
    },
    {
      header: "Status",
      cell: (row) => (
        <Badge variant={row.isApproved ? "default" : "secondary"}>
          {row.status === "PUBLISHED" ? "Published" : row.status === "HIDDEN" ? "Hidden" : "Pending"}
        </Badge>
      )
    },
    {
      header: "Action",
      cell: (row) => (
        <Button asChild variant="ghost" size="sm">
          <Link href={`/admin/reviews/${row.id}`}>Moderate</Link>
        </Button>
      )
    }
  ]

  return <DataTable data={reviews} columns={columns} searchKey="comment" searchPlaceholder="Search review content..." />
}
