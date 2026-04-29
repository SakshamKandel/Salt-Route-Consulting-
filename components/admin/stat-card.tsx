import { LucideIcon } from "lucide-react"
import Link from "next/link"
import { ReactNode } from "react"

export type AccentColor = "neutral" | "blue" | "purple" | "amber" | "green" | "red" | "gold"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: ReactNode
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  accent?: AccentColor
  href?: string
}

export function StatCard({ title, value, icon: Icon, description, trend, trendValue, href }: StatCardProps) {
  const inner = (
    <div className="bg-[#FFFDF8] border border-[#1B3A5C]/8 rounded-xl p-5 hover:border-[#1B3A5C]/15 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <Icon className="w-4 h-4 text-[#1B3A5C]/30" />
        {trendValue && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            trend === "up"   ? "bg-emerald-50 text-emerald-600" :
            trend === "down" ? "bg-red-50 text-red-500" :
            "bg-[#F5F1E8] text-[#1B3A5C]/50"
          }`}>
            {trend === "up" ? "↑ " : trend === "down" ? "↓ " : ""}{trendValue}
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold text-[#1B3A5C] tabular-nums leading-tight">{value}</p>
      <p className="text-[11px] text-[#1B3A5C]/45 mt-1 uppercase tracking-[0.2em] font-medium">{title}</p>
      {description && <p className="text-xs text-[#1B3A5C]/35 mt-1.5">{description}</p>}
    </div>
  )

  if (href) return <Link href={href} className="block">{inner}</Link>
  return inner
}
