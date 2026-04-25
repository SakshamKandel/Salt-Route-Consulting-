import { prisma } from "@/lib/db"
import { ReviewsTable } from "./ReviewsTable"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ReviewStatus } from "@prisma/client"
import { getPagination, parsePage } from "@/lib/pagination"
import { PaginationControls } from "@/components/shared/pagination-controls"

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const filter = (resolvedParams.filter as string) || "PENDING"
  const requestedPage = parsePage(resolvedParams.page)
  const where = {
    status: filter !== "ALL" ? (filter as ReviewStatus) : undefined
  }

  const total = await prisma.review.count({ where })
  const pagination = getPagination(requestedPage, total)

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: pagination.skip,
    take: pagination.take,
    include: {
      guest: { select: { name: true, email: true } },
      property: { select: { title: true } }
    }
  })

  const tabs = [
    { label: "Pending Approval", value: "PENDING" },
    { label: "Published", value: "PUBLISHED" },
    { label: "Hidden", value: "HIDDEN" },
    { label: "All Reviews", value: "ALL" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display text-navy">Reviews Moderation</h2>
        <p className="text-slate-500">Approve, reject, or reply to guest reviews.</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            asChild
            variant={filter === tab.value ? "default" : "outline"}
            className={filter === tab.value ? "bg-navy" : "text-navy"}
          >
            <Link href={`/admin/reviews?filter=${tab.value}`}>{tab.label}</Link>
          </Button>
        ))}
      </div>

      <ReviewsTable reviews={reviews} />
      <PaginationControls
        basePath="/admin/reviews"
        page={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={total}
        startItem={pagination.startItem}
        endItem={pagination.endItem}
        params={{ filter }}
        label="reviews"
      />
    </div>
  )
}
