"use client"

import { LiveCounter } from "./live-counter"
import { Clock, CheckCircle, MessageSquare, Home, Users, Star, Calendar } from "lucide-react"
import type { AdminEventType } from "@/lib/realtime/publisher"
import type { AccentColor } from "./stat-card"

const ICONS = { Clock, CheckCircle, MessageSquare, Home, Users, Star, Calendar } as const
export type LiveStatIconName = keyof typeof ICONS

interface LiveStatCardProps {
  title: string
  initial: number
  icon: LiveStatIconName
  eventType: AdminEventType
  description?: string
  href?: string
  accent?: AccentColor
}

export function LiveStatCard({ title, initial, icon, eventType, description, href }: LiveStatCardProps) {
  const Icon = ICONS[icon]

  const inner = (
    <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-5 hover:border-[#1B3A5C]/15 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <Icon className="w-4 h-4 text-[#1B3A5C]/30" />
        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">Live</span>
      </div>
      <p className="text-2xl font-semibold text-[#1B3A5C] tabular-nums leading-tight">
        <LiveCounter initial={initial} eventType={eventType} />
      </p>
      <p className="text-[11px] text-[#1B3A5C]/45 mt-1 uppercase tracking-[0.2em] font-medium">{title}</p>
      {description && <p className="text-xs text-[#1B3A5C]/35 mt-1.5">{description}</p>}
    </div>
  )

  if (href) return <a href={href} className="block">{inner}</a>
  return inner
}
