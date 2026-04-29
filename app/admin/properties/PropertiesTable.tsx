"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ServerDataTable, ColumnDef } from "@/components/admin/server-data-table"
import { BulkActionBar } from "@/components/admin/bulk-action-bar"
import Link from "next/link"
import {
  MoreHorizontal,
  Edit,
  Image as ImageIcon,
  Calendar,
  Trash2,
  Globe,
  Archive,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deletePropertyAction } from "./actions"
import { bulkUpdatePropertyStatusAction } from "./bulk-actions"
import { formatNpr } from "@/lib/currency"
import { toast } from "sonner"

type PropertyRow = {
  id: string
  title: string
  location: string
  status: string
  pricePerNight: number
  createdAt: Date | string
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-600 border-emerald-200/50",
  DRAFT: "bg-amber-50 text-amber-600 border-amber-200/50",
  ARCHIVED: "bg-red-50 text-red-500 border-red-200/50",
}

interface PropertiesTableProps {
  properties: PropertyRow[]
  total: number
  page: number
  pageSize: number
  sort: string
  order: "asc" | "desc"
  searchValue: string
}

export function PropertiesTable({
  properties,
  total,
  page,
  pageSize,
  sort,
  order,
  searchValue,
}: PropertiesTableProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const handleDelete = async (row: PropertyRow) => {
    if (!confirm(`Delete "${row.title}"? This cannot be undone.`)) return
    setPendingDeleteId(row.id)
    const res = await deletePropertyAction(row.id)
    setPendingDeleteId(null)
    if (res.error) toast.error(res.error)
    else {
      toast.success("Property deleted")
      router.refresh()
    }
  }

  const handleBulkStatus = (status: "ACTIVE" | "ARCHIVED" | "DRAFT", label: string) => {
    if (!confirm(`Set ${selectedIds.length} properties to "${label}"?`)) return
    startTransition(async () => {
      const res = await bulkUpdatePropertyStatusAction(selectedIds, status)
      if (res.error) toast.error(res.error)
      else {
        toast.success(`${res.count} properties updated`)
        setSelectedIds([])
        router.refresh()
      }
    })
  }

  const columns: ColumnDef<PropertyRow>[] = [
    {
      id: "title",
      header: "Title",
      cell: ({ row }) => (
        <span className="font-medium text-navy text-xs">{row.original.title}</span>
      ),
    },
    {
      id: "location",
      header: "Location",
      cell: ({ row }) => (
        <span className="text-navy/60 text-xs font-light">{row.original.location}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
            STATUS_STYLES[row.original.status] || "bg-slate-50 text-slate-500 border-slate-200"
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      id: "pricePerNight",
      header: "Price/Night",
      cell: ({ row }) => (
        <span className="font-semibold text-navy/80 text-xs">{formatNpr(row.original.pricePerNight)}</span>
      ),
    },
    {
      id: "createdAt",
      header: "Added",
      cell: ({ row }) => (
        <span className="text-[10px] text-navy/40">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const p = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gold/10 hover:text-gold transition-colors focus-visible:outline-none">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-[#1B3A5C]/10 bg-[#FFFDF8] p-1.5 text-[#1B3A5C]">
              <DropdownMenuLabel className="text-[10px] text-navy/30 uppercase tracking-widest font-semibold px-2.5 py-1.5">Manage</DropdownMenuLabel>
              <DropdownMenuItem className="rounded-lg text-xs font-light px-2.5 py-2 hover:bg-navy/5 cursor-pointer flex items-center gap-2" onClick={() => router.push(`/admin/properties/${p.id}`)}>
                <Edit className="w-3.5 h-3.5 opacity-60" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg text-xs font-light px-2.5 py-2 hover:bg-navy/5 cursor-pointer flex items-center gap-2" onClick={() => router.push(`/admin/properties/${p.id}/edit`)}>
                <Edit className="w-3.5 h-3.5 opacity-60" /> Edit Property
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg text-xs font-light px-2.5 py-2 hover:bg-navy/5 cursor-pointer flex items-center gap-2" onClick={() => router.push(`/admin/properties/${p.id}/images`)}>
                <ImageIcon className="w-3.5 h-3.5 opacity-60" /> Manage Media
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg text-xs font-light px-2.5 py-2 hover:bg-navy/5 cursor-pointer flex items-center gap-2" onClick={() => router.push(`/admin/properties/${p.id}/calendar`)}>
                <Calendar className="w-3.5 h-3.5 opacity-60" /> Manage Calendar
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 bg-navy/5" />
              <DropdownMenuItem
                className="rounded-lg text-xs font-light px-2.5 py-2 hover:bg-rose-50 text-rose-600 focus:text-rose-600 cursor-pointer flex items-center gap-2"
                onClick={() => handleDelete(p)}
                disabled={pendingDeleteId === p.id}
              >
                <Trash2 className="w-3.5 h-3.5 opacity-60" />
                {pendingDeleteId === p.id ? "Deleting…" : "Delete Property"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const bulkActions = [
    {
      label: "Publish",
      icon: <Globe className="h-3.5 w-3.5" />,
      onClick: () => handleBulkStatus("ACTIVE", "Active"),
    },
    {
      label: "Archive",
      icon: <Archive className="h-3.5 w-3.5" />,
      variant: "danger" as const,
      onClick: () => handleBulkStatus("ARCHIVED", "Archived"),
    },
  ]

  return (
    <ServerDataTable
      data={properties}
      columns={columns}
      total={total}
      page={page}
      pageSize={pageSize}
      sort={sort}
      order={order}
      searchValue={searchValue}
      searchPlaceholder="Search properties by title or location..."
      emptyMessage="No properties found."
      getRowId={(row) => row.id}
      selectedIds={selectedIds}
      onSelectionChange={setSelectedIds}
      bulkActionBar={
        <BulkActionBar
          selectedCount={selectedIds.length}
          actions={bulkActions}
          onClearSelection={() => setSelectedIds([])}
        />
      }
    />
  )
}
