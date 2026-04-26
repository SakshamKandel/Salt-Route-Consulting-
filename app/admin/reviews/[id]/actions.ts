"use server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "@/lib/audit"
import { cloudinary } from "@/lib/cloudinary"

export async function approveReviewAction(id: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  try {
    await prisma.review.update({
      where: { id },
      data: { isApproved: true, status: "PUBLISHED" },
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
    revalidatePath(`/properties`)
    return { success: true }
  } catch (err) {
    console.error("[APPROVE_REVIEW_ERROR]", err)
    return { error: "Failed to approve review." }
  }
}

export async function hideReviewAction(id: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  try {
    await prisma.review.update({
      where: { id },
      data: { isApproved: false, status: "HIDDEN" },
    })

    await createAuditLog({
      action: "UPDATE",
      entity: "REVIEW",
      entityId: id,
      details: { action: "hidden" },
      userId: session.user.id,
    })

    revalidatePath(`/admin/reviews/${id}`)
    revalidatePath(`/admin/reviews`)
    revalidatePath(`/properties`)
    return { success: true }
  } catch (err) {
    console.error("[HIDE_REVIEW_ERROR]", err)
    return { error: "Failed to hide review." }
  }
}

export async function deleteReviewAction(id: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  try {
    const review = await prisma.review.findUnique({
      where: { id },
      include: { images: true },
    })

    if (!review) return { error: "Review not found" }

    // Delete images from Cloudinary
    if (review.images.length > 0) {
      await Promise.all(
        review.images.map(async (img) => {
          if (img.publicId) {
            try {
              await cloudinary.uploader.destroy(img.publicId)
            } catch (err) {
              console.error("[REVIEW_MEDIA_DELETE_ERROR]", err)
            }
          }
        })
      )
    }

    await prisma.review.delete({ where: { id } })

    await createAuditLog({
      action: "DELETE",
      entity: "REVIEW",
      entityId: id,
      userId: session.user.id,
    })

    revalidatePath(`/admin/reviews`)
    return { success: true }
  } catch (err) {
    console.error("[DELETE_REVIEW_ERROR]", err)
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
    revalidatePath(`/properties`) // Revalidate public pages where reviews appear
    return { success: true }
  } catch (err) {
    console.error("[REPLY_REVIEW_ERROR]", err)
    if (err instanceof Error) {
      return { error: `Database Error: ${err.message}` }
    }
    return { error: "Failed to save reply to database." }
  }
}
