"use client"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import type { MonthPoint } from "@/lib/admin/analytics"

const formatMonth = (m: string) => {
  const [year, month] = m.split("-")
  return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  })
}

const formatRevenue = (v: number) =>
  v >= 1000000
    ? `NPR ${(v / 1000000).toFixed(1)}M`
    : v >= 1000
    ? `NPR ${(v / 1000).toFixed(0)}K`
    : `NPR ${v}`

export function RevenueLineChart({ data }: { data: MonthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonth}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatRevenue}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          width={70}
        />
        <Tooltip
          formatter={(v) => [formatRevenue(Number(v ?? 0)), "Revenue"]}
          labelFormatter={(label) => formatMonth(String(label))}
          contentStyle={{
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#1B3A5C"
          strokeWidth={2}
          dot={{ fill: "#1B3A5C", r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
