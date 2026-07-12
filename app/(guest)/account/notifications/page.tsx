import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { NotificationList } from "@/components/shared/notification-list"
import { Bell } from "lucide-react"
import { getPagination, parsePage } from "@/lib/pagination"
import { PaginationControls } from "@/components/shared/pagination-controls"

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
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
    <div className="space-y-10">
      {/* ─── PAGE HEADER ─── */}
      <div>
        <p className="text-[11px] font-medium text-[#C9A96E] uppercase tracking-[0.18em] mb-1.5">
          Updates
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-[#1B3A5C] tracking-wide">
          Notifications
        </h1>
        <p className="text-[13px] text-[#1B3A5C]/60 mt-2">
          {notifications.length > 0
            ? "News about your reservations, messages, and account."
            : "We will keep you posted about your reservations and messages."}
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl py-16 text-center">
          <Bell className="h-8 w-8 text-[#1B3A5C]/15 mx-auto mb-4" strokeWidth={1.5} />
          <h3 className="font-display text-xl text-[#1B3A5C] tracking-wide mb-1.5">All quiet for now</h3>
          <p className="text-[13px] text-[#1B3A5C]/60">No notifications yet. We&apos;ll keep you posted.</p>
        </div>
      ) : (
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl divide-y divide-[#1B3A5C]/5 overflow-hidden">
          <NotificationList notifications={notifications} />
        </div>
      )}
      <PaginationControls
        basePath="/account/notifications"
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
