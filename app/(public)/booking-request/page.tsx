import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Image from "next/image"
import { BookingRequestForm } from "@/components/booking/booking-request-form"
import { LuxuryLink } from "@/components/ui/luxury-link"
import { getPrimaryImageUrl } from "@/lib/property-media"

export default async function BookingRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const propertyId = typeof params.property === "string" ? params.property : null

  if (!propertyId) return notFound()

  const session = await auth()

  const property = await prisma.property.findUnique({
    where: { id: propertyId, status: "ACTIVE" },
    include: { images: { orderBy: { order: "asc" } } },
  })

  if (!property) return notFound()

  const currentUser = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { phone: true },
      })
    : null

  const heroImage = getPrimaryImageUrl(property.images)

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-12">
          <LuxuryLink href={`/properties/${property.slug}`} className="inline-flex">
            ← BACK TO PROPERTY
          </LuxuryLink>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-24 items-start">
          
          {/* Left Column: Property Details */}
          <div className="space-y-12">
            
            <div className="group relative">
              {heroImage && (
                <div className="relative aspect-[4/3] w-full overflow-hidden border border-charcoal/10">
                  <Image
                    src={heroImage}
                    alt={property.title}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    unoptimized={heroImage.includes("placehold.co")}
                    className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                  />
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h1 className="font-display text-4xl md:text-5xl text-charcoal">{property.title}</h1>
              <p className="text-[10px] tracking-[0.2em] uppercase font-sans text-charcoal/50">
                {property.location}
              </p>
              
              <div className="w-12 h-[1px] bg-charcoal/20" />

              <p className="text-charcoal/70 text-sm leading-loose font-sans max-w-2xl">
                {property.description}
              </p>

              <div className="flex flex-wrap gap-8 pt-6">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-charcoal/40 mb-1">Bedrooms</span>
                  <span className="font-display text-xl text-charcoal">{property.bedrooms}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-charcoal/40 mb-1">Bathrooms</span>
                  <span className="font-display text-xl text-charcoal">{property.bathrooms}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-charcoal/40 mb-1">Capacity</span>
                  <span className="font-display text-xl text-charcoal">Up to {property.maxGuests}</span>
                </div>
              </div>
            </div>

            <div className="border border-charcoal/10 p-8 space-y-4 bg-white/50">
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-sans font-semibold text-charcoal/60">
                Concierge Process
              </h3>
              <ul className="space-y-3 font-sans text-xs tracking-wide text-charcoal/60 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-charcoal/30 font-display italic">01</span>
                  <span>Your request is reviewed by our dedicated concierge team.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-charcoal/30 font-display italic">02</span>
                  <span>We will verify property availability within 24 hours.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-charcoal/30 font-display italic">03</span>
                  <span>You will receive an exclusive confirmation dossier via email once approved.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-charcoal/30 font-display italic">04</span>
                  <span>No charges are applied until your itinerary is finalized and confirmed.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="w-full lg:w-[480px] sticky top-32">
            <BookingRequestForm
              propertyId={property.id}
              pricePerNight={Number(property.pricePerNight)}
              maxGuests={property.maxGuests}
              isAuthenticated={!!session?.user?.id}
              initialPhone={currentUser?.phone}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
