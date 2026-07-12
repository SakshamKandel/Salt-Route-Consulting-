import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { Star, Trash, PenLine, Quote } from "lucide-react"
import { WriteReviewForm } from "./WriteReviewForm"
import { canReviewBooking } from "@/lib/booking-lifecycle"
import { ReviewImageGallery } from "@/components/public/ReviewImageGallery"
import { getPagination, parsePage } from "@/lib/pagination"
import { deleteGuestReviewAction } from "./actions"
import { PaginationControls } from "@/components/shared/pagination-controls"

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()
  if (!session?.user?.id) return redirect("/login")
  const params = await searchParams
  const requestedPage = parsePage(params.page)
  const [total, reviewedRows] = await Promise.all([
    prisma.review.count({ where: { guestId: session.user.id } }),
    prisma.review.findMany({
      where: { guestId: session.user.id, bookingId: { not: null } },
      select: { bookingId: true },
    }),
  ])
  const pagination = getPagination(requestedPage, total)

  const reviewedBookingIds = reviewedRows.map((review) => review.bookingId).filter(Boolean) as string[]
  const [reviews, reviewableBookings] = await Promise.all([
    prisma.review.findMany({
      where: { guestId: session.user.id },
      select: {
        id: true,
        rating: true,
        comment: true,
        status: true,
        createdAt: true,
        property: { select: { title: true } },
        images: true,
      },
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.booking.findMany({
      where: {
        guestId: session.user.id,
        status: "COMPLETED",
        checkedOutAt: { not: null },
        id: { notIn: reviewedBookingIds },
      },
      select: {
        id: true,
        status: true,
        checkedOutAt: true,
        property: { select: { id: true, title: true } },
      },
      orderBy: { checkOut: "desc" },
      take: 10,
    }),
  ])
  const eligibleBookings = reviewableBookings.filter(canReviewBooking)

  return (
    <div className="space-y-10">

      {/* ─── PAGE HEADER ─── */}
      <div>
        <p className="text-[11px] font-medium text-[#C9A96E] uppercase tracking-[0.18em] mb-1.5">
          Guest Reflections
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-[#1B3A5C] tracking-wide">
          Your Reviews
        </h1>
        <p className="text-[13px] text-[#1B3A5C]/60 mt-2">
          Your words help future guests feel the place before they arrive.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* ─── LEFT: WRITE REVIEWS ─── */}
        <div className="lg:col-span-4 space-y-5">
          <h2 className="text-lg font-semibold text-[#1B3A5C]">Awaiting your note</h2>

          {eligibleBookings.length > 0 ? (
            <div className="space-y-5">
              {eligibleBookings.map((booking) => (
                <div key={booking.id} className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-6 sm:p-7">
                  <WriteReviewForm
                    bookingId={booking.id}
                    propertyName={booking.property.title}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl py-12 px-6 text-center">
              <PenLine className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-3" strokeWidth={1.5} />
              <p className="font-display text-lg text-[#1B3A5C] tracking-wide mb-1">All caught up</p>
              <p className="text-[13px] text-[#1B3A5C]/60">No stays awaiting a review.</p>
            </div>
          )}
        </div>

        {/* ─── RIGHT: PUBLISHED REVIEWS ─── */}
        <div className="lg:col-span-8 space-y-5">
          <h2 className="text-lg font-semibold text-[#1B3A5C]">My reviews</h2>

          {reviews.length === 0 ? (
            <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl py-16 text-center">
              <Quote className="h-8 w-8 text-[#1B3A5C]/15 mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="font-display text-xl text-[#1B3A5C] tracking-wide mb-1.5">No reviews yet</h3>
              <p className="text-[13px] text-[#1B3A5C]/60">Your review history will appear here.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {reviews.map((review) => (
                <div key={review.id} className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-6 sm:p-8 hover:border-[#1B3A5C]/15 transition-colors">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-5 mb-6">
                    <div>
                      <p className="text-[11px] text-[#C9A96E] uppercase tracking-[0.18em] font-medium mb-1.5">Property Reviewed</p>
                      <h3 className="font-display text-xl md:text-2xl text-[#1B3A5C] tracking-wide mb-2.5">{review.property.title}</h3>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            className={i < review.rating ? "text-[#C9A96E] fill-[#C9A96E]" : "text-[#1B3A5C]/10"}
                            strokeWidth={1.5}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className={`inline-flex items-center rounded-full text-[11px] font-semibold border uppercase tracking-[0.15em] px-2.5 py-1 ${
                        review.status === "PUBLISHED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                          : "bg-amber-50 text-amber-700 border-amber-200/60"
                      }`}>
                        {review.status}
                      </span>

                      <form action={async () => {
                        "use server"
                        await deleteGuestReviewAction(review.id)
                      }}>
                        <button
                          type="submit"
                          className="w-9 h-9 rounded-full border border-[#1B3A5C]/10 flex items-center justify-center text-[#1B3A5C]/30 hover:text-rose-500 hover:border-rose-200 transition-colors"
                          title="Remove Review"
                        >
                          <Trash size={13} strokeWidth={1.5} />
                        </button>
                      </form>
                    </div>
                  </div>

                  <div>
                    <blockquote className="text-[15px] text-[#1B3A5C]/75 leading-relaxed italic border-l-2 border-[#C9A96E]/30 pl-5">
                      &ldquo;{review.comment}&rdquo;
                    </blockquote>

                    {review.images && review.images.length > 0 && (
                      <ReviewImageGallery images={review.images} />
                    )}
                  </div>

                  <div className="mt-6 pt-5 border-t border-[#1B3A5C]/5">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#1B3A5C]/55 font-medium">
                      Submitted on {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <PaginationControls
            basePath="/account/reviews"
            page={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={total}
            startItem={pagination.startItem}
            endItem={pagination.endItem}
            label="reviews"
          />
        </div>

      </div>
    </div>
  )
}
