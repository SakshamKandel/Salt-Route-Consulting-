import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { NotificationList } from "@/components/shared/notification-list"
import { Bell } from "lucide-react"

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <div className="space-y-12">
      {/* ─── PAGE HEADER ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-8 h-[1px] bg-charcoal/20" />
          <h1 className="text-[11px] uppercase tracking-[0.3em] text-charcoal/50 font-medium">
            Notifications
          </h1>
          {notifications.length > 0 && (
            <span className="text-[9px] text-charcoal/25 font-sans">{notifications.length}</span>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 bg-white border border-charcoal/5">
          <Bell className="w-8 h-8 text-charcoal/15 mx-auto mb-6" strokeWidth={1} />
          <p className="text-charcoal/40 text-sm font-sans">No notifications yet. We&apos;ll keep you posted.</p>
        </div>
      ) : (
        <div className="bg-white border border-charcoal/5 divide-y divide-charcoal/5">
          <NotificationList notifications={notifications} />
        </div>
      )}
    </div>
  )
}
