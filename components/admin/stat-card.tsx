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
    <Card className="shadow-sm border-slate-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-500 tracking-wide">{title}</h3>
          <div className="p-2 bg-slate-100 rounded-md">
            <Icon className="w-4 h-4 text-slate-700" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-bold text-slate-900">{value}</h2>
          {trendValue && (
            <span className={`text-sm font-medium ${
              trend === "up" ? "text-green-600" : 
              trend === "down" ? "text-red-600" : "text-gray-500"
            }`}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : ""} {trendValue}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-slate-500 mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
