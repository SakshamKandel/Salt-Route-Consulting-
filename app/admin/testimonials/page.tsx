import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import TestimonialManager from "./TestimonialManager"

export const metadata = { title: "Guestbook | Salt Route Admin" }

export default async function AdminTestimonialsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login")

  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  })

  return (
    <div className="pb-12">
      <TestimonialManager
        initial={testimonials.map((t) => ({
          id: t.id,
          quote: t.quote,
          name: t.name,
          role: t.role,
          source: t.source,
          kind: t.kind,
          rating: t.rating,
          location: t.location,
          featured: t.featured,
          published: t.published,
          order: t.order,
        }))}
      />
    </div>
  )
}
