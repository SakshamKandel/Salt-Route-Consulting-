import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Star, User, Home, ArrowUpRight } from "lucide-react"
import { ReviewActions } from "./ReviewActions"

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
  HIDDEN: "bg-rose-50 text-rose-600 border-rose-200/60",
  PENDING: "bg-amber-50 text-amber-600 border-amber-200/60",
}

export default async function AdminReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      guest: true,
      property: true
    }
  })

  if (!review) return notFound()

  const card = "bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl"
  const microLabel = "text-[10px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.2em]"

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/reviews"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#1B3A5C]/40 hover:text-[#1B3A5C] hover:bg-[#1B3A5C]/5 transition-colors shrink-0"
            aria-label="Back to reviews"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Guest Feedback</p>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Review Detail</h1>
              <span className={`inline-flex rounded-full text-[9px] font-semibold border uppercase tracking-[0.15em] px-2.5 py-1 ${STATUS_STYLES[review.status] || "bg-[#1B3A5C]/5 text-[#1B3A5C]/60 border-[#1B3A5C]/10"}`}>
                {review.status === "PUBLISHED" ? "Published" : review.status === "HIDDEN" ? "Hidden" : "Pending"}
              </span>
            </div>
            <p className="text-[13px] text-[#1B3A5C]/45 mt-1">Submitted on {review.createdAt.toLocaleDateString()}</p>
          </div>
        </div>
        <ReviewActions review={review} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${card} p-6 space-y-4 md:col-span-2`}>
          <div className="flex items-center gap-2.5 border-b border-[#1B3A5C]/8 pb-4">
            <span className="font-display text-2xl text-[#1B3A5C] tabular-nums">{review.rating}</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-[#C9A96E] text-[#C9A96E]" : "text-[#1B3A5C]/15"}`} />
              ))}
            </div>
          </div>
          <p className="font-display text-[17px] text-[#1B3A5C]/80 whitespace-pre-wrap leading-relaxed">
            &ldquo;{review.comment}&rdquo;
          </p>
        </div>

        <div className="space-y-6">
          <div className={`${card} p-5 space-y-4`}>
            <h3 className={`${microLabel} flex items-center gap-2`}>
              <User className="w-3 h-3 text-[#C9A96E]" /> Guest
            </h3>
            <div className="space-y-2">
              <p className="text-[13px] font-medium text-[#1B3A5C]">{review.guest.name}</p>
              <p><a href={`mailto:${review.guest.email}`} className="text-[12px] text-[#1B3A5C]/60 hover:text-[#C9A96E] transition-colors break-all">{review.guest.email}</a></p>
              <Link href={`/admin/users/${review.guestId}`} className="inline-flex items-center gap-1 text-[11px] font-medium text-[#C9A96E] hover:underline">
                View Profile <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className={`${card} p-5 space-y-4`}>
            <h3 className={`${microLabel} flex items-center gap-2`}>
              <Home className="w-3 h-3 text-[#C9A96E]" /> Property
            </h3>
            <div>
              <Link href={`/admin/properties/${review.propertyId}`} className="text-[13px] font-medium text-[#1B3A5C] hover:text-[#C9A96E] transition-colors">
                {review.property.title}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
