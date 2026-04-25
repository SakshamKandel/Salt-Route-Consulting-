import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { Star, Trash, PenLine, Quote } from "lucide-react"
import { WriteReviewForm } from "./WriteReviewForm"
import { canReviewBooking } from "@/lib/booking-lifecycle"
import Image from "next/image"
import { ReviewImageGallery } from "@/components/public/ReviewImageGallery"

export default async function ReviewsPage() {
  const session = await auth()
  if (!session?.user?.id) return redirect("/login")

  const reviews = await prisma.review.findMany({
    where: { guestId: session.user.id },
    include: { property: true, images: true },
    orderBy: { createdAt: "desc" }
  })

  const reviewedBookingIds = reviews.map((review) => review.bookingId).filter(Boolean) as string[]
  const reviewableBookings = await prisma.booking.findMany({
    where: {
      guestId: session.user.id,
      status: "COMPLETED",
      checkedOutAt: { not: null },
      id: { notIn: reviewedBookingIds },
    },
    include: { property: { select: { id: true, title: true } } },
    orderBy: { checkOut: "desc" },
  })
  const eligibleBookings = reviewableBookings.filter(canReviewBooking)

  return (
    <div className="space-y-20">
      
      {/* ─── PAGE HEADER ─── */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-[1px] bg-charcoal/20" />
          <h1 className="text-[11px] uppercase tracking-[0.4em] text-charcoal/50 font-bold">
            Guest Impressions
          </h1>
        </div>
        <h2 className="font-display text-5xl text-charcoal tracking-tight">Your <span className="text-charcoal/40">Reviews</span></h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* ─── LEFT: WRITE REVIEWS ─── */}
        <div className="lg:col-span-4 space-y-12">
          <div className="space-y-6">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-charcoal font-bold pb-4 border-b border-charcoal/10">Awaiting Feedback</h3>
            
            {eligibleBookings.length > 0 ? (
              <div className="space-y-8">
                <p className="text-sm text-charcoal/50 leading-relaxed italic">
                  &ldquo;Your perspective shapes our community. We invite you to share your experience at our curated retreats.&rdquo;
                </p>
                
                <div className="space-y-6">
                  {eligibleBookings.map((booking) => (
                    <div key={booking.id} className="bg-white border border-charcoal/10 p-8 shadow-sm">
                       <WriteReviewForm
                        bookingId={booking.id}
                        propertyName={booking.property.title}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-charcoal/5 p-8 text-center space-y-4">
                <PenLine className="w-6 h-6 text-charcoal/10 mx-auto" strokeWidth={1} />
                <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/30 font-medium">No pending reviews</p>
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT: PUBLISHED REVIEWS ─── */}
        <div className="lg:col-span-8 space-y-12">
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-charcoal font-bold pb-4 border-b border-charcoal/10">Published Journals</h3>
          
          {reviews.length === 0 ? (
            <div className="text-center py-24 bg-white border border-charcoal/10 shadow-sm">
              <Quote className="w-12 h-12 text-charcoal/5 mx-auto mb-8" strokeWidth={1} />
              <p className="text-charcoal/40 text-sm font-sans tracking-wide">Your review history will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-12">
              {reviews.map((review) => (
                <div key={review.id} className="group relative">
                  <div className="bg-white border border-charcoal/10 p-10 md:p-14 shadow-sm hover:shadow-md transition-all duration-500">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 mb-10">
                      <div className="space-y-4">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-charcoal/30 font-bold">Property Reviewed</p>
                        <h4 className="font-display text-2xl md:text-3xl text-charcoal tracking-wide">{review.property.title}</h4>
                        <div className="flex gap-1.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={i < review.rating ? "text-gold fill-gold" : "text-charcoal/10"}
                              strokeWidth={1}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/20 font-bold mb-1">Status</p>
                          <span className={`text-[8px] uppercase tracking-[0.2em] px-3 py-1.5 border ${
                            review.status === "PUBLISHED"
                              ? "border-charcoal/10 text-charcoal/50"
                              : "border-gold/25 text-gold-dark"
                          }`}>
                            {review.status}
                          </span>
                        </div>
                        
                        <form action={async () => {
                          "use server"
                          const { revalidatePath } = await import("next/cache")
                          await prisma.review.delete({ where: { id: review.id } })
                          revalidatePath("/account/reviews")
                        }}>
                          <button
                            type="submit"
                            className="w-10 h-10 rounded-full border border-charcoal/5 flex items-center justify-center text-charcoal/20 hover:text-red-400 hover:border-red-100 transition-all duration-300"
                            title="Remove Review"
                          >
                            <Trash size={14} strokeWidth={1.5} />
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className="relative">
                      <Quote className="absolute -top-6 -left-6 w-12 h-12 text-charcoal/[0.03] rotate-180" strokeWidth={1} />
                      <blockquote className="text-charcoal/70 text-lg leading-relaxed font-sans italic border-l-4 border-charcoal/[0.03] pl-8 relative z-10">
                        &ldquo;{review.comment}&rdquo;
                      </blockquote>

                      {review.images && review.images.length > 0 && (
                        <ReviewImageGallery images={review.images} />
                      )}
                    </div>

                    <div className="mt-12 pt-8 border-t border-charcoal/5 flex justify-between items-center">
                      <p className="text-[9px] uppercase tracking-[0.3em] text-charcoal/20 font-bold">
                        Published on {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
