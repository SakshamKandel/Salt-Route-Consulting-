import { prisma } from "@/lib/db"
import { InquiriesTable } from "./InquiriesTable"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { InquiryStatus } from "@prisma/client"

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const statusFilter = (resolvedParams.status as string) || "NEW"

  const inquiries = await prisma.inquiry.findMany({
    where: {
      status: statusFilter !== "ALL" ? (statusFilter as InquiryStatus) : undefined
    },
    orderBy: { createdAt: "desc" }
  })

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
        <p className="text-slate-500">Manage messages and questions from guests.</p>
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
    </div>
  )
}
