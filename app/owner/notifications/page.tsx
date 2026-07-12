import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { markAllCurrentUserNotificationsReadAction, markNotificationReadAction } from "@/app/notifications/actions"
import { getPagination, parsePage } from "@/lib/pagination"
import { PaginationControls } from "@/components/shared/pagination-controls"
import { formatDistanceToNow } from "date-fns"
import { Bell } from "lucide-react"

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

  const unreadCount = notifications.filter((n) => !n.readAt).length

  return (
    <div className="pb-12 space-y-8">

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.3em] mb-1">
            Property Alerts
          </p>
          <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-[12px] text-[#1B3A5C]/45 mt-1.5">
              {unreadCount} unread alert{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <form
            action={async () => {
              "use server"
              await markAllCurrentUserNotificationsReadAction()
            }}
          >
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-[#1B3A5C]/15 rounded-lg text-[11px] font-medium text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 transition-colors"
            >
              Mark all read
            </button>
          </form>
        )}
      </div>

      {/* ── NOTIFICATIONS ── */}
      {notifications.length === 0 ? (
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl py-16 text-center">
          <Bell className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-3" />
          <p className="text-[13px] text-[#1B3A5C]/35 font-medium">You&apos;re all caught up</p>
          <p className="text-[11px] text-[#1B3A5C]/25 mt-1">Booking, support, and property updates will appear here</p>
        </div>
      ) : (
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl overflow-hidden divide-y divide-[#1B3A5C]/5">
          {notifications.map((notification) => {
            const isUnread = !notification.readAt

            return (
              <div
                key={notification.id}
                className={`flex items-start gap-4 px-5 py-4 hover:bg-[#FBF9F4] transition-colors ${
                  isUnread ? "bg-[#C9A96E]/[0.04]" : ""
                }`}
              >
                {/* Unread indicator */}
                <div className="shrink-0 mt-1.5 w-2 h-2 flex items-center justify-center">
                  {isUnread && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-3">
                    <p
                      className={`text-[13px] font-semibold leading-snug ${
                        isUnread ? "text-[#1B3A5C]" : "text-[#1B3A5C]/70"
                      }`}
                    >
                      {notification.title}
                    </p>
                    <p className="text-[10px] text-[#1B3A5C]/35 shrink-0 sm:mt-0.5">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <p className="text-[12px] text-[#1B3A5C]/50 leading-relaxed">
                    {notification.body}
                  </p>

                  {isUnread && (
                    <form
                      action={async () => {
                        "use server"
                        await markNotificationReadAction(notification.id)
                      }}
                    >
                      <button
                        type="submit"
                        className="mt-1 text-[11px] font-medium text-[#1B3A5C]/40 hover:text-[#1B3A5C] transition-colors"
                      >
                        Mark as read
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

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
