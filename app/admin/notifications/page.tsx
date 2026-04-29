import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { NotificationList } from "@/components/shared/notification-list"
import { getPagination, parsePage } from "@/lib/pagination"
import { PaginationControls } from "@/components/shared/pagination-controls"

export default async function AdminNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login")
  const params = await searchParams
  const requestedPage = parsePage(params.page)
  const where = { userId: session.user.id }
  const total = await prisma.notification.count({ where })
  const pagination = getPagination(requestedPage, total)

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: pagination.skip,
    take: pagination.take,
  })

  return (
    <div className="space-y-6">
      
      {/* ━━━ HEADER ━━━ */}
      <div>
        <h2 className="text-3xl font-display text-navy tracking-wide">Notifications</h2>
        <p className="text-navy/40 text-xs uppercase tracking-wider font-medium mt-1">
          Unread work across bookings, inquiries, reviews, and owner requests.
        </p>
      </div>

      <NotificationList notifications={notifications} />

      <PaginationControls
        basePath="/admin/notifications"
        page={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={total}
        startItem={pagination.startItem}
        endItem={pagination.endItem}
        label="notifications"
      />
    </div>
  )
}
