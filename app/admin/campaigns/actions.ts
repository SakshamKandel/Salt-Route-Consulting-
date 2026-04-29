"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { createAuditLog } from "@/lib/audit"
import { emailQueue } from "@/lib/queue"
import { segmentToWhere, type SegmentSpec } from "@/lib/admin/segments"
import { CampaignStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { render } from "@react-email/render"
import CampaignEmail from "@/emails/CampaignEmail"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized")
  return session
}

export async function createCampaignAction(data: {
  name: string
  subject: string
  body: string
  segment: SegmentSpec
  scheduledAt?: string
}) {
  const session = await requireAdmin()
  const campaign = await prisma.campaign.create({
    data: {
      name: data.name,
      subject: data.subject,
      body: data.body,
      segment: data.segment as never,
      status: CampaignStatus.DRAFT,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      createdById: session.user.id,
    },
  })
  revalidatePath("/admin/campaigns")
  return { success: true, id: campaign.id }
}

export async function previewSegmentCountAction(segment: SegmentSpec) {
  await requireAdmin()
  const count = await prisma.user.count({ where: segmentToWhere(segment) })
  return { count }
}

export async function enqueueCampaignAction(campaignId: string) {
  const session = await requireAdmin()
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } })
  if (!campaign) return { error: "Campaign not found" }
  if (campaign.status !== CampaignStatus.DRAFT && campaign.status !== CampaignStatus.PAUSED) {
    return { error: "Campaign is not in a queuable state." }
  }

  const segment = campaign.segment as unknown as SegmentSpec
  const users = await prisma.user.findMany({
    where: segmentToWhere(segment),
    select: { id: true, email: true, name: true },
  })

  if (users.length === 0) return { error: "No recipients match this segment." }

  const html = await render(
    CampaignEmail({ subject: campaign.subject, body: campaign.body }) as never
  )

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: CampaignStatus.QUEUED,
      totalCount: users.length,
      startedAt: new Date(),
    },
  })

  const CHUNK = 500
  for (let i = 0; i < users.length; i += CHUNK) {
    const chunk = users.slice(i, i + CHUNK)
    const recipientRows = await prisma.$transaction(
      chunk.map((u) =>
        prisma.campaignRecipient.upsert({
          where: { campaignId_email: { campaignId, email: u.email } } as never,
          update: {},
          create: {
            campaignId,
            userId: u.id,
            email: u.email,
            status: "PENDING",
          },
        })
      )
    )

    await emailQueue.addBulk(
      recipientRows.map((r) => ({
        name: `campaign:${campaignId}:${r.id}`,
        data: {
          to: r.email,
          subject: campaign.subject,
          html,
          campaignId,
          recipientId: r.id,
        },
      }))
    )
  }

  await createAuditLog({
    action: "CAMPAIGN_SEND",
    entity: "CAMPAIGN",
    entityId: campaignId,
    userId: session.user.id,
    details: { name: campaign.name, recipientCount: users.length },
  })

  revalidatePath("/admin/campaigns")
  revalidatePath(`/admin/campaigns/${campaignId}`)
  return { success: true, count: users.length }
}

export async function pauseCampaignAction(campaignId: string) {
  await requireAdmin()
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: CampaignStatus.PAUSED },
  })
  revalidatePath(`/admin/campaigns/${campaignId}`)
  return { success: true }
}

export async function cancelCampaignAction(campaignId: string) {
  await requireAdmin()

  // Remove jobs that haven't been picked up by the worker yet
  const jobs = await emailQueue.getJobs(["waiting", "delayed", "paused"])
  const pending = jobs.filter((j) => j.data.campaignId === campaignId)
  await Promise.all(pending.map((j) => j.remove()))

  // Mark any still-PENDING recipients so the UI reflects the cancellation
  await prisma.campaignRecipient.updateMany({
    where: { campaignId, status: "PENDING" },
    data: { status: "FAILED", errorMsg: "Campaign cancelled", failedAt: new Date() },
  })

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: CampaignStatus.FAILED },
  })
  revalidatePath(`/admin/campaigns/${campaignId}`)
  return { success: true }
}
