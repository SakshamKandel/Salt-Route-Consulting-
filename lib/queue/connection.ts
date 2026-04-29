import Redis from "ioredis"

// BullMQ requires maxRetriesPerRequest: null — cannot reuse the shared redis client
export function makeBullConnection() {
  return new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  })
}
