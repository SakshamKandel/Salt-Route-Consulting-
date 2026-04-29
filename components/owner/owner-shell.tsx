"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, LogOut, Bell } from "lucide-react"
import { OwnerSidebarNav } from "./OwnerSidebarNav"
import { signOutToLogin } from "@/lib/auth-actions"

type Props = {
  userName: string | null | undefined
  userImage: string | null | undefined
  userInitials: string
  firstName: string
  unreadNotifications: number
  children: React.ReactNode
}

export function OwnerShell({ userName, userImage, userInitials, firstName, unreadNotifications, children }: Props) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const closeDrawer = () => setIsDrawerOpen(false)

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-[#FBF9F4]">

      {/* ─── Mobile overlay ─── */}
      <div
        className={`fixed inset-0 z-30 bg-[#1B3A5C]/30 backdrop-blur-[2px] md:hidden transition-opacity duration-250 ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* ─── Mobile drawer ─── */}
      <div
        className="fixed inset-y-0 left-0 z-40 w-72 flex flex-col bg-[#FFFDF8] border-r border-[#1B3A5C]/8 md:hidden"
        style={{
          transform: isDrawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 250ms cubic-bezier(0.25, 1, 0.5, 1)",
        }}
      >
        {/* Drawer header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1B3A5C]/8 shrink-0">
          <Link href="/" onClick={closeDrawer}>
            <Image src="/logo.png" alt="Salt Route" width={80} height={36} className="object-contain" />
          </Link>
          <button
            onClick={closeDrawer}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#1B3A5C]/40 hover:text-[#1B3A5C] hover:bg-[#F5F1E8] transition-colors"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer user */}
        <div className="px-4 py-4 border-b border-[#1B3A5C]/5 shrink-0">
          <div className="flex items-center gap-3">
            <OwnerAvatar image={userImage} initials={userInitials} />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#1B3A5C] truncate">{userName}</p>
              <p className="text-[9px] text-[#1B3A5C]/40 uppercase tracking-[0.3em]">Property Partner</p>
            </div>
          </div>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <OwnerSidebarNav notificationBadge={unreadNotifications} onNavigate={closeDrawer} />
        </nav>

        {/* Drawer sign out */}
        <div className="border-t border-[#1B3A5C]/5 p-3 shrink-0">
          <form action={signOutToLogin}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[#1B3A5C]/40 hover:text-[#1B3A5C] hover:bg-[#F5F1E8] transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-medium">Sign Out</span>
            </button>
          </form>
        </div>
      </div>

      {/* ─── Desktop sidebar ─── */}
      <aside className="w-[240px] flex-col hidden md:flex shrink-0 bg-[#FFFDF8] border-r border-[#1B3A5C]/8 overflow-hidden">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-[#1B3A5C]/8 shrink-0">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Salt Route" width={80} height={36} className="object-contain" />
          </Link>
        </div>

        {/* Portal label */}
        <div className="px-5 pt-5 pb-3 shrink-0">
          <p className="text-[9px] font-medium uppercase tracking-[0.35em] text-[#1B3A5C]/30">Owner Portal</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3">
          <OwnerSidebarNav notificationBadge={unreadNotifications} />
        </nav>

        {/* User */}
        <div className="border-t border-[#1B3A5C]/8 p-3 shrink-0">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <OwnerAvatar image={userImage} initials={userInitials} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#1B3A5C] truncate">{userName}</p>
              <p className="text-[9px] text-[#1B3A5C]/40 uppercase tracking-[0.3em] mt-0.5">Property Partner</p>
            </div>
            <form action={signOutToLogin}>
              <button
                type="submit"
                className="text-[#1B3A5C]/25 hover:text-[#B84040] transition-colors p-1"
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* ─── Main area ─── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className="h-14 bg-[#FFFDF8] border-b border-[#1B3A5C]/8 flex items-center justify-between px-4 sm:px-6 shrink-0">
          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#1B3A5C]/50 hover:text-[#1B3A5C] hover:bg-[#F5F1E8] transition-colors"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Desktop: welcome label */}
          <div className="hidden md:flex items-center gap-2">
            <p className="text-[11px] font-medium text-[#1B3A5C]/50">
              Your properties, <span className="text-[#1B3A5C] font-semibold">{firstName}</span>
            </p>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <Link
              href="/owner/notifications"
              className="relative w-9 h-9 rounded-lg flex items-center justify-center text-[#1B3A5C]/40 hover:text-[#1B3A5C] hover:bg-[#F5F1E8] transition-colors"
              aria-label={`Notifications${unreadNotifications > 0 ? `, ${unreadNotifications} unread` : ""}`}
            >
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -right-0.5 -top-0.5 min-w-[16px] h-4 rounded-full bg-[#B84040] text-[#FFFDF8] text-[9px] font-bold flex items-center justify-center px-1 leading-none">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </Link>

            <div className="h-5 w-px bg-[#1B3A5C]/8 mx-1.5" />

            <Link href="/properties" className="hidden sm:flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-[#1B3A5C]/40 hover:text-[#1B3A5C] transition-colors px-2">
              View Stays
            </Link>

            <div className="flex items-center gap-2">
              <OwnerAvatar image={userImage} initials={userInitials} />
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-[#1B3A5C]">{userName}</p>
                <p className="text-[9px] text-[#1B3A5C]/40 uppercase tracking-[0.3em]">Owner</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#FBF9F4] p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function OwnerAvatar({
  image,
  initials,
}: {
  image: string | null | undefined
  initials: string
}) {
  return (
    <div className="w-8 h-8 rounded-full bg-[#1B3A5C] flex items-center justify-center shrink-0 overflow-hidden">
      {image ? (
        <img src={image} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="text-xs font-bold text-[#C9A96E] uppercase">{initials}</span>
      )}
    </div>
  )
}
