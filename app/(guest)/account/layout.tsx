import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Heart, Star, UserCircle, Bell, MessageSquare, ArrowRight, Home, LogOut } from "lucide-react"
import { getUnreadNotificationCount } from "@/lib/notifications"
import { Footer } from "@/components/public/Footer"

const navItems = [
  { href: "/account", label: "Overview", icon: Home },
  { href: "/account/bookings", label: "Reservations", icon: Calendar },
  { href: "/account/wishlist", label: "Collection", icon: Heart },
  { href: "/account/reviews", label: "Reviews", icon: Star },
  { href: "/account/messages", label: "Messages", icon: MessageSquare },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/profile", label: "Settings", icon: UserCircle },
]

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const unreadNotifications = await getUnreadNotificationCount(session.user.id)

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans flex flex-col">
      {/* ─── TOP NAV BAR ─── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-charcoal/5">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="h-20 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-4">
              <Image 
                src="/logo.png" 
                alt="Salt Route" 
                width={60} 
                height={28} 
                className="object-contain"
              />
              <span className="hidden md:block w-[1px] h-6 bg-charcoal/10" />
              <span className="hidden md:block text-[9px] uppercase tracking-[0.3em] text-charcoal/40 font-medium">
                Guest Portal
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/50 hover:text-charcoal transition-colors duration-300 flex items-center gap-2.5 group"
                  >
                    <Icon className="w-3.5 h-3.5 stroke-[1.5] text-charcoal/30 group-hover:text-charcoal/60 transition-colors" />
                    <span>{item.label}</span>
                    {item.href === "/account/notifications" && unreadNotifications > 0 && (
                      <span className="absolute -top-0.5 right-1 min-w-4 h-4 rounded-full bg-charcoal text-white text-[8px] flex items-center justify-center font-bold">
                        {unreadNotifications > 9 ? "9+" : unreadNotifications}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3 sm:gap-6">
              <Link
                href="/properties"
                className="hidden sm:flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-charcoal/40 hover:text-charcoal transition-colors"
              >
                <span>Browse Stays</span>
                <ArrowRight className="w-3 h-3 stroke-[1.5]" />
              </Link>
              <form action={async () => {
                "use server"
                await signOut({ redirectTo: "/" })
              }}>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 border border-charcoal/10 text-[9px] uppercase tracking-[0.2em] text-charcoal/50 hover:border-charcoal/30 hover:text-charcoal transition-all duration-300"
                >
                  <LogOut className="w-3 h-3 stroke-[1.5]" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* ─── MOBILE NAV ─── */}
      <div className="lg:hidden overflow-x-auto border-b border-charcoal/5 bg-white">
        <div className="flex items-center gap-1 px-4 py-3 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex items-center gap-2 px-4 py-2 text-[9px] uppercase tracking-[0.15em] text-charcoal/40 hover:text-charcoal hover:bg-charcoal/[0.02] transition-all whitespace-nowrap"
              >
                <Icon className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>{item.label}</span>
                {item.href === "/account/notifications" && unreadNotifications > 0 && (
                  <span className="min-w-4 h-4 rounded-full bg-charcoal text-white text-[8px] flex items-center justify-center font-bold">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* ─── GREETING BANNER ─── */}
      <div className="bg-white border-b border-charcoal/5">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-14">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-charcoal/[0.03] flex items-center justify-center border border-charcoal/5">
              <span className="font-display text-xl text-charcoal/60">
                {session.user.name?.charAt(0)?.toUpperCase() || "G"}
              </span>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] text-charcoal/30 font-medium mb-1">Welcome back</p>
              <h1 className="font-display text-2xl md:text-3xl text-charcoal tracking-wide">
                {session.user.name || "Guest"}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* ─── PAGE CONTENT ─── */}
      <main className="flex-1">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-12 py-10 md:py-16">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  )
}
