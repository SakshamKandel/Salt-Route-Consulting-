import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { notFound } from "next/navigation"
import PropertyDetailClient from "@/components/public/PropertyDetailClient"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const property = await prisma.property.findUnique({ where: { slug } })
  if (!property) return {}
  return {
    title: `${property.title} | Salt Route`,
    description: property.description.slice(0, 160),
  }
}

export default async function PropertyDetailPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const session = await auth()

  // Admins can preview a property of ANY status (e.g. while editing a draft)
  // by appending ?preview=1 — used by the admin form's live preview pane.
  const isAdminPreview = sp.preview === "1" && session?.user?.role === "ADMIN"

  const property = await prisma.property.findFirst({
    where: isAdminPreview ? { slug } : { slug, status: "ACTIVE" },
    include: {
      images: { orderBy: { order: "asc" } },
      owner: { select: { name: true, image: true } },
      roomTypes: { where: { active: true }, orderBy: { order: "asc" } },
      sections: { orderBy: { order: "asc" } },
      reviews: {
        where: { status: "PUBLISHED" },
        include: {
          guest: { select: { name: true, image: true } },
          images: { select: { url: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      },
      _count: { select: { reviews: true } },
    },
  })

  if (!property) notFound()

  const [wishlistItem, eligibleBooking, currentUser] = session?.user?.id
    ? await Promise.all([
        prisma.wishlist.findUnique({
          where: { userId_propertyId: { userId: session.user.id, propertyId: property.id } },
        }),
        // A completed, not-yet-reviewed stay lets the guest review right on the page.
        prisma.booking.findFirst({
          where: {
            guestId: session.user.id,
            propertyId: property.id,
            status: "COMPLETED",
            review: null,
          },
          select: { id: true },
          orderBy: { checkOut: "desc" },
        }),
        prisma.user.findUnique({
          where: { id: session.user.id },
          select: { phone: true },
        }),
      ])
    : [null, null, null]

  return (
    <PropertyDetailClient
      property={{
        ...property,
        pricePerNight: Number(property.pricePerNight),
        stayDetails: (property.stayDetails as unknown as { label: string; value: string }[] | null) ?? null,
        gettingHere: (property.gettingHere as unknown as { time: string; from: string; distance?: string }[] | null) ?? null,
        featureIcons: (property.featureIcons as unknown as Record<string, string> | null) ?? null,
        roomTypes: property.roomTypes.map((rt) => ({
          ...rt,
          pricePerNight: Number(rt.pricePerNight),
        })),
      }}
      wishlistItem={!!wishlistItem}
      isAuthenticated={!!session?.user?.id}
      eligibleBookingId={eligibleBooking?.id ?? null}
      initialPhone={currentUser?.phone ?? null}
    />
  )
}
