import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { NotificationList } from "@/components/shared/notification-list"

export default async function OwnerNotificationsPage() {
  const session = await auth()
  if (!session?.user || !["OWNER", "ADMIN"].includes(session.user.role)) redirect("/login")

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-4">
        <span className="w-8 h-[1px] bg-gold/50" />
        <h2 className="text-[11px] font-sans text-sand uppercase tracking-[0.4em]">Notifications</h2>
      </div>
      <NotificationList notifications={notifications} />
    </div>
  )
}
