import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Home, Calendar, ChartBar, User, LogOut, MessageSquare, Edit3, Bell } from "lucide-react"
import { getUnreadNotificationCount } from "@/lib/notifications"

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

  const navigation = [
    { name: "Overview", href: "/owner/dashboard", icon: ChartBar },
    { name: "Properties", href: "/owner/properties", icon: Home },
    { name: "Reservations", href: "/owner/bookings", icon: Calendar },
    { name: "Messages", href: "/owner/messages", icon: MessageSquare },
    { name: "Alerts", href: "/owner/notifications", icon: Bell },
    { name: "Insights", href: "/owner/reports", icon: ChartBar },
    { name: "Request Edit", href: "/owner/request-edit", icon: Edit3 },
    { name: "Profile", href: "/owner/profile", icon: User },
  ]

  return (
    <div className="flex h-screen bg-background text-charcoal overflow-hidden font-sans selection:bg-gold/30">
      {/* ─── QUIET LUXURY SIDEBAR ─── */}
      <aside className="w-72 flex-col hidden md:flex relative z-20 bg-[#FAFAFA] border-r border-charcoal/5">
        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-gold/20 to-transparent pointer-events-none" />
        
        <div className="p-12 flex justify-center items-center flex-col shrink-0 mt-8">
          <Link href="/" className="flex flex-col items-center group">
            <span className="font-display text-2xl tracking-[0.4em] uppercase leading-none text-charcoal mb-3 group-hover:text-gold transition-colors duration-700">
              Salt Route
            </span>
            <span className="text-[9px] tracking-[0.6em] text-charcoal/40 uppercase font-sans font-light">
              Partner Portal
            </span>
          </Link>
          <div className="w-4 h-[1px] bg-charcoal/20 mt-10" />
        </div>
        
        <nav className="flex-1 overflow-y-auto py-8">
          <ul className="space-y-2 px-8">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="flex items-center px-6 py-4 rounded-none text-sm font-light hover:bg-charcoal/5 transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-0 bg-charcoal/30 group-hover:h-3/4 transition-all duration-500 ease-out" />
                  <item.icon className="mr-6 h-4 w-4 flex-shrink-0 text-charcoal/30 group-hover:text-charcoal transition-colors duration-500 stroke-[1.2]" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-charcoal/50 group-hover:text-charcoal transition-colors duration-500 font-medium">{item.name}</span>
                  {item.href === "/owner/notifications" && unreadNotifications > 0 && (
                    <span className="ml-auto min-w-5 rounded-full bg-gold px-1.5 text-center text-[9px] font-bold text-charcoal">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Section */}
        <div className="p-8 pb-12 mt-auto">
          <form action={async () => {
            "use server"
            const { signOut } = await import("@/auth")
            await signOut({ redirectTo: "/login" })
          }}>
            <button type="submit" className="w-full flex items-center justify-center gap-4 px-6 py-4 border border-charcoal/10 hover:border-charcoal/30 text-charcoal/40 hover:text-charcoal transition-all duration-500 group">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Sign Out</span>
              <LogOut className="h-4 w-4 stroke-[1.2] group-hover:-translate-x-1 transition-transform duration-500" />
            </button>
          </form>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none bg-white" />
        
        {/* Top Header */}
        <header className="h-32 flex items-center justify-between px-12 md:px-16 z-10 shrink-0 border-b border-charcoal/5">
          <div className="flex items-center gap-6">
            <span className="w-12 h-[1px] bg-charcoal/20 hidden md:block" />
            <div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-charcoal/40 mb-2 font-bold">Welcome Back</p>
              <h1 className="font-display text-2xl text-charcoal tracking-widest uppercase">{session.user.name}</h1>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-12 md:px-16 pb-24 z-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
