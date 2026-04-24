import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { BookingRequestForm } from "@/components/booking/booking-request-form"
import { MapPin, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function BookingRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const propertyId = typeof params.property === "string" ? params.property : null

  if (!propertyId) return notFound()

  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/booking-request?property=${propertyId}`)
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId, status: "ACTIVE" },
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  })

  if (!property) return notFound()

  const heroImage = property.images[0]?.url

  return (
    <div className="min-h-screen bg-cream pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="text-navy">
            <Link href={`/properties/${property.slug}`}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to property
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10">
          <div className="space-y-6">
            <div className="bg-white border border-beige rounded-2xl overflow-hidden shadow-sm">
              {heroImage && (
                <div className="relative aspect-video">
                  <Image src={heroImage} alt={property.title} fill className="object-cover" />
                </div>
              )}
              <div className="p-6 space-y-3">
                <h1 className="font-display text-3xl text-navy">{property.title}</h1>
                <p className="text-navy/60 flex items-center gap-2 text-sm">
                  <MapPin size={14} className="text-gold" /> {property.location}
                </p>
                <p className="text-navy/70 text-sm leading-relaxed">
                  {property.description.slice(0, 240)}
                  {property.description.length > 240 ? "..." : ""}
                </p>
                <div className="flex gap-4 text-sm text-navy/60 pt-2 border-t border-beige">
                  <span>{property.bedrooms} bed</span>
                  <span>{property.bathrooms} bath</span>
                  <span>Up to {property.maxGuests} guests</span>
                </div>
              </div>
            </div>

            <div className="bg-navy/5 rounded-xl p-5 text-sm text-navy/70 space-y-2">
              <p className="font-semibold text-navy">What happens after you request?</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your request is reviewed by our concierge team.</li>
                <li>We will confirm availability within 24 hours.</li>
                <li>You&apos;ll receive a confirmation email once approved.</li>
                <li>No charge is made until confirmation.</li>
              </ul>
            </div>
          </div>

          <div className="w-full lg:w-[460px]">
            <BookingRequestForm
              propertyId={property.id}
              pricePerNight={Number(property.pricePerNight)}
              maxGuests={property.maxGuests}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
