"use server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "@/lib/audit"

export async function approveReviewAction(id: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  try {
    await prisma.review.update({
      where: { id },
      data: { isApproved: true },
    })

    await createAuditLog({
      action: "UPDATE",
      entity: "REVIEW",
      entityId: id,
      details: { action: "approved" },
      userId: session.user.id,
    })

    revalidatePath(`/admin/reviews/${id}`)
    revalidatePath(`/admin/reviews`)
    return { success: true }
  } catch {
    return { error: "Failed to approve review." }
  }
}

export async function deleteReviewAction(id: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  try {
    await prisma.review.delete({ where: { id } })

    await createAuditLog({
      action: "DELETE",
      entity: "REVIEW",
      entityId: id,
      userId: session.user.id,
    })

    revalidatePath(`/admin/reviews`)
    return { success: true }
  } catch {
    return { error: "Failed to delete review." }
  }
}

export async function replyToReviewAction(id: string, replyText: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  try {
    await prisma.review.update({
      where: { id },
      data: { reply: replyText },
    })

    await createAuditLog({
      action: "UPDATE",
      entity: "REVIEW",
      entityId: id,
      details: { action: "replied", replyLength: replyText.length },
      userId: session.user.id,
    })

    revalidatePath(`/admin/reviews/${id}`)
    return { success: true }
  } catch {
    return { error: "Failed to save reply." }
  }
}
