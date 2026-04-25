import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { NotificationList } from "@/components/shared/notification-list"
import { getPagination, parsePage } from "@/lib/pagination"
import { PaginationControls } from "@/components/shared/pagination-controls"

export default async function OwnerNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()
  if (!session?.user || !["OWNER", "ADMIN"].includes(session.user.role)) redirect("/login")
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
    <div className="space-y-12">
      <div className="flex items-center gap-4">
        <span className="w-8 h-[1px] bg-gold/50" />
        <h2 className="text-[11px] font-sans text-sand uppercase tracking-[0.4em]">Notifications</h2>
      </div>
      <NotificationList notifications={notifications} />
      <PaginationControls
        basePath="/owner/notifications"
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
