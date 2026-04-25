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
  guest: { name: string | null; email: string | null } | null
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
      cell: (row) => <span>{row.guest?.name || row.guest?.email}</span>
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
