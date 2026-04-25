import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

type QueryValue = string | number | undefined | null

function buildHref(basePath: string, params: Record<string, QueryValue>, page: number) {
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "" || key === "page") continue
    query.set(key, String(value))
  }

  if (page > 1) query.set("page", String(page))
  const qs = query.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

export function PaginationControls({
  basePath,
  page,
  totalPages,
  totalItems,
  startItem,
  endItem,
  params = {},
  label = "records",
}: {
  basePath: string
  page: number
  totalPages: number
  totalItems: number
  startItem: number
  endItem: number
  params?: Record<string, QueryValue>
  label?: string
}) {
  if (totalPages <= 1) {
    return (
      <p className="text-sm text-slate-500">
        Showing {totalItems.toLocaleString()} {label}
      </p>
    )
  }

  const pageNumbers = Array.from(new Set([1, page - 1, page, page + 1, totalPages]))
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b)

  return (
    <nav className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between" aria-label="Pagination">
      <p className="text-sm text-slate-500">
        Showing {startItem.toLocaleString()}-{endItem.toLocaleString()} of {totalItems.toLocaleString()} {label}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={buildHref(basePath, params, Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={`inline-flex h-9 items-center gap-1 rounded-md border px-3 text-xs font-medium transition-colors ${
            page <= 1
              ? "pointer-events-none border-slate-100 text-slate-300"
              : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Previous
        </Link>

        {pageNumbers.map((pageNumber, index) => {
          const previous = pageNumbers[index - 1]
          const showGap = typeof previous === "number" && pageNumber - previous > 1
          return (
            <span key={pageNumber} className="flex items-center gap-2">
              {showGap && <span className="text-sm text-slate-300">...</span>}
              <Link
                href={buildHref(basePath, params, pageNumber)}
                aria-current={pageNumber === page ? "page" : undefined}
                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm transition-colors ${
                  pageNumber === page
                    ? "border-navy bg-navy text-white"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {pageNumber}
              </Link>
            </span>
          )
        })}

        <Link
          href={buildHref(basePath, params, Math.min(totalPages, page + 1))}
          aria-disabled={page >= totalPages}
          className={`inline-flex h-9 items-center gap-1 rounded-md border px-3 text-xs font-medium transition-colors ${
            page >= totalPages
              ? "pointer-events-none border-slate-100 text-slate-300"
              : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </nav>
  )
}
