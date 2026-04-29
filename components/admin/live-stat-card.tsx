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
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <Icon className="w-4 h-4 text-slate-400" />
        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">Live</span>
      </div>
      <p className="text-2xl font-bold text-slate-800 tabular-nums">
        <LiveCounter initial={initial} eventType={eventType} />
      </p>
      <p className="text-sm text-slate-500 mt-0.5">{title}</p>
      {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
    </div>
  )

  if (href) return <a href={href} className="block">{inner}</a>
  return inner
}
