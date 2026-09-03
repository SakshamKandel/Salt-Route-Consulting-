import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { formatNpr } from "@/lib/currency"
import OwnerPropertyWorkspace, { type OwnerPropertyStats } from "./OwnerPropertyWorkspace"
import type { PropertyDetail } from "@/components/public/property/types"

export default async function OwnerPropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params

  const property = await prisma.property.findUnique({
    where: { id, ownerId: session.user.id },
    include: {
      images: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }] },
      roomTypes: { where: { active: true }, orderBy: { order: "asc" } },
      sections: { orderBy: { order: "asc" } },
      reviews: {
        where: { status: "PUBLISHED" },
        include: { guest: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 12,
      },
      _count: { select: { reviews: true } },
    },
  })

  if (!property) return notFound()

  const [bookingStats, allRatings] = await Promise.all([
    prisma.booking.aggregate({
      where: {
        propertyId: id,
        status: { in: ["CONFIRMED", "COMPLETED", "CHECKED_IN"] },
      },
      _sum: { totalPrice: true },
      _count: { id: true },
    }),
    prisma.review.aggregate({
      where: { propertyId: id, status: "PUBLISHED" },
      _avg: { rating: true },
      _count: { id: true },
    }),
  ])

  // Nights hosted across confirmed stays.
  const stays = await prisma.booking.findMany({
    where: {
      propertyId: id,
      status: { in: ["CONFIRMED", "COMPLETED", "CHECKED_IN"] },
    },
    select: { checkIn: true, checkOut: true },
  })
  const nights = stays.reduce((total, stay) => {
    const ms = stay.checkOut.getTime() - stay.checkIn.getTime()
    return total + Math.max(1, Math.round(ms / 86_400_000))
  }, 0)

  const stats: OwnerPropertyStats = {
    bookings: bookingStats._count.id,
    nights,
    revenue: formatNpr(bookingStats._sum.totalPrice),
    avgRating: allRatings._avg.rating ? allRatings._avg.rating.toFixed(1) : null,
    reviewCount: allRatings._count.id,
  }

  const detail: PropertyDetail = {
    ...property,
    status: property.status,
    featured: property.featured,
    pricePerNight: Number(property.pricePerNight),
    stayDetails: (property.stayDetails as unknown as { label: string; value: string }[] | null) ?? null,
    gettingHere:
      (property.gettingHere as unknown as { time: string; from: string; distance?: string }[] | null) ?? null,
    featureIcons: (property.featureIcons as unknown as Record<string, string> | null) ?? null,
    experiences:
      (property.experiences as unknown as PropertyDetail["experiences"] | null) ?? null,
    roomTypes: property.roomTypes.map((rt) => ({
      ...rt,
      pricePerNight: Number(rt.pricePerNight),
    })),
    reviews: property.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      guest: { name: r.guest.name, image: r.guest.image },
    })),
  }

  return <OwnerPropertyWorkspace property={detail} stats={stats} />
}
