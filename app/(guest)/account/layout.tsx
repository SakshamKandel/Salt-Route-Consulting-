import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getUnreadNotificationCount } from "@/lib/notifications"
import { Footer } from "@/components/public/Footer"
import { GuestAccountShell } from "@/components/guest/guest-account-shell"

export const dynamic = "force-dynamic"

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) redirect("/login")

  const unreadNotifications = await getUnreadNotificationCount(session.user.id)
  const userInitial = session.user.name?.charAt(0)?.toUpperCase() ?? "G"

  return (
    <div className="min-h-screen bg-[#FBF9F4] font-sans flex flex-col">

      {/* Interactive shell: drawer + sticky header */}
      <GuestAccountShell
        userName={session.user.name}
        userInitial={userInitial}
        unreadNotifications={unreadNotifications}
      />

      {/* ─── Page content ─── */}
      <main className="flex-1">
        <div className="max-w-screen-2xl mx-auto min-w-0 px-4 sm:px-6 md:px-12 py-8 md:py-12">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  )
}
