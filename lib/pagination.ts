export const DEFAULT_PAGE_SIZE = 25

export function parsePage(value: string | string[] | undefined) {
  if (typeof value !== "string") return 1
  const page = Number(value)
  if (!Number.isFinite(page) || page < 1) return 1
  return Math.floor(page)
}

export function getPagination(page: number, totalItems: number, pageSize = DEFAULT_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const skip = (currentPage - 1) * pageSize

  return {
    currentPage,
    pageSize,
    skip,
    take: pageSize,
    totalPages,
    startItem: totalItems === 0 ? 0 : skip + 1,
    endItem: Math.min(totalItems, skip + pageSize),
  }
}
