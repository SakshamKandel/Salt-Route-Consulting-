import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
}

export function StatCard({ title, value, icon: Icon, description, trend, trendValue }: StatCardProps) {
  return (
    <Card className="shadow-none border border-charcoal/10 rounded-none bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[9px] uppercase tracking-[0.2em] font-bold text-charcoal/60">{title}</h3>
          <div className="p-2 bg-[#FAFAFA] border border-charcoal/5">
            <Icon className="w-4 h-4 text-charcoal/60" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-display text-charcoal">{value}</h2>
          {trendValue && (
            <span className={`text-[10px] uppercase tracking-[0.1em] font-bold ${
              trend === "up" ? "text-green-600" : 
              trend === "down" ? "text-red-600" : "text-charcoal/50"
            }`}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : ""} {trendValue}
            </span>
          )}
        </div>
        {description && (
          <p className="text-[10px] uppercase tracking-[0.1em] text-charcoal/50 mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
