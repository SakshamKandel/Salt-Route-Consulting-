"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import type { DayPoint } from "@/lib/admin/analytics"

export function BookingsBarChart({ data }: { data: DayPoint[] }) {
  const aggregated = data.reduce<{ date: string; count: number }[]>((acc, d) => {
    const existing = acc.find((x) => x.date === d.date)
    if (existing) existing.count += d.count
    else acc.push({ date: d.date, count: d.count })
    return acc
  }, [])

  const formatDate = (d: string) => {
    const [, , day] = d.split("-")
    return day
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={aggregated} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={30}
        />
        <Tooltip
          formatter={(v) => [Number(v ?? 0), "Bookings"]}
          contentStyle={{
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        <Bar dataKey="count" fill="#C9A96E" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
