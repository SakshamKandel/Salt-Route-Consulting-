import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Compass, Users, Home, Calendar, MessageSquare, Settings, FileText, Bell, LogOut, ChartBar } from "lucide-react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: ChartBar },
    { name: "Properties", href: "/admin/properties", icon: Home },
    { name: "Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
    { name: "Reviews", href: "/admin/reviews", icon: FileText },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Owners", href: "/admin/owners", icon: Users },
    { name: "Reports", href: "/admin/reports", icon: ChartBar },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <Compass className="h-6 w-6 text-gold mr-2" />
          <span className="text-white font-bold tracking-wider uppercase text-sm">Salt Route Admin</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <ul className="space-y-1 px-3">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-slate-800">Admin Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-600">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 border-l pl-4">
              <span className="text-sm font-medium text-slate-700">{session.user.name}</span>
              <form action={async () => {
                "use server"
                const { signOut } = await import("@/auth")
                await signOut({ redirectTo: "/login" })
              }}>
                <button type="submit" className="text-slate-400 hover:text-red-600 ml-2">
                  <LogOut className="h-5 w-5" />
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
