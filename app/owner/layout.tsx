import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getUnreadNotificationCount } from "@/lib/notifications"
import { OwnerShell } from "@/components/owner/owner-shell"

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user || !["OWNER", "ADMIN"].includes(session.user.role)) {
    redirect("/login")
  }

  const unreadNotifications = await getUnreadNotificationCount(session.user.id)

  const initials = session.user.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "PP"

  const firstName = session.user.name?.split(" ")[0] ?? "Partner"

  return (
    <OwnerShell
      userName={session.user.name}
      userImage={session.user.image}
      userInitials={initials}
      firstName={firstName}
      unreadNotifications={unreadNotifications}
    >
      {children}
    </OwnerShell>
  )
}
