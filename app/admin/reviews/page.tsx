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
    include: {
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Reviews</h1>
          <p className="text-sm text-slate-500 mt-0.5">Approve, hide, or moderate guest reviews.</p>
        </div>
        <Link
          href={`/api/admin/export/reviews?filter=${filter}`}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
        >
          <Download className="h-3.5 w-3.5 text-slate-400" /> Export
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide -mb-px">
          {tabs.map((tab) => {
            const active = filter === tab.value
            return (
              <Link
                key={tab.value}
                href={`/admin/reviews?filter=${tab.value}`}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  active
                    ? "border-[#1B3A5C] text-[#1B3A5C]"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
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
