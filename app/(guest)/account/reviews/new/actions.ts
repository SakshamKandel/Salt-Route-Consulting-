"use server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createReviewSchema = z.object({
  bookingId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10),
})

export async function createReviewAction(data: z.infer<typeof createReviewSchema>) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    const validated = createReviewSchema.parse(data)

    const booking = await prisma.booking.findUnique({
      where: { id: validated.bookingId }
    })

    if (!booking || booking.guestId !== session.user.id || booking.status !== "COMPLETED") {
      return { error: "Invalid booking for review. Make sure your stay is completed." }
    }

    const existingReview = await prisma.review.findFirst({
      where: { guestId: session.user.id, propertyId: booking.propertyId }
    })

    if (existingReview) {
      return { error: "You have already reviewed this property." }
    }

    await prisma.review.create({
      data: {
        rating: validated.rating,
        comment: validated.comment,
        guestId: session.user.id,
        propertyId: booking.propertyId,
      }
    })

    return { success: "Review submitted!" }
  } catch {
    return { error: "Failed to submit review." }
  }
}
