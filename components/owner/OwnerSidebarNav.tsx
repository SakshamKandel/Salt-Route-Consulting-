"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Calendar,
  BarChart2,
  User,
  MessageSquare,
  Edit3,
  Bell,
  TrendingUp,
} from "lucide-react"

const NAV_ITEMS = [
  { name: "Overview",    href: "/owner/dashboard",      icon: BarChart2,      isBadge: false },
  { name: "Properties",  href: "/owner/properties",     icon: Home,           isBadge: false },
  { name: "Stays",       href: "/owner/bookings",       icon: Calendar,       isBadge: false },
  { name: "Messages",    href: "/owner/messages",       icon: MessageSquare,  isBadge: false },
  { name: "Alerts",      href: "/owner/notifications",  icon: Bell,           isBadge: true  },
  { name: "Earnings",    href: "/owner/reports",        icon: TrendingUp,     isBadge: false },
  { name: "Updates",     href: "/owner/request-edit",   icon: Edit3,          isBadge: false },
  { name: "Profile",     href: "/owner/profile",        icon: User,           isBadge: false },
]

type Props = {
  notificationBadge: number
  onNavigate?: () => void
}

export function OwnerSidebarNav({ notificationBadge, onNavigate }: Props) {
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
              onClick={onNavigate}
              className={`flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors duration-150 group ${
                isActive
                  ? "bg-[#1B3A5C] text-[#FFFDF8]"
                  : "text-[#1B3A5C]/55 hover:bg-[#F5F1E8] hover:text-[#1B3A5C]"
              }`}
            >
              <item.icon
                className={`h-4 w-4 flex-shrink-0 ${
                  isActive ? "text-[#FFFDF8]" : "text-[#1B3A5C]/35 group-hover:text-[#1B3A5C]/70"
                }`}
              />
              <span className={`text-[13px] flex-1 ${isActive ? "font-semibold" : "font-medium"}`}>
                {item.name}
              </span>
              {badge > 0 && (
                <span className={`min-w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center px-1.5 leading-none ${
                  isActive
                    ? "bg-[#C9A96E] text-[#1B3A5C]"
                    : "bg-[#1B3A5C]/8 text-[#1B3A5C]/60"
                }`}>
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
            className={`inline-flex items-center gap-2 whitespace-nowrap px-3 py-2 text-[10px] font-medium border-b-2 transition-colors ${
              isActive
                ? "border-[#C9A96E] text-[#1B3A5C]"
                : "border-transparent text-[#1B3A5C]/40 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/20"
            }`}
          >
            <item.icon className="h-3.5 w-3.5" />
            <span>{item.name}</span>
            {badge > 0 && (
              <span className="min-w-4 text-center text-[8px] font-bold text-[#1B3A5C] bg-[#1B3A5C]/8 px-1 rounded-full">
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}
