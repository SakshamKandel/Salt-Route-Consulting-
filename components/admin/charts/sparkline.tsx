"use client"

import { ResponsiveContainer, LineChart, Line, Tooltip } from "recharts"

interface SparklineProps {
  data: { date: string; count: number }[]
  color?: string
  height?: number
}

export function Sparkline({ data, color = "#1B3A5C", height = 80 }: SparklineProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="count"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
        />
        <Tooltip content={() => null} />
      </LineChart>
    </ResponsiveContainer>
  )
}
