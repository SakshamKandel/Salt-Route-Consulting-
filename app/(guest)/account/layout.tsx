import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Image from "next/image"
import { getUnreadNotificationCount } from "@/lib/notifications"
import { Footer } from "@/components/public/Footer"
import { GuestAccountShell } from "@/components/guest/guest-account-shell"

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

      {/* ─── Greeting banner ─── */}
      <div className="bg-[#FFFDF8] border-b border-[#1B3A5C]/5">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-12">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-[#1B3A5C]/[0.04] flex items-center justify-center border border-[#1B3A5C]/8 shrink-0">
              <span className="font-display text-lg text-[#1B3A5C]/55">
                {userInitial}
              </span>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] text-[#1B3A5C]/30 font-medium mb-1">
                Welcome back
              </p>
              <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">
                {session.user.name ?? "Guest"}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Page content ─── */}
      <main className="flex-1">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-12 py-10 md:py-16">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  )
}
