import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Calendar, Heart, Star, UserCircle, Bell, LogOut } from "lucide-react"

const sidebarNav = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard },
  { href: "/account/bookings", label: "Bookings", icon: Calendar },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/reviews", label: "My Reviews", icon: Star },
  { href: "/account/profile", label: "Profile", icon: UserCircle },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
]

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-navy text-cream flex-shrink-0 sticky top-0 md:h-screen">
        <div className="p-6">
          <Link href="/" className="font-display text-2xl text-gold tracking-widest uppercase">Salt Route</Link>
        </div>
        <nav className="mt-6 px-4 space-y-1">
          {sidebarNav.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
          <div className="pt-8 mt-8 border-t border-white/10">
            <Link
              href="/api/auth/signout"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-red-400"
            >
              <LogOut size={20} />
              <span>Log out</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
