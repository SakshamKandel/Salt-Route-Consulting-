import { Worker } from "bullmq"
import { makeBullConnection } from "./connection"
import { sendEmail } from "@/lib/email/transporter"
import { prisma } from "@/lib/db"
import type { EmailJobData } from "./index"

export function createEmailWorker() {
  const worker = new Worker<EmailJobData>(
    "email-campaigns",
    async (job) => {
      const { to, subject, html, campaignId, recipientId } = job.data

      // Guard: abort if campaign was cancelled while this job was already active
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        select: { status: true },
      })
      if (!campaign || campaign.status === "FAILED" || campaign.status === "PAUSED") {
        return
      }

      await sendEmail({ to, subject, html })

      await prisma.campaignRecipient.update({
        where: { id: recipientId },
        data: { status: "SENT", sentAt: new Date() },
      })

      await prisma.campaign.update({
        where: { id: campaignId },
        data: { sentCount: { increment: 1 } },
      })
    },
    {
      connection: makeBullConnection(),
      concurrency: 5,
    }
  )

  worker.on("failed", async (job, err) => {
    if (!job) return
    const { campaignId, recipientId } = job.data
    console.error(`[EMAIL_WORKER] Job ${job.id} failed:`, err.message)

    await prisma.campaignRecipient.update({
      where: { id: recipientId },
      data: { status: "FAILED", failedAt: new Date(), errorMsg: err.message.slice(0, 500) },
    })

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { failedCount: { increment: 1 } },
    })
  })

  worker.on("completed", (job) => {
    console.log(`[EMAIL_WORKER] Sent to ${job.data.to}`)
  })

  return worker
}
