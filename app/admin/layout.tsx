import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Users, Home, Calendar, MessageSquare, Settings, FileText, Bell, LogOut, ChartBar, Mail } from "lucide-react"
import { getUnreadNotificationCount } from "@/lib/notifications"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const unreadNotifications = await getUnreadNotificationCount(session.user.id)

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: ChartBar },
    { name: "Properties", href: "/admin/properties", icon: Home },
    { name: "Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
    { name: "Reviews", href: "/admin/reviews", icon: FileText },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Owners", href: "/admin/owners", icon: Users },
    { name: "Invitations", href: "/admin/invitations", icon: Mail },
    { name: "Reports", href: "/admin/reports", icon: ChartBar },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-background text-charcoal overflow-hidden font-sans selection:bg-gold/30">
      {/* ─── QUIET LUXURY SIDEBAR ─── */}
      <aside className="w-64 bg-[#FAFAFA] border-r border-charcoal/5 flex flex-col hidden md:flex">
        <div className="h-24 flex items-center justify-center px-6 border-b border-charcoal/5">
          <Link href="/" className="flex flex-col items-center group">
            <span className="font-display text-xl tracking-[0.3em] uppercase leading-none text-charcoal group-hover:text-gold transition-colors duration-700">
              Salt Route
            </span>
            <span className="text-[8px] tracking-[0.5em] text-charcoal/40 uppercase font-sans font-medium mt-2">
              Admin Portal
            </span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <ul className="space-y-1 px-3">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="flex items-center px-6 py-4 rounded-none text-sm font-light hover:bg-charcoal/5 transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-0 bg-charcoal/30 group-hover:h-3/4 transition-all duration-500 ease-out" />
                  <item.icon className="mr-4 h-4 w-4 flex-shrink-0 text-charcoal/30 group-hover:text-charcoal transition-colors duration-500 stroke-[1.2]" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-charcoal/50 group-hover:text-charcoal transition-colors duration-500 font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Topbar */}
        <header className="h-24 border-b border-charcoal/5 flex items-center justify-between px-10 z-10 shrink-0">
          <div className="flex items-center">
            <h1 className="font-display text-xl text-charcoal tracking-widest uppercase">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/admin/notifications" className="relative text-charcoal/30 hover:text-charcoal transition-colors" aria-label="Notifications">
              <Bell className="h-4 w-4 stroke-[1.2]" />
              {unreadNotifications > 0 && (
                <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-red-600 px-1 text-center text-[10px] font-bold text-white">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-4 border-l border-charcoal/10 pl-6">
              <span className="text-[10px] uppercase tracking-[0.2em] text-charcoal/60 font-bold">{session.user.name}</span>
              <form action={async () => {
                "use server"
                const { signOut } = await import("@/auth")
                await signOut({ redirectTo: "/login" })
              }}>
                <button type="submit" className="text-charcoal/30 hover:text-charcoal ml-2 transition-colors">
                  <LogOut className="h-4 w-4 stroke-[1.2]" />
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
