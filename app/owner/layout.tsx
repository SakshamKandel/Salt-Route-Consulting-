import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LogOut } from "lucide-react"
import { getUnreadNotificationCount } from "@/lib/notifications"
import { OwnerSidebarNav, OwnerMobileNav } from "@/components/owner/OwnerSidebarNav"

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || !["OWNER", "ADMIN"].includes(session.user.role)) {
    redirect("/login")
  }

  const unreadNotifications = await getUnreadNotificationCount(session.user.id)

  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "PP"

  const firstName = session.user.name?.split(" ")[0] ?? "Partner"

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-[#102943]">

      {/* ─── SIDEBAR ─── */}
      <aside className="w-[280px] flex-col hidden md:flex shrink-0 relative z-20 bg-[#0C1F33]">
        {/* Gold accent line on right edge */}
        <div
          className="absolute top-0 right-0 w-px h-full pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(201,169,110,0.18) 40%, rgba(201,169,110,0.18) 60%, transparent 100%)",
          }}
        />

        {/* Branding */}
        <div className="px-10 pt-12 pb-6 shrink-0">
          <Link href="/" className="group inline-flex flex-col">
            <span className="font-display text-[1.1rem] tracking-[0.4em] uppercase leading-none text-sand/85 group-hover:text-gold">
              Salt Route
            </span>
            <span className="text-[7.5px] tracking-[0.55em] uppercase font-sans font-light text-gold/50 mt-2 leading-none">
              Owner Care
            </span>
          </Link>
        </div>

        {/* Divider */}
        <div className="mx-10 mb-8 h-px bg-gradient-to-r from-gold/25 to-transparent" />

        {/* Navigation — only passes a number (serializable) */}
        <nav className="flex-1 overflow-y-auto">
          <OwnerSidebarNav notificationBadge={unreadNotifications} />
        </nav>

        {/* Bottom: user info + sign out */}
        <div
          className="px-8 pt-6 pb-10 shrink-0"
          style={{ borderTop: "1px solid rgba(201,169,110,0.08)" }}
        >
          <div className="flex items-center gap-3.5 mb-5">
            <div
              className="w-9 h-9 flex items-center justify-center shrink-0 overflow-hidden"
              style={{ border: "1px solid rgba(201,169,110,0.2)", background: "rgba(201,169,110,0.06)" }}
            >
              {session.user.image ? (
                <img src={session.user.image} alt={session.user.name || ""} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[11px] font-semibold text-gold tracking-wider">
                  {initials}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-sand/80 font-medium tracking-wide truncate leading-tight">
                {session.user.name}
              </p>
              <p className="text-[8.5px] uppercase tracking-[0.35em] text-sand/30 mt-0.5 leading-tight">
                Property Partner
              </p>
            </div>
          </div>

          <form
            action={async () => {
              "use server"
              const { signOut } = await import("@/auth")
              await signOut({ redirectTo: "/login" })
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-between px-4 py-3 text-sand/30 hover:text-sand/55 group"
              style={{ border: "1px solid rgba(251,249,244,0.06)" }}
            >
              <span className="text-[9px] uppercase tracking-[0.3em] font-medium">Sign Out</span>
              <LogOut className="h-3.5 w-3.5 stroke-[1.3] group-hover:-translate-x-0.5" />
            </button>
          </form>
        </div>
      </aside>

      {/* ─── MAIN AREA ─── */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* Top header */}
        <header
          className="h-[72px] flex items-center justify-between px-6 sm:px-10 md:px-14 shrink-0 z-10"
          style={{
            borderBottom: "1px solid rgba(201,169,110,0.08)",
            background: "rgba(12,31,51,0.7)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-5">
            <Link href="/" className="md:hidden">
              <span className="font-display text-base tracking-[0.35em] uppercase text-sand/80">SRC</span>
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <span className="w-8 h-px bg-gold/20" />
              <p className="text-[9px] uppercase tracking-[0.34em] text-sand/35 font-medium">
                Your properties, {firstName}
              </p>
            </div>
          </div>
          <Link
            href="/properties"
            className="text-[9px] uppercase tracking-[0.24em] text-sand/25 hover:text-gold"
          >
            View Stays
          </Link>
        </header>

        {/* Mobile scrollable nav — only passes a number */}
        <nav
          className="md:hidden shrink-0 overflow-x-auto z-10"
          style={{ borderBottom: "1px solid rgba(201,169,110,0.08)", background: "#0C1F33" }}
        >
          <OwnerMobileNav notificationBadge={unreadNotifications} />
        </nav>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto z-10">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 py-10 md:py-14 pb-24">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
