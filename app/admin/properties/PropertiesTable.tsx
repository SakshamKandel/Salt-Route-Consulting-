"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DataTable, Column } from "@/components/admin/data-table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MoreHorizontal, Edit, Image as ImageIcon, Calendar, Trash2 } from "lucide-react"
import { deletePropertyAction } from "./actions"
import { formatNpr } from "@/lib/currency"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type PropertyTableRow = {
  id: string
  title: string
  location: string
  status: string
  pricePerNight: number
}

export function PropertiesTable({ properties }: { properties: PropertyTableRow[] }) {
  const router = useRouter()
  const [rows, setRows] = useState(properties)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  async function handleDelete(row: PropertyTableRow) {
    if (!confirm(`Delete "${row.title}"? This will remove the property from admin and public listings.`)) {
      return
    }

    setPendingDeleteId(row.id)
    const res = await deletePropertyAction(row.id)
    if (res.error) {
      alert(res.error)
    } else {
      setRows((current) => current.filter((item) => item.id !== row.id))
      router.refresh()
    }
    setPendingDeleteId(null)
  }

  const columns: Column<PropertyTableRow>[] = [
    {
      header: "Title",
      accessorKey: "title",
    },
    {
      header: "Location",
      accessorKey: "location",
    },
    {
      header: "Status",
      cell: (row) => (
        <Badge
          variant={
            row.status === "ACTIVE"
              ? "default"
              : row.status === "DRAFT"
              ? "secondary"
              : "outline"
          }
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Price/Night",
      cell: (row) => <span>{formatNpr(row.pricePerNight)}</span>,
    },
    {
      header: "Actions",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent focus-visible:outline-none">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Link href={`/admin/properties/${row.id}`} className="flex items-center gap-2 w-full">
                <Edit className="w-4 h-4" /> View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/admin/properties/${row.id}/edit`} className="flex items-center gap-2 w-full">
                <Edit className="w-4 h-4" /> Edit Property
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/admin/properties/${row.id}/images`} className="flex items-center gap-2 w-full">
                <ImageIcon className="w-4 h-4" /> Manage Media
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/admin/properties/${row.id}/calendar`} className="flex items-center gap-2 w-full">
                <Calendar className="w-4 h-4" /> Manage Calendar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => handleDelete(row)}
              disabled={pendingDeleteId === row.id}
            >
              <Trash2 className="w-4 h-4" />
              {pendingDeleteId === row.id ? "Deleting..." : "Delete Property"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <DataTable
      data={rows}
      columns={columns}
      searchKey="title"
      searchPlaceholder="Search properties..."
    />
  )
}
