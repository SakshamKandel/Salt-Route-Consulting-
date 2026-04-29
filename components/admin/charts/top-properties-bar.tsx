"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts"
import type { PropertyOccupancy } from "@/lib/admin/analytics"

const COLORS = ["#1B3A5C", "#2d5a8e", "#3a72b2", "#4989d4", "#C9A96E"]

const truncate = (s: string, n = 16) => (s.length > n ? s.slice(0, n) + "…" : s)

export function TopPropertiesChart({ data }: { data: PropertyOccupancy[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
      >
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="title"
          tickFormatter={(t) => truncate(t)}
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip
          formatter={(v, name) => {
            const n = Number(v ?? 0)
            return [
              name === "bookings" ? `${n} bookings` : `NPR ${n.toLocaleString()}`,
              name === "bookings" ? "Bookings" : "Revenue",
            ]
          }}
          contentStyle={{ border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
        />
        <Bar dataKey="bookings" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
