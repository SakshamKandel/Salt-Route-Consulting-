"use client"
import { DataTable, Column } from "@/components/admin/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type InquiryTableRow = {
  id: string
  name: string
  email: string
  message: string
  status: string
  createdAt: Date | string
  property?: { title: string } | null
}

export function InquiriesTable({ inquiries }: { inquiries: InquiryTableRow[] }) {
  const columns: Column<InquiryTableRow>[] = [
    {
      header: "Date",
      cell: (row) => <span className="text-sm">{new Date(row.createdAt).toLocaleDateString()}</span>
    },
    {
      header: "Name",
      accessorKey: "name"
    },
    {
      header: "Email",
      accessorKey: "email"
    },
    {
      header: "Related Property",
      cell: (row) => <span>{row.property?.title || <span className="text-slate-400 italic">General Inquiry</span>}</span>
    },
    {
      header: "Status",
      cell: (row) => (
        <Badge variant={row.status === "NEW" ? "destructive" : row.status === "CLOSED" ? "default" : "secondary"}>
          {row.status}
        </Badge>
      )
    },
    {
      header: "Action",
      cell: (row) => (
        <Button asChild variant="ghost" size="sm">
          <Link href={`/admin/inquiries/${row.id}`}>View / Reply</Link>
        </Button>
      )
    }
  ]

  return <DataTable data={inquiries} columns={columns} searchKey="email" searchPlaceholder="Search by email..." />
}
