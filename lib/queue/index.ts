import { Queue } from "bullmq"
import { makeBullConnection } from "./connection"

export interface EmailJobData {
  to: string
  subject: string
  html: string
  campaignId: string
  recipientId: string
}

// Lazily create the queue so that simply importing this module does NOT open a
// Redis connection. On serverless (Vercel) the connection is only established
// when a route actually enqueues/reads jobs, and only if REDIS_URL is set.
const globalForQueue = globalThis as unknown as { emailQueue?: Queue<EmailJobData> }

export function getEmailQueue(): Queue<EmailJobData> {
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is not configured — email campaign queue is unavailable.")
  }
  if (!globalForQueue.emailQueue) {
    globalForQueue.emailQueue = new Queue<EmailJobData>("email-campaigns", {
      connection: makeBullConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: { count: 200 },
        removeOnFail: { count: 500 },
      },
    })
  }
  return globalForQueue.emailQueue
}
