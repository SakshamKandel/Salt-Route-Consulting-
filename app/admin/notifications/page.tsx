import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { NotificationList } from "@/components/shared/notification-list"

export default async function AdminNotificationsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login")

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display text-navy">Notifications</h2>
        <p className="text-slate-500">Unread work across bookings, inquiries, reviews, and owner requests.</p>
      </div>
      <NotificationList notifications={notifications} />
    </div>
  )
}
