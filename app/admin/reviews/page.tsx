import { prisma } from "@/lib/db"
import { ReviewsTable } from "./ReviewsTable"
import Link from "next/link"
import { ReviewStatus } from "@prisma/client"
import { parseAdminQuery, buildPagination, buildDateFilter } from "@/lib/admin/query"
import { Download } from "lucide-react"

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const query = parseAdminQuery(params)

  const filterParam = typeof params.filter === "string" ? params.filter : "PENDING"
  const validStatuses = Object.values(ReviewStatus) as string[]
  const filter = filterParam === "ALL" || !validStatuses.includes(filterParam) ? "ALL" : filterParam

  const where = {
    ...(filter !== "ALL" ? { status: filter as ReviewStatus } : {}),
    ...(query.search ? { comment: { contains: query.search, mode: "insensitive" as const } } : {}),
    ...buildDateFilter(query.dateFrom, query.dateTo),
  }

  const total = await prisma.review.count({ where })
  const pagination = buildPagination(query, total)

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: query.order },
    skip: pagination.skip,
    take: pagination.take,
    select: {
      id: true, comment: true, rating: true, status: true, createdAt: true,
      guest: { select: { name: true, email: true, image: true } },
      property: { select: { title: true } },
    },
  })

  const tabs = [
    { label: "Pending",   value: "PENDING"   },
    { label: "Published", value: "PUBLISHED" },
    { label: "Hidden",    value: "HIDDEN"    },
    { label: "All",       value: "ALL"       },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Guest Feedback</p>
          <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Reviews</h1>
          <p className="text-[13px] text-[#1B3A5C]/45 mt-1">Approve, hide, or moderate guest reviews.</p>
        </div>
        <Link
          href={`/api/admin/export/reviews?filter=${filter}`}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[#1B3A5C]/15 bg-[#FFFAF3] text-[12px] font-medium text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 transition-colors shrink-0"
        >
          <Download className="h-3.5 w-3.5 text-[#1B3A5C]/35" /> Export
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#1B3A5C]/10">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide -mb-px">
          {tabs.map((tab) => {
            const active = filter === tab.value
            return (
              <Link
                key={tab.value}
                href={`/admin/reviews?filter=${tab.value}`}
                className={`px-4 py-2.5 text-[12px] font-medium border-b-2 whitespace-nowrap transition-colors ${
                  active
                    ? "border-[#C9A96E] text-[#1B3A5C]"
                    : "border-transparent text-[#1B3A5C]/40 hover:text-[#1B3A5C]/70 hover:border-[#1B3A5C]/15"
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>

      <ReviewsTable
        reviews={reviews}
        total={total}
        page={pagination.currentPage}
        pageSize={pagination.pageSize}
        sort={query.sort}
        order={query.order}
        searchValue={query.search}
      />
    </div>
  )
}
