import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Trash } from "lucide-react"

export default async function ReviewsPage() {
  const session = await auth()
  if (!session?.user?.id) return redirect("/login")

  const reviews = await prisma.review.findMany({
    where: { guestId: session.user.id },
    include: { property: true },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display text-navy">My Reviews</h1>

      {reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          You haven&apos;t written any reviews yet.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{review.property.title}</CardTitle>
                  <div className="flex gap-1 mt-1 text-gold">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <form action={async () => {
                    "use server"
                    const { revalidatePath } = await import("next/cache")
                    await prisma.review.delete({ where: { id: review.id } })
                    revalidatePath("/account/reviews")
                  }}>
                    <Button type="submit" variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash size={16} className="mr-2" /> Delete
                    </Button>
                  </form>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{review.comment}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
