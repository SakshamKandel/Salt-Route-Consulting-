"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { createAuditLog } from "@/lib/audit"
import { ReviewStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized")
  return session
}

export async function bulkApproveReviewsAction(ids: string[]) {
  const session = await requireAdmin()
  try {
    await prisma.review.updateMany({
      where: { id: { in: ids } },
      data: { status: ReviewStatus.PUBLISHED, isApproved: true },
    })
    await createAuditLog({
      action: "BULK_UPDATE",
      entity: "REVIEW",
      userId: session.user.id,
      details: { action: "BULK_APPROVE", ids, count: ids.length },
    })
    revalidatePath("/admin/reviews")
    return { success: true, count: ids.length }
  } catch {
    return { error: "Failed to approve reviews." }
  }
}

export async function bulkHideReviewsAction(ids: string[]) {
  const session = await requireAdmin()
  try {
    await prisma.review.updateMany({
      where: { id: { in: ids } },
      data: { status: ReviewStatus.HIDDEN, isApproved: false },
    })
    await createAuditLog({
      action: "BULK_UPDATE",
      entity: "REVIEW",
      userId: session.user.id,
      details: { action: "BULK_HIDE", ids, count: ids.length },
    })
    revalidatePath("/admin/reviews")
    return { success: true, count: ids.length }
  } catch {
    return { error: "Failed to hide reviews." }
  }
}
