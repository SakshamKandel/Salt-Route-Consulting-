import { parsePage, getPagination, DEFAULT_PAGE_SIZE } from "@/lib/pagination"

export type SortOrder = "asc" | "desc"

export interface AdminQuery {
  page: number
  pageSize: number
  search: string
  sort: string
  order: SortOrder
  dateFrom: string
  dateTo: string
  status: string[]
  role: string[]
}

export interface AdminPagination {
  currentPage: number
  pageSize: number
  skip: number
  take: number
  totalPages: number
  startItem: number
  endItem: number
}

export function parseAdminQuery(
  params: Record<string, string | string[] | undefined>
): AdminQuery {
  const raw = (key: string) => {
    const v = params[key]
    return typeof v === "string" ? v : ""
  }

  const pageSize = (() => {
    const n = Number(raw("pageSize"))
    if (!Number.isFinite(n) || n < 1) return DEFAULT_PAGE_SIZE
    return Math.min(n, 200)
  })()

  const order: SortOrder = raw("order") === "asc" ? "asc" : "desc"

  const csvParam = (key: string): string[] => {
    const v = params[key]
    if (Array.isArray(v)) return v.filter(Boolean)
    if (typeof v === "string" && v) return v.split(",").filter(Boolean)
    return []
  }

  return {
    page: parsePage(raw("page")),
    pageSize,
    search: raw("q").trim(),
    sort: raw("sort") || "createdAt",
    order,
    dateFrom: raw("from"),
    dateTo: raw("to"),
    status: csvParam("status"),
    role: csvParam("role"),
  }
}

export function buildPagination(
  query: AdminQuery,
  total: number
): AdminPagination {
  return getPagination(query.page, total, query.pageSize)
}

export function buildDateFilter(
  dateFrom: string,
  dateTo: string,
  field = "createdAt"
): Record<string, unknown> {
  if (!dateFrom && !dateTo) return {}
  const filter: Record<string, Date> = {}
  if (dateFrom) filter.gte = new Date(dateFrom)
  if (dateTo) {
    const end = new Date(dateTo)
    end.setHours(23, 59, 59, 999)
    filter.lte = end
  }
  return { [field]: filter }
}
