"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bell, Settings, Menu, X, PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react"
import { SidebarNav } from "./sidebar-nav"
import { signOutToLogin } from "@/lib/auth-actions"

type Props = {
  userName: string | null | undefined
  userImage: string | null | undefined
  userInitial: string
  unreadNotifications: number
  children: React.ReactNode
}

export function AdminShell({ userName, userImage, userInitial, unreadNotifications, children }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("admin-sidebar-collapsed")
    if (stored === "true") setIsCollapsed(true)
  }, [])

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      localStorage.setItem("admin-sidebar-collapsed", String(next))
      return next
    })
  }

  const closeDrawer = () => setIsDrawerOpen(false)

  return (
    <div className="flex h-screen bg-[#FBF9F4] overflow-hidden font-sans">

      {/* ─── Mobile overlay ─── */}
      <div
        className={`fixed inset-0 z-30 bg-[#1B3A5C]/40 backdrop-blur-[2px] md:hidden transition-opacity duration-250 ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* ─── Mobile drawer ─── */}
      <div
        className="fixed inset-y-0 left-0 z-40 flex flex-col w-72 bg-[#FFFDF8] border-r border-[#1B3A5C10] md:hidden"
        style={{ transform: isDrawerOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 250ms cubic-bezier(0.25, 1, 0.5, 1)" }}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1B3A5C08] shrink-0">
          <Link href="/" onClick={closeDrawer}>
            <img src="/logo.png" alt="Salt Route" className="h-9 object-contain" />
          </Link>
          <button
            onClick={closeDrawer}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#1B3A5C]/40 hover:text-[#1B3A5C] hover:bg-[#F5F1E8] transition-colors"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <SidebarNav isCollapsed={false} onNavigate={closeDrawer} />
        </nav>

        <div className="border-t border-[#1B3A5C08] p-3 shrink-0">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <UserAvatar image={userImage} initial={userInitial} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#1B3A5C] truncate">{userName}</p>
              <p className="text-[9px] text-[#1B3A5C]/40 uppercase tracking-[0.3em] mt-0.5">Administrator</p>
            </div>
          </div>
          <form action={signOutToLogin}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-2 py-2 text-[#1B3A5C]/40 hover:text-[#1B3A5C] hover:bg-[#F5F1E8] rounded-lg transition-colors text-xs"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="font-medium">Sign out</span>
            </button>
          </form>
        </div>
      </div>

      {/* ─── Desktop sidebar ─── */}
      <aside
        className="hidden md:flex flex-col shrink-0 bg-[#FFFDF8] border-r border-[#1B3A5C10] overflow-hidden relative z-10"
        style={{
          width: mounted ? (isCollapsed ? "3.5rem" : "14rem") : "14rem",
          transition: "width 300ms cubic-bezier(0.25, 1, 0.5, 1)",
        }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center px-3 border-b border-[#1B3A5C08] shrink-0 overflow-hidden">
          <Link href="/" className="flex items-center justify-center">
            {mounted && isCollapsed ? (
              <span className="font-display text-sm font-bold text-[#1B3A5C] select-none">SR</span>
            ) : (
              <img src="/logo.png" alt="Salt Route" className="h-9 object-contain" />
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <SidebarNav isCollapsed={mounted && isCollapsed} />
        </nav>

        {/* User + collapse toggle */}
        <div className="border-t border-[#1B3A5C08] shrink-0">
          <div className={`flex items-center gap-2.5 px-3 py-3 overflow-hidden ${mounted && isCollapsed ? "justify-center" : ""}`}>
            <UserAvatar image={userImage} initial={userInitial} size="sm" />
            {(!mounted || !isCollapsed) && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#1B3A5C] truncate">{userName}</p>
                <p className="text-[9px] text-[#1B3A5C]/40 uppercase tracking-[0.3em] mt-0.5">Administrator</p>
              </div>
            )}
            {(!mounted || !isCollapsed) && (
              <form action={signOutToLogin}>
                <button
                  type="submit"
                  className="text-[#1B3A5C]/25 hover:text-[#B84040] transition-colors p-1"
                  aria-label="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>

          <button
            onClick={toggleCollapse}
            className={`w-full flex items-center gap-2 px-3 py-2.5 text-[#1B3A5C]/30 hover:text-[#1B3A5C]/60 hover:bg-[#F5F1E8] transition-colors border-t border-[#1B3A5C08] ${
              mounted && isCollapsed ? "justify-center" : "justify-between"
            }`}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {(!mounted || !isCollapsed) && (
              <span className="text-[9px] uppercase tracking-[0.2em] font-medium">Collapse</span>
            )}
            {mounted && isCollapsed
              ? <PanelLeftOpen className="h-3.5 w-3.5 shrink-0" />
              : <PanelLeftClose className="h-3.5 w-3.5 shrink-0" />
            }
          </button>
        </div>
      </aside>

      {/* ─── Main content ─── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className="h-14 bg-[#FFFDF8] border-b border-[#1B3A5C10] flex items-center justify-between px-4 sm:px-6 shrink-0">
          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#1B3A5C]/50 hover:text-[#1B3A5C] hover:bg-[#F5F1E8] transition-colors"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Desktop spacer */}
          <div className="hidden md:block" />

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <Link
              href="/admin/notifications"
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

            <Link
              href="/admin/settings"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[#1B3A5C]/40 hover:text-[#1B3A5C] hover:bg-[#F5F1E8] transition-colors"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </Link>

            <div className="h-5 w-px bg-[#1B3A5C]/8 mx-1.5" />

            <div className="flex items-center gap-2.5">
              <UserAvatar image={userImage} initial={userInitial} size="md" />
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-[#1B3A5C] leading-tight">{userName}</p>
                <p className="text-[9px] text-[#1B3A5C]/40 uppercase tracking-[0.3em]">Admin</p>
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

function UserAvatar({
  image,
  initial,
  size,
}: {
  image: string | null | undefined
  initial: string
  size: "sm" | "md"
}) {
  const cls = size === "sm"
    ? "w-7 h-7 rounded-full bg-[#1B3A5C] flex items-center justify-center shrink-0 overflow-hidden"
    : "w-8 h-8 rounded-full bg-[#1B3A5C] flex items-center justify-center shrink-0 overflow-hidden"
  const textCls = size === "sm" ? "text-[11px]" : "text-xs"

  return (
    <div className={cls}>
      {image
        ? <img src={image} alt="" className="w-full h-full object-cover" />
        : <span className={`${textCls} font-bold text-[#C9A96E] uppercase`}>{initial}</span>
      }
    </div>
  )
}
