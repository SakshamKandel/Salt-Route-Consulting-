"use client"

// Thin vertical bar chart (Master Key "Work Orders" style). Pure presentational.
export function MiniBars({
  data,
  color = "#1B3A5C",
  height = 110,
}: {
  data: { date: string; count: number }[]
  color?: string
  height?: number
}) {
  const max = Math.max(1, ...data.map((d) => d.count))
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d) => {
        const h = Math.max(4, Math.round((d.count / max) * (height - 6)))
        const isPeak = d.count === max && d.count > 0
        return (
          <div
            key={d.date}
            title={`${d.date}: ${d.count}`}
            className="flex-1 rounded-sm transition-all"
            style={{ height: h, backgroundColor: isPeak ? color : `${color}33` }}
          />
        )
      })}
    </div>
  )
}
