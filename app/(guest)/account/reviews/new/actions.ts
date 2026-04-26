"use server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { canReviewBooking } from "@/lib/booking-lifecycle"
import { notifyAdmins } from "@/lib/notifications"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createReviewSchema = z.object({
  bookingId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10),
  images: z.array(z.object({ url: z.string().url(), publicId: z.string().optional() })).max(5).optional(),
})

export async function createReviewAction(data: z.infer<typeof createReviewSchema>) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    const validated = createReviewSchema.parse(data)

    const booking = await prisma.booking.findUnique({
      where: { id: validated.bookingId },
      include: { property: { select: { title: true } } },
    })

    if (!booking || booking.guestId !== session.user.id || !canReviewBooking(booking)) {
      return { error: "You can only review a stay after checkout is completed." }
    }

    const existingReview = await prisma.review.findUnique({
      where: { bookingId: booking.id },
    })

    if (existingReview) {
      return { error: "You have already reviewed this stay." }
    }

    const review = await prisma.review.create({
      data: {
        rating: validated.rating,
        comment: validated.comment,
        guestId: session.user.id,
        propertyId: booking.propertyId,
        bookingId: booking.id,
        status: "PENDING",
        isApproved: false,
        ...(validated.images?.length
          ? {
              images: {
                create: validated.images.map((img) => ({
                  url: img.url,
                  publicId: img.publicId ?? null,
                })),
              },
            }
          : {}),
      },
    })

    await notifyAdmins({
      type: "REVIEW",
      title: "Review awaiting moderation",
      body: `${booking.property.title} received a new guest review.`,
      href: `/admin/reviews/${review.id}`,
      metadata: { reviewId: review.id, bookingId: booking.id },
    })

    revalidatePath("/account/reviews")
    revalidatePath(`/account/bookings/${booking.id}`)
    return { success: "Thank you for sharing your stay." }
  } catch {
    return { error: "We could not share your review yet." }
  }
}
