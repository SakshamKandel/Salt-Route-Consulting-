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
        <div className="flex items-center relative max-w-sm">
          <Search className="absolute left-3 w-4 h-4 text-slate-400" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9 border-slate-200"
          />
        </div>
      )}
      <div className="border border-slate-200 rounded-md bg-white overflow-hidden">
        <Table className="min-w-[760px]">
          <TableHeader className="bg-slate-50">
            <TableRow>
              {columns.map((col, i) => (
                <TableHead key={i} className="text-slate-600 font-semibold">{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center h-24 text-slate-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, i) => (
                <TableRow key={i} className="hover:bg-slate-50 transition-colors">
                  {columns.map((col, j) => (
                    <TableCell key={j} className="py-3">
                      {col.cell ? col.cell(row) : (col.accessorKey ? String(row[col.accessorKey] || "") : "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {filteredData.length > pageSize && (
        <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {resultStart}-{resultEnd} of {filteredData.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage <= 1}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-600 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>
            <span className="text-xs font-medium text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={currentPage >= totalPages}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-600 disabled:pointer-events-none disabled:opacity-40"
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
