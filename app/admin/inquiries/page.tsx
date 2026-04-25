import { prisma } from "@/lib/db"
import { InquiriesTable } from "./InquiriesTable"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { InquiryStatus } from "@prisma/client"
import { isInquiryUnreadForAdmin } from "@/lib/inquiries"
import { getPagination, parsePage } from "@/lib/pagination"
import { PaginationControls } from "@/components/shared/pagination-controls"

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const statusFilter = (resolvedParams.status as string) || "NEW"
  const requestedPage = parsePage(resolvedParams.page)
  const where = {
    status: statusFilter !== "ALL" ? (statusFilter as InquiryStatus) : undefined
  }

  const total = await prisma.inquiry.count({ where })
  const pagination = getPagination(requestedPage, total)

  const inquiries = await prisma.inquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: pagination.skip,
    take: pagination.take,
  })
  const unreadCount = inquiries.filter(isInquiryUnreadForAdmin).length

  const tabs = [
    { label: "New", value: "NEW" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Responded", value: "RESPONDED" },
    { label: "Closed", value: "CLOSED" },
    { label: "All", value: "ALL" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display text-navy">Inquiries</h2>
        <p className="text-slate-500">Manage messages and questions from guests. {unreadCount} unread in this view.</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            asChild
            variant={statusFilter === tab.value ? "default" : "outline"}
            className={statusFilter === tab.value ? "bg-navy" : "text-navy"}
          >
            <Link href={`/admin/inquiries?status=${tab.value}`}>{tab.label}</Link>
          </Button>
        ))}
      </div>

      <InquiriesTable inquiries={inquiries} />
      <PaginationControls
        basePath="/admin/inquiries"
        page={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={total}
        startItem={pagination.startItem}
        endItem={pagination.endItem}
        params={{ status: statusFilter }}
        label="inquiries"
      />
    </div>
  )
}
