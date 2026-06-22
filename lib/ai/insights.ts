import "server-only"
import { prisma } from "@/lib/db"
import { groqJson, isGroqConfigured } from "@/lib/ai/groq"
import { ACTIVE_BOOKING_STATUSES } from "@/lib/booking-lifecycle"
import { startOfMonth, subDays } from "date-fns"

export type Insight = { title: string; detail: string; tone: "positive" | "warning" | "neutral" }

/** Gather real platform metrics, then ask Groq to summarise them into insights. */
export async function generateInsights(): Promise<{ insights: Insight[]; stats: Record<string, number> }> {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const prevMonthStart = startOfMonth(subDays(monthStart, 1))
  const sevenAgo = subDays(now, 7)
  const fourteenAgo = subDays(now, 14)

  const [
    activeProperties, revenueMonth, prevRevenue, bookings7, bookingsPrev7,
    pending, cancelledMonth, completedMonth, avgRating, totalBooked, totalUnitsAgg,
  ] = await Promise.all([
    prisma.property.count({ where: { status: "ACTIVE" } }),
    prisma.booking.aggregate({ _sum: { totalPrice: true }, where: { status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] }, createdAt: { gte: monthStart } } }),
    prisma.booking.aggregate({ _sum: { totalPrice: true }, where: { status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] }, createdAt: { gte: prevMonthStart, lt: monthStart } } }),
    prisma.booking.count({ where: { createdAt: { gte: sevenAgo } } }),
    prisma.booking.count({ where: { createdAt: { gte: fourteenAgo, lt: sevenAgo } } }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { status: "CANCELLED", createdAt: { gte: monthStart } } }),
    prisma.booking.count({ where: { status: "COMPLETED", createdAt: { gte: monthStart } } }),
    prisma.review.aggregate({ _avg: { rating: true }, where: { status: "PUBLISHED" } }),
    prisma.booking.aggregate({ _sum: { units: true }, where: { status: { in: ACTIVE_BOOKING_STATUSES }, checkIn: { lte: now }, checkOut: { gte: now } } }),
    prisma.roomType.aggregate({ _sum: { totalUnits: true }, where: { active: true } }),
  ])

  const stats = {
    activeProperties,
    revenueThisMonth: Number(revenueMonth._sum.totalPrice ?? 0),
    revenuePrevMonth: Number(prevRevenue._sum.totalPrice ?? 0),
    bookingsLast7: bookings7,
    bookingsPrev7: bookingsPrev7,
    pendingRequests: pending,
    cancelledThisMonth: cancelledMonth,
    completedThisMonth: completedMonth,
    avgRating: Number((avgRating._avg.rating ?? 0).toFixed(2)),
    occupiedUnitsNow: totalBooked._sum.units ?? 0,
    totalRoomUnits: totalUnitsAgg._sum.totalUnits ?? 0,
  }

  if (!isGroqConfigured()) {
    return { insights: [{ title: "AI not configured", detail: "Add GROQ_API_KEY to enable AI insights.", tone: "neutral" }], stats }
  }

  try {
    const data = await groqJson<{ insights: Insight[] }>(
      [
        { role: "system", content: "You are a revenue & operations analyst for a boutique property-rental business in Nepal (currency NPR). Given the metrics, produce 3–4 concise, specific, actionable insights. Each insight: a short title (max 6 words) and one sentence of detail. Set tone to 'positive', 'warning', or 'neutral'. Never invent numbers not present." },
        { role: "user", content: `Metrics JSON:\n${JSON.stringify(stats, null, 2)}\n\nReturn JSON: {"insights":[{"title":"","detail":"","tone":"positive|warning|neutral"}]}` },
      ],
      { temperature: 0.5, maxTokens: 600 }
    )
    const insights = (data.insights ?? []).slice(0, 4).filter((i) => i.title && i.detail)
    return { insights: insights.length ? insights : [{ title: "Steady state", detail: "No standout signals in the current window.", tone: "neutral" }], stats }
  } catch {
    return { insights: [{ title: "Insights unavailable", detail: "Could not reach the AI service right now. Try again shortly.", tone: "warning" }], stats }
  }
}
