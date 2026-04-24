"use client"

import { DataTable, Column } from "@/components/admin/data-table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MoreHorizontal, Edit, Image as ImageIcon, Calendar } from "lucide-react"

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
  pricePerNight: { toString(): string }
}

export function PropertiesTable({ properties }: { properties: PropertyTableRow[] }) {
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
      cell: (row) => <span>${row.pricePerNight.toString()}</span>,
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
                <ImageIcon className="w-4 h-4" /> Manage Images
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/admin/properties/${row.id}/calendar`} className="flex items-center gap-2 w-full">
                <Calendar className="w-4 h-4" /> Manage Calendar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Delete Property</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <DataTable
      data={properties}
      columns={columns}
      searchKey="title"
      searchPlaceholder="Search properties..."
    />
  )
}
