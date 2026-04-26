import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { markAllCurrentUserNotificationsReadAction, markNotificationReadAction } from "@/app/notifications/actions"
import { getPagination, parsePage } from "@/lib/pagination"
import { PaginationControls } from "@/components/shared/pagination-controls"
import { formatDistanceToNow } from "date-fns"

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
    <div className="space-y-14">

      {/* â”€â”€â”€ PAGE HEADER â”€â”€â”€ */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="w-8 h-px bg-gold/40" />
            <p className="text-[9px] uppercase tracking-[0.45em] text-gold/60 font-medium">
              Property Alerts
            </p>
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-sand/85 tracking-wide">
            Portfolio Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-[11px] text-sand/35 font-light">
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
              className="text-[9px] uppercase tracking-[0.35em] font-medium text-sand/40 hover:text-gold transition-colors duration-500 px-6 py-3"
              style={{ border: "1px solid rgba(201,169,110,0.12)" }}
            >
              Mark All Read
            </button>
          </form>
        )}
      </div>

      {/* â”€â”€â”€ NOTIFICATIONS â”€â”€â”€ */}
      {notifications.length === 0 ? (
        <div
          className="py-24 flex flex-col items-center justify-center text-center"
          style={{ border: "1px solid rgba(201,169,110,0.07)" }}
        >
          <div className="w-10 h-px bg-gold/20 mb-6" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-sand/25 font-medium">
            You&apos;re all caught up
          </p>
            <p className="text-[11px] text-sand/18 font-light mt-2">
            Booking, support, and property updates will appear here.
          </p>
        </div>
      ) : (
        <div style={{ border: "1px solid rgba(201,169,110,0.08)" }}>
          {notifications.map((notification, i) => {
            const isUnread = !notification.readAt
            const isLast = i === notifications.length - 1

            return (
              <div
                key={notification.id}
                className="flex items-start gap-5 px-8 py-7 transition-all duration-500 hover:bg-white/[0.015] group"
                style={{
                  background: isUnread ? "rgba(201,169,110,0.035)" : "transparent",
                  borderBottom: isLast ? "none" : "1px solid rgba(201,169,110,0.05)",
                }}
              >
                {/* Unread indicator */}
                <div className="shrink-0 mt-1.5 w-2 h-2 flex items-center justify-center">
                  {isUnread && (
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <p
                      className={`text-[13px] font-medium tracking-wide leading-snug ${
                        isUnread ? "text-sand/80" : "text-sand/50"
                      }`}
                    >
                      {notification.title}
                    </p>
                    <p className="text-[9px] uppercase tracking-[0.25em] text-sand/25 shrink-0">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <p className="text-[12px] text-sand/40 font-light leading-[1.85]">
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
                        className="mt-1 text-[9px] uppercase tracking-[0.3em] text-gold/45 hover:text-gold transition-colors duration-500"
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

