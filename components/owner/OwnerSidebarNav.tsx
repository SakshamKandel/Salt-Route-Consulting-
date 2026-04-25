"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Calendar,
  ChartBar,
  User,
  MessageSquare,
  Edit3,
  Bell,
  TrendingUp,
} from "lucide-react"

const NAV_ITEMS = [
  { name: "Portfolio Hub", href: "/owner/dashboard",     icon: ChartBar,      isBadge: false },
  { name: "Property Rooms", href: "/owner/properties",   icon: Home,          isBadge: false },
  { name: "Stay Ledger",    href: "/owner/bookings",     icon: Calendar,      isBadge: false },
  { name: "Support",        href: "/owner/messages",     icon: MessageSquare, isBadge: false },
  { name: "Alerts",         href: "/owner/notifications",icon: Bell,          isBadge: true  },
  { name: "Performance",    href: "/owner/reports",      icon: TrendingUp,    isBadge: false },
  { name: "Listing Edits",  href: "/owner/request-edit", icon: Edit3,         isBadge: false },
  { name: "Profile",        href: "/owner/profile",      icon: User,          isBadge: false },
]

export function OwnerSidebarNav({ notificationBadge }: { notificationBadge: number }) {
  const pathname = usePathname()

  return (
    <ul className="space-y-0.5">
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/owner/dashboard" && pathname.startsWith(item.href))
        const badge = item.isBadge ? notificationBadge : 0

        return (
          <li key={item.name}>
            <Link
              href={item.href}
              className={`flex items-center px-8 py-3.5 relative group ${
                isActive
                  ? "bg-gold/5 text-gold"
                  : "text-sand/35 hover:text-sand/70 hover:bg-white/[0.02]"
              }`}
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-[2px] bg-gold ${
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                }`}
              />
              <item.icon
                className={`mr-5 h-3.5 w-3.5 flex-shrink-0 stroke-[1.3] ${
                  isActive ? "text-gold" : "text-sand/25 group-hover:text-sand/50"
                }`}
              />
              <span className="text-[10px] uppercase tracking-[0.22em] font-medium">
                {item.name}
              </span>
              {badge > 0 && (
                <span className="ml-auto min-w-5 rounded-full bg-gold/15 border border-gold/25 text-gold px-1.5 text-center text-[9px] font-bold">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export function OwnerMobileNav({ notificationBadge }: { notificationBadge: number }) {
  const pathname = usePathname()

  return (
    <div className="flex min-w-max items-center px-4 py-3 gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/owner/dashboard" && pathname.startsWith(item.href))
        const badge = item.isBadge ? notificationBadge : 0

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`inline-flex items-center gap-2 whitespace-nowrap px-3 py-2 text-[9px] uppercase tracking-[0.14em] transition-colors ${
              isActive ? "text-gold" : "text-sand/35 hover:text-sand/70"
            }`}
          >
            <item.icon className="h-3.5 w-3.5 stroke-[1.3]" />
            <span>{item.name}</span>
            {badge > 0 && (
              <span className="min-w-4 text-center text-[8px] font-bold text-gold bg-gold/15 px-1 rounded-full">
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}
