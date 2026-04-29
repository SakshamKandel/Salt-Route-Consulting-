"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import {
  ChartBar,
  Home,
  Calendar,
  MessageSquare,
  FileText,
  Users,
  Settings,
  Send,
  Mail,
  Bell,
  Plus,
  Search,
  X,
} from "lucide-react"

const COMMANDS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: ChartBar, group: "Navigate" },
  { label: "Properties", href: "/admin/properties", icon: Home, group: "Navigate" },
  { label: "Bookings", href: "/admin/bookings", icon: Calendar, group: "Navigate" },
  { label: "Inquiries", href: "/admin/inquiries", icon: MessageSquare, group: "Navigate" },
  { label: "Reviews", href: "/admin/reviews", icon: FileText, group: "Navigate" },
  { label: "Users", href: "/admin/users", icon: Users, group: "Navigate" },
  { label: "Owners", href: "/admin/owners", icon: Users, group: "Navigate" },
  { label: "Campaigns", href: "/admin/campaigns", icon: Send, group: "Navigate" },
  { label: "Invitations", href: "/admin/invitations", icon: Mail, group: "Navigate" },
  { label: "Reports", href: "/admin/reports", icon: ChartBar, group: "Navigate" },
  { label: "Settings", href: "/admin/settings", icon: Settings, group: "Navigate" },
  { label: "Notifications", href: "/admin/notifications", icon: Bell, group: "Navigate" },
  { label: "Add New User", href: "/admin/users/new", icon: Plus, group: "Actions" },
  { label: "Manual Booking", href: "/admin/bookings/new", icon: Plus, group: "Actions" },
  { label: "Invite Owner", href: "/admin/invitations/new", icon: Plus, group: "Actions" },
  { label: "New Campaign", href: "/admin/campaigns/new", icon: Send, group: "Actions" },
  { label: "Add Property", href: "/admin/properties/new", icon: Plus, group: "Actions" },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [])

  const handleSelect = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  if (!open) return null

  const groups = Array.from(new Set(COMMANDS.map((c) => c.group)))

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg mx-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <Command.Input
              placeholder="Search pages and actions..."
              className="flex-1 text-sm outline-none placeholder:text-slate-400 bg-transparent"
              autoFocus
            />
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <Command.List className="max-h-[380px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-slate-400">
              No results found.
            </Command.Empty>
            {groups.map((group) => (
              <Command.Group key={group} heading={group} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-slate-400">
                {COMMANDS.filter((c) => c.group === group).map((cmd) => {
                  const Icon = cmd.icon
                  return (
                    <Command.Item
                      key={cmd.href}
                      value={cmd.label}
                      onSelect={() => handleSelect(cmd.href)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 cursor-pointer aria-selected:bg-slate-100 aria-selected:text-navy"
                    >
                      <Icon className="h-4 w-4 text-slate-400 shrink-0" />
                      {cmd.label}
                    </Command.Item>
                  )
                })}
              </Command.Group>
            ))}
          </Command.List>
          <div className="border-t border-slate-100 px-4 py-2 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
              {" "}to toggle
            </span>
            <span className="text-[10px] text-slate-400">
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd>
              {" navigate · "}
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>
              {" "}select
            </span>
          </div>
        </Command>
      </div>
    </div>
  )
}
