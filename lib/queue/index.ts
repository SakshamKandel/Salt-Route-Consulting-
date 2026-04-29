import { Queue } from "bullmq"
import { makeBullConnection } from "./connection"

export interface EmailJobData {
  to: string
  subject: string
  html: string
  campaignId: string
  recipientId: string
}

export const emailQueue = new Queue<EmailJobData>("email-campaigns", {
  connection: makeBullConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 500 },
  },
})
