import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as { redis: Redis }

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

export const redis =
  globalForRedis.redis ??
  new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    commandTimeout: 2000,
    lazyConnect: true,
    enableOfflineQueue: false,
  })

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis
