"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { cloudinary } from "@/lib/cloudinary"

export async function deleteGuestReviewAction(reviewId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { images: true },
    })

    if (!review) return { error: "Review not found" }
    if (review.guestId !== session.user.id) return { error: "Unauthorized" }

    // Delete images from Cloudinary
    if (review.images.length > 0) {
      await Promise.all(
        review.images.map(async (img) => {
          if (img.publicId) {
            try {
              await cloudinary.uploader.destroy(img.publicId)
            } catch (err) {
              console.error("[GUEST_REVIEW_MEDIA_DELETE_ERROR]", err)
            }
          }
        })
      )
    }

    await prisma.review.delete({ where: { id: reviewId } })

    revalidatePath("/account/reviews")
    revalidatePath("/properties") // Revalidate public pages where reviews appear
    return { success: true }
  } catch (err) {
    console.error("[DELETE_GUEST_REVIEW_ERROR]", err)
    return { error: "We could not remove the review yet." }
  }
}
