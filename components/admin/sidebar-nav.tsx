"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart2, Home, Calendar, MessageSquare,
  FileText, Users, Send, Mail, Settings, Building2,
} from "lucide-react"

const NAV_GROUPS = [
  {
    label: "Main",
    items: [
      { name: "Dashboard",   href: "/admin/dashboard",   icon: BarChart2  },
      { name: "Properties",  href: "/admin/properties",  icon: Building2  },
      { name: "Bookings",    href: "/admin/bookings",    icon: Calendar   },
      { name: "Inquiries",   href: "/admin/inquiries",   icon: MessageSquare },
    ],
  },
  {
    label: "Manage",
    items: [
      { name: "Reviews",     href: "/admin/reviews",     icon: FileText },
      { name: "Users",       href: "/admin/users",       icon: Users    },
      { name: "Owners",      href: "/admin/owners",      icon: Users    },
    ],
  },
  {
    label: "Marketing",
    items: [
      { name: "Campaigns",   href: "/admin/campaigns",   icon: Send },
      { name: "Invitations", href: "/admin/invitations", icon: Mail },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Reports",     href: "/admin/reports",     icon: BarChart2 },
      { name: "Settings",    href: "/admin/settings",    icon: Settings  },
    ],
  },
]

type SidebarNavProps = {
  isCollapsed?: boolean
  onNavigate?: () => void
}

export function SidebarNav({ isCollapsed = false, onNavigate }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <div className={isCollapsed ? "space-y-1" : "space-y-5"}>
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          {!isCollapsed && (
            <p className="text-[9px] font-medium text-[#1B3A5C]/30 uppercase tracking-[0.3em] px-2 mb-2 mt-1 first:mt-0">
              {group.label}
            </p>
          )}
          {isCollapsed && <div className="h-px bg-[#1B3A5C]/5 mx-2 mb-1 mt-3 first:hidden" />}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/")
              const Icon = item.icon
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center gap-3 rounded-lg transition-colors duration-150 group ${
                      isCollapsed ? "h-9 w-9 justify-center mx-auto" : "px-2 py-2.5"
                    } ${
                      active
                        ? "bg-[#1B3A5C] text-[#FFFDF8]"
                        : "text-[#1B3A5C]/55 hover:bg-[#F5F1E8] hover:text-[#1B3A5C]"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        active ? "text-[#FFFDF8]" : "text-[#1B3A5C]/35 group-hover:text-[#1B3A5C]/70"
                      }`}
                    />
                    {!isCollapsed && (
                      <span className={`text-[13px] ${active ? "font-semibold" : "font-medium"}`}>
                        {item.name}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

export function MobileNav() {
  const pathname = usePathname()
  const allItems = NAV_GROUPS.flatMap((g) => g.items)

  return (
    <nav className="md:hidden bg-[#FFFDF8] border-b border-[#1B3A5C]/5 shrink-0 overflow-x-auto">
      <div className="flex min-w-max px-4">
        {allItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-3 text-[11px] font-medium border-b-2 transition-colors ${
                active
                  ? "border-[#C9A96E] text-[#1B3A5C]"
                  : "border-transparent text-[#1B3A5C]/40 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/20"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.name}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
