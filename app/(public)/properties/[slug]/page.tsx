import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { notFound } from "next/navigation"
import PropertyDetailClient from "@/components/public/PropertyDetailClient"
import { getPrimaryImageUrl } from "@/lib/property-media"

// auth() reads cookies → this route is already dynamic.
// Removing force-dynamic lets Next.js cache the property data fetch
// and apply Partial Prerendering for the static brochure shell.
export const revalidate = 3600

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

  // Preview gate: ?preview=1 lets an ADMIN preview ANY property (used by the
  // admin form's live preview pane), and lets an OWNER preview their own draft
  // after submitting it from the owner portal. Everyone else only ever sees
  // ACTIVE properties.
  const previewRequested = sp.preview === "1" && !!session?.user?.id
  const isAdmin = session?.user?.role === "ADMIN"

  const property = await prisma.property.findFirst({
    where:
      previewRequested && isAdmin
        ? { slug }
        : previewRequested
          ? {
              slug,
              OR: [{ status: "ACTIVE" }, { ownerId: session!.user.id }],
            }
          : { slug, status: "ACTIVE" },
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

  const isPreview = Boolean(
    previewRequested && (isAdmin || property.ownerId === session?.user?.id),
  )

  // A "complete website" feel: always give the guest somewhere to go next.
  const related = await prisma.property
    .findMany({
      where: { status: "ACTIVE", NOT: { id: property.id } },
      include: { images: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }], take: 1 } },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 3,
    })
    .catch(() => [])

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
        hidePrice: property.hidePrice,
        stayDetails: (property.stayDetails as unknown as { label: string; value: string }[] | null) ?? null,
        gettingHere: (property.gettingHere as unknown as { time: string; from: string; distance?: string }[] | null) ?? null,
        featureIcons: (property.featureIcons as unknown as Record<string, string> | null) ?? null,
        experiences: (property.experiences as unknown as { id?: string; title: string; description: string; imageUrl?: string | null }[] | null) ?? null,
        roomTypes: property.roomTypes.map((rt) => ({
          ...rt,
          pricePerNight: Number(rt.pricePerNight),
          hidePrice: rt.hidePrice,
        })),
      }}
      wishlistItem={!!wishlistItem}
      isAuthenticated={!!session?.user?.id}
      eligibleBookingId={eligibleBooking?.id ?? null}
      initialPhone={currentUser?.phone ?? null}
      previewMode={isPreview}
      relatedProperties={related.map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        location: r.location,
        pricePerNight: Number(r.pricePerNight),
        hidePrice: r.hidePrice,
        image: getPrimaryImageUrl(r.images),
      }))}
    />
  )
}
