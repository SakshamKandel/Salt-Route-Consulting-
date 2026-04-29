import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getUnreadNotificationCount } from "@/lib/notifications"
import { LiveProvider } from "@/components/admin/live-provider"
import { ToastListener } from "@/components/admin/toast-listener"
import { CommandPalette } from "@/components/admin/command-palette"
import { AdminShell } from "@/components/admin/admin-shell"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login")

  const unreadNotifications = await getUnreadNotificationCount(session.user.id)
  const userInitial = session.user.name?.charAt(0)?.toUpperCase() ?? "A"

  return (
    <LiveProvider>
      <CommandPalette />
      <ToastListener />
      <AdminShell
        userName={session.user.name}
        userImage={session.user.image}
        userInitial={userInitial}
        unreadNotifications={unreadNotifications}
      >
        {children}
      </AdminShell>
    </LiveProvider>
  )
}
