"use client"
import { DataTable, Column } from "@/components/admin/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { isInquiryUnreadForAdmin } from "@/lib/inquiries"
import type { InquirySender, InquiryStatus } from "@prisma/client"

type InquiryTableRow = {
  id: string
  name: string
  email: string
  message: string
  status: InquiryStatus
  createdAt: Date | string
  lastMessageAt: Date | string
  lastMessageBy: InquirySender
  adminLastReadAt: Date | string | null
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
      cell: (row) => (
        <span className="inline-flex items-center gap-2">
          {isInquiryUnreadForAdmin(row) && <span className="h-2 w-2 rounded-full bg-gold" />}
          {row.name}
        </span>
      )
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
