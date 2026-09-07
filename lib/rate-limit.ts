import { redis } from './redis'

interface RateLimitConfig {
  /** Unique identifier (e.g. IP address, user ID) */
  identifier: string
  /** Maximum number of requests allowed */
  limit?: number
  /** Time window in seconds */
  window?: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

/**
 * Sliding-window rate limiter backed by Redis.
 * Default: 10 requests per 60-second window.
 */
export async function rateLimit({
  identifier,
  limit = 10,
  window = 60,
}: RateLimitConfig): Promise<RateLimitResult> {
  const redisUrl = process.env.REDIS_URL
  // If Redis is not configured or is pointing to localhost on Vercel/production, bypass gracefully
  if (!redisUrl || (process.env.VERCEL && redisUrl.includes('localhost')) || (process.env.NODE_ENV === 'production' && redisUrl.includes('localhost'))) {
    return { success: true, remaining: limit, reset: 0 }
  }

  const key = `rate-limit:${identifier}`
  const now = Date.now()
  const windowStart = now - window * 1000

  try {
    const pipeline = redis.pipeline()

    // Remove expired entries
    pipeline.zremrangebyscore(key, 0, windowStart)
    // Add current request
    pipeline.zadd(key, now, `${now}-${Math.random()}`)
    // Count requests in window
    pipeline.zcard(key)
    // Set expiry on the key
    pipeline.expire(key, window)

    const results = await pipeline.exec()

    // zcard result is at index 2
    const requestCount = (results?.[2]?.[1] as number) ?? 0
    const remaining = Math.max(0, limit - requestCount)

    return {
      success: requestCount <= limit,
      remaining,
      reset: Math.ceil(window - (now - windowStart) / 1000),
    }
  } catch {
    // Redis unavailable — gracefully allow request to proceed without blocking
    return { success: true, remaining: limit, reset: 0 }
  }
}
