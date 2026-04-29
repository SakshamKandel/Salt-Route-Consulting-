"use client"

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type RowSelectionState,
} from "@tanstack/react-table"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback, useState, useTransition, useRef, useEffect } from "react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"

export type { ColumnDef }

interface ServerDataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  total: number
  page: number
  pageSize: number
  sort: string
  order: "asc" | "desc"
  searchValue?: string
  searchPlaceholder?: string
  emptyMessage?: string
  getRowId: (row: T) => string
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  bulkActionBar?: React.ReactNode
}

export function ServerDataTable<T>({
  data, columns, total, page, pageSize, sort, order,
  searchValue = "", searchPlaceholder = "Search...",
  emptyMessage = "No records found.",
  getRowId, selectedIds, onSelectionChange, bulkActionBar,
}: ServerDataTableProps<T>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [localSearch, setLocalSearch] = useState(searchValue)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(total, page * pageSize)

  const updateParam = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === "") params.delete(k)
        else params.set(k, v)
      }
      startTransition(() => { router.push(`${pathname}?${params.toString()}`) })
    },
    [pathname, router, searchParams]
  )

  useEffect(() => { setLocalSearch(searchValue) }, [searchValue])

  const handleSearch = (value: string) => {
    setLocalSearch(value)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      updateParam({ q: value || null, page: null })
    }, 350)
  }

  const handleSort = (field: string) => {
    if (field === sort) {
      updateParam({ sort: field, order: order === "asc" ? "desc" : "asc", page: null })
    } else {
      updateParam({ sort: field, order: "desc", page: null })
    }
  }

  const rowSelection: RowSelectionState = {}
  if (selectedIds) {
    for (const row of data) {
      const id = getRowId(row)
      if (selectedIds.includes(id)) rowSelection[id] = true
    }
  }

  const withCheckbox: ColumnDef<T>[] = onSelectionChange
    ? [
        {
          id: "__select",
          size: 44,
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              indeterminate={table.getIsSomePageRowsSelected()}
              onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
              aria-label="Select all"
              className="border-slate-300 data-[state=checked]:bg-[#1B3A5C] data-[state=checked]:border-[#1B3A5C]"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(v) => row.toggleSelected(!!v)}
              aria-label="Select row"
              onClick={(e) => e.stopPropagation()}
              className="border-slate-300 data-[state=checked]:bg-[#1B3A5C] data-[state=checked]:border-[#1B3A5C]"
            />
          ),
        },
        ...columns,
      ]
    : columns

  const table = useReactTable({
    data,
    columns: withCheckbox,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
    state: { rowSelection },
    onRowSelectionChange: (updater) => {
      if (!onSelectionChange) return
      const next = typeof updater === "function" ? updater(rowSelection) : updater
      onSelectionChange(Object.keys(next).filter((k) => next[k]))
    },
    manualPagination: true,
    manualSorting: true,
  })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <Input
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-9 border-slate-200 bg-white text-sm placeholder:text-slate-400 rounded-lg focus:border-slate-400 focus:ring-0"
          />
        </div>
        {bulkActionBar}
      </div>

      {/* Table card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200 hover:bg-slate-50">
                {table.getHeaderGroups().map((hg) =>
                  hg.headers.map((header) => {
                    const isSortable = header.id !== "__select"
                    const isActive = sort === header.id
                    return (
                      <TableHead
                        key={header.id}
                        className={`text-slate-500 text-xs font-semibold h-11 select-none ${
                          isSortable ? "cursor-pointer hover:text-slate-800" : ""
                        }`}
                        onClick={() => { if (isSortable) handleSort(header.id) }}
                        style={{ width: header.column.columnDef.size }}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {isSortable && (
                            <span>
                              {isActive
                                ? order === "asc"
                                  ? <ChevronUp className="h-3 w-3 text-[#1B3A5C]" />
                                  : <ChevronDown className="h-3 w-3 text-[#1B3A5C]" />
                                : <ChevronsUpDown className="h-3 w-3 text-slate-300" />
                              }
                            </span>
                          )}
                        </span>
                      </TableHead>
                    )
                  })
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={withCheckbox.length}
                    className="text-center h-32 text-sm text-slate-400"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors data-[state=selected]:bg-blue-50/40"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 text-sm text-slate-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-slate-500 px-1">
        <span>
          {total === 0 ? "No results" : `${startItem}–${endItem} of ${total.toLocaleString()} results`}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updateParam({ page: String(page - 1) })}
            disabled={page <= 1}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </button>
          <span className="text-xs text-slate-400 px-1">Page {page} of {totalPages}</span>
          <button
            type="button"
            onClick={() => updateParam({ page: String(page + 1) })}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
