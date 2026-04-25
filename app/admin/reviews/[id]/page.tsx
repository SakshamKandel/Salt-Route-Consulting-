import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, User, Home } from "lucide-react"
import { ReviewActions } from "./ReviewActions"

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/reviews"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-display text-navy">Review Detail</h2>
              <Badge variant={review.status === "PUBLISHED" ? "default" : "secondary"}>
                {review.status === "PUBLISHED" ? "Published" : review.status === "HIDDEN" ? "Hidden" : "Pending"}
              </Badge>
            </div>
            <p className="text-slate-500">Submitted on {review.createdAt.toLocaleDateString()}</p>
          </div>
        </div>
        <ReviewActions review={review} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 border-b pb-2">
            <span className="font-medium text-navy text-xl">{review.rating}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
              ))}
            </div>
          </div>
          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-lg">
            &ldquo;{review.comment}&rdquo;
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-navy flex items-center gap-2">
              <User className="w-5 h-5" /> Guest Info
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-slate-800">{review.guest.name}</p>
              <p><a href={`mailto:${review.guest.email}`} className="text-blue-600 hover:underline">{review.guest.email}</a></p>
              <Button asChild variant="link" className="px-0 h-auto">
                <Link href={`/admin/users/${review.guestId}`}>View Profile</Link>
              </Button>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-navy flex items-center gap-2">
              <Home className="w-5 h-5" /> Property
            </h3>
            <div>
              <Link href={`/admin/properties/${review.propertyId}`} className="font-medium text-blue-600 hover:underline">
                {review.property.title}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
