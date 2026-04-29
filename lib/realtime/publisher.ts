import { redis } from "@/lib/redis"

export type AdminEventType =
  | "booking.created"
  | "booking.updated"
  | "inquiry.created"
  | "inquiry.updated"
  | "review.created"
  | "notification"
  | "stats.update"
  | "connected"

export interface AdminEvent {
  type: AdminEventType
  payload?: Record<string, unknown>
  ts?: number
}

const CHANNEL = "admin:events"

export async function publishAdminEvent(event: AdminEvent) {
  try {
    await redis.publish(CHANNEL, JSON.stringify({ ...event, ts: Date.now() }))
  } catch {
    // Never let pub/sub crash the main request
  }
}
