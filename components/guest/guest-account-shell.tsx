"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Calendar, Heart, Star, UserCircle, Bell,
  MessageSquare, ArrowRight, Home, LogOut, Menu, X,
} from "lucide-react"
import { signOutToHome } from "@/lib/auth-actions"

const NAV_ITEMS = [
  { href: "/account",               label: "Overview",       icon: Home         },
  { href: "/account/bookings",      label: "Reservations",   icon: Calendar     },
  { href: "/account/wishlist",      label: "Collection",     icon: Heart        },
  { href: "/account/reviews",       label: "Reviews",        icon: Star         },
  { href: "/account/messages",      label: "Messages",       icon: MessageSquare },
  { href: "/account/notifications", label: "Notifications",  icon: Bell         },
  { href: "/account/profile",       label: "Profile",        icon: UserCircle   },
]

type Props = {
  userName: string | null | undefined
  userInitial: string
  unreadNotifications: number
}

export function GuestAccountShell({ userName, userInitial, unreadNotifications }: Props) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const closeDrawer = () => setIsDrawerOpen(false)

  return (
    <>
      {/* ─── Mobile overlay ─── */}
      <div
        className={`fixed inset-0 z-40 bg-[#1B3A5C]/30 backdrop-blur-[2px] lg:hidden transition-opacity duration-250 ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* ─── Mobile drawer ─── */}
      <div
        className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-[#FFFDF8] lg:hidden"
        style={{
          transform: isDrawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 250ms cubic-bezier(0.25, 1, 0.5, 1)",
          borderRight: "1px solid rgba(27,58,92,0.08)",
        }}
      >
        {/* Drawer header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#1B3A5C]/5 shrink-0">
          <Link href="/" onClick={closeDrawer}>
            <Image src="/logo.png" alt="Salt Route" width={60} height={28} className="object-contain" />
          </Link>
          <button
            onClick={closeDrawer}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#1B3A5C]/40 hover:text-[#1B3A5C] hover:bg-[#F5F1E8] transition-colors"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer: user greeting */}
        <div className="px-6 py-5 border-b border-[#1B3A5C]/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1B3A5C]/5 flex items-center justify-center border border-[#1B3A5C]/8 shrink-0">
              <span className="font-display text-lg text-[#1B3A5C]/60">{userInitial}</span>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] text-[#1B3A5C]/30 font-medium mb-0.5">Welcome back</p>
              <p className="font-display text-base text-[#1B3A5C]">{userName}</p>
            </div>
          </div>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isNotif = item.href === "/account/notifications"
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeDrawer}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#1B3A5C]/55 hover:text-[#1B3A5C] hover:bg-[#F5F1E8] transition-colors group"
              >
                <Icon className="h-4 w-4 stroke-[1.5] text-[#1B3A5C]/30 group-hover:text-[#1B3A5C]/60 transition-colors shrink-0" />
                <span className="text-[13px] font-medium flex-1">{item.label}</span>
                {isNotif && unreadNotifications > 0 && (
                  <span className="min-w-5 h-5 rounded-full bg-[#1B3A5C] text-[#FFFDF8] text-[9px] flex items-center justify-center font-bold px-1.5">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Drawer footer */}
        <div className="border-t border-[#1B3A5C]/5 p-4 shrink-0 space-y-2">
          <Link
            href="/properties"
            onClick={closeDrawer}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-[#1B3A5C]/10 text-[#1B3A5C]/55 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/25 transition-colors"
          >
            <span className="text-[11px] uppercase tracking-[0.2em] font-medium">Browse Stays</span>
            <ArrowRight className="h-3.5 w-3.5 stroke-[1.5]" />
          </Link>
          <form action={signOutToHome}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[#1B3A5C]/40 hover:text-[#1B3A5C] hover:bg-[#F5F1E8] transition-colors"
            >
              <LogOut className="h-3.5 w-3.5 stroke-[1.5]" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-medium">Sign Out</span>
            </button>
          </form>
        </div>
      </div>

      {/* ─── Top nav bar ─── */}
      <header className="sticky top-0 z-30 bg-[#FFFDF8]/90 backdrop-blur-lg border-b border-[#1B3A5C]/5">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="h-20 flex items-center justify-between gap-4">

            {/* Left: Logo + portal label */}
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#1B3A5C]/50 hover:text-[#1B3A5C] hover:bg-[#F5F1E8] transition-colors"
                onClick={() => setIsDrawerOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-4 w-4" />
              </button>

              <Link href="/" className="flex items-center gap-4">
                <Image src="/logo.png" alt="Salt Route" width={60} height={28} className="object-contain" />
                <span className="hidden md:block w-px h-6 bg-[#1B3A5C]/10" />
                <span className="hidden md:block text-[9px] uppercase tracking-[0.3em] text-[#1B3A5C]/40 font-medium">
                  Guest Journey
                </span>
              </Link>
            </div>

            {/* Center: Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isNotif = item.href === "/account/notifications"
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative px-3.5 py-2 text-[10px] uppercase tracking-[0.2em] text-[#1B3A5C]/50 hover:text-[#1B3A5C] flex items-center gap-2 group transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 stroke-[1.5] text-[#1B3A5C]/30 group-hover:text-[#1B3A5C]/60 transition-colors" />
                    <span>{item.label}</span>
                    {isNotif && unreadNotifications > 0 && (
                      <span className="absolute -top-0.5 right-0.5 min-w-4 h-4 rounded-full bg-[#1B3A5C] text-[#FFFDF8] text-[8px] flex items-center justify-center font-bold px-1">
                        {unreadNotifications > 9 ? "9+" : unreadNotifications}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Right: actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/properties"
                className="hidden sm:flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-[#1B3A5C]/40 hover:text-[#1B3A5C] transition-colors"
              >
                <span>Browse Stays</span>
                <ArrowRight className="w-3 h-3 stroke-[1.5]" />
              </Link>
              <form action={signOutToHome}>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 border border-[#1B3A5C]/10 text-[9px] uppercase tracking-[0.2em] text-[#1B3A5C]/50 hover:border-[#1B3A5C]/25 hover:text-[#1B3A5C] transition-colors rounded"
                >
                  <LogOut className="w-3 h-3 stroke-[1.5]" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
