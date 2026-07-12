"use client"

import { useMemo, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: keyof T;
  searchPlaceholder?: string;
  emptyMessage?: string;
  pageSize?: number;
}

export function DataTable<T>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  pageSize = 25,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const filteredData = useMemo(() => data.filter((item) => {
    if (!search || !searchKey) return true
    const val = item[searchKey]
    if (typeof val === "string") {
      return val.toLowerCase().includes(search.toLowerCase())
    }
    return true
  }), [data, search, searchKey])
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const resultStart = filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const resultEnd = Math.min(filteredData.length, currentPage * pageSize)

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="flex w-full items-center relative sm:max-w-sm">
          <Search className="absolute left-3 w-3.5 h-3.5 text-[#1B3A5C]/30" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9 h-9 rounded-lg border-[#1B3A5C]/10 bg-[#FFFAF3] text-[13px] text-[#1B3A5C] placeholder:text-[#1B3A5C]/30 focus:border-[#1B3A5C]/30 focus:ring-0"
          />
        </div>
      )}
      <div className="border border-[#1B3A5C]/8 rounded-2xl bg-[#FFFAF3] overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow className="border-b border-[#1B3A5C]/8 hover:bg-transparent">
                {columns.map((col, i) => (
                  <TableHead key={i} className="text-[10px] uppercase tracking-[0.15em] font-medium text-[#1B3A5C]/35 h-11">{col.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-[#1B3A5C]/5">
              {filteredData.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length} className="text-center h-24 text-[13px] text-[#1B3A5C]/35">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, i) => (
                  <TableRow key={i} className="border-b border-[#1B3A5C]/5 last:border-0 hover:bg-[#FBF9F4] transition-colors">
                    {columns.map((col, j) => (
                      <TableCell key={j} className="py-3 text-sm text-[#1B3A5C]/80">
                        {col.cell ? col.cell(row) : (col.accessorKey ? String(row[col.accessorKey] || "") : "")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {filteredData.length > pageSize && (
        <div className="flex flex-col gap-3 text-[12px] text-[#1B3A5C]/45 sm:flex-row sm:items-center sm:justify-between">
          <span className="tabular-nums">
            Showing {resultStart}-{resultEnd} of {filteredData.length}
          </span>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage <= 1}
              className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-lg border border-[#1B3A5C]/15 bg-[#FFFAF3] px-3 text-xs font-medium text-[#1B3A5C]/60 transition-colors hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 disabled:pointer-events-none disabled:opacity-40 sm:flex-none"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>
            <span className="text-xs font-medium text-[#1B3A5C]/35 tabular-nums">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={currentPage >= totalPages}
              className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-lg border border-[#1B3A5C]/15 bg-[#FFFAF3] px-3 text-xs font-medium text-[#1B3A5C]/60 transition-colors hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 disabled:pointer-events-none disabled:opacity-40 sm:flex-none"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
