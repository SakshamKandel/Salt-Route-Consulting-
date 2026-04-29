import { prisma } from "@/lib/db"
import { redis } from "@/lib/redis"

const TTL = 300 // 5 minutes

async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  try {
    const hit = await redis.get(key)
    if (hit) return JSON.parse(hit) as T
  } catch {
    // Redis unavailable — skip cache
  }
  const result = await fn()
  try {
    await redis.set(key, JSON.stringify(result), "EX", TTL)
  } catch {}
  return result
}

export interface DayPoint {
  date: string  // YYYY-MM-DD
  count: number
  revenue: number
}

export interface MonthPoint {
  month: string // YYYY-MM
  count: number
  revenue: number
}

export interface PropertyOccupancy {
  title: string
  bookings: number
  revenue: number
}

export async function bookingsByDay(start: Date, end: Date): Promise<DayPoint[]> {
  const key = `analytics:bookings:day:${start.toISOString()}:${end.toISOString()}`
  return cached(key, async () => {
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { notIn: ["CANCELLED"] },
      },
      select: { createdAt: true, totalPrice: true },
    })

    const map = new Map<string, { count: number; revenue: number }>()
    for (const b of bookings) {
      const day = b.createdAt.toISOString().slice(0, 10)
      const existing = map.get(day) ?? { count: 0, revenue: 0 }
      map.set(day, {
        count: existing.count + 1,
        revenue: existing.revenue + Number(b.totalPrice),
      })
    }

    const result: DayPoint[] = []
    const cursor = new Date(start)
    while (cursor <= end) {
      const day = cursor.toISOString().slice(0, 10)
      const data = map.get(day) ?? { count: 0, revenue: 0 }
      result.push({ date: day, ...data })
      cursor.setDate(cursor.getDate() + 1)
    }
    return result
  })
}

export async function revenueByMonth(start: Date, end: Date): Promise<MonthPoint[]> {
  const key = `analytics:revenue:month:${start.toISOString()}:${end.toISOString()}`
  return cached(key, async () => {
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] },
      },
      select: { createdAt: true, totalPrice: true },
    })

    const map = new Map<string, { count: number; revenue: number }>()
    for (const b of bookings) {
      const month = b.createdAt.toISOString().slice(0, 7)
      const existing = map.get(month) ?? { count: 0, revenue: 0 }
      map.set(month, {
        count: existing.count + 1,
        revenue: existing.revenue + Number(b.totalPrice),
      })
    }

    return Array.from(map.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))
  })
}

export async function topProperties(limit = 10): Promise<PropertyOccupancy[]> {
  const key = `analytics:top_properties:${limit}`
  return cached(key, async () => {
    const results = await prisma.booking.groupBy({
      by: ["propertyId"],
      _count: { _all: true },
      _sum: { totalPrice: true },
      where: { status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] } },
      orderBy: { _count: { propertyId: "desc" } },
      take: limit,
    })

    const ids = results.map((r) => r.propertyId)
    const properties = await prisma.property.findMany({
      where: { id: { in: ids } },
      select: { id: true, title: true },
    })
    const titleMap = Object.fromEntries(properties.map((p) => [p.id, p.title]))

    return results.map((r) => ({
      title: titleMap[r.propertyId] ?? r.propertyId,
      bookings: r._count._all,
      revenue: Number(r._sum.totalPrice ?? 0),
    }))
  })
}

export async function kpiStats(start: Date, end: Date) {
  const key = `analytics:kpi:${start.toISOString()}:${end.toISOString()}`
  return cached(key, async () => {
    const [
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue,
      prevRevenue,
      avgRating,
    ] = await Promise.all([
      prisma.booking.count({ where: { createdAt: { gte: start, lte: end } } }),
      prisma.booking.count({ where: { status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] }, createdAt: { gte: start, lte: end } } }),
      prisma.booking.count({ where: { status: "CANCELLED", createdAt: { gte: start, lte: end } } }),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] }, createdAt: { gte: start, lte: end } },
      }),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: {
          status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] },
          createdAt: {
            gte: new Date(start.getTime() - (end.getTime() - start.getTime())),
            lt: start,
          },
        },
      }),
      prisma.review.aggregate({
        _avg: { rating: true },
        where: { status: "PUBLISHED" },
      }),
    ])

    const revenue = Number(totalRevenue._sum.totalPrice ?? 0)
    const prev = Number(prevRevenue._sum.totalPrice ?? 0)
    const revenueGrowth = prev === 0 ? null : ((revenue - prev) / prev) * 100

    return {
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      revenue,
      revenueGrowth,
      avgRating: avgRating._avg.rating ?? 0,
    }
  })
}
