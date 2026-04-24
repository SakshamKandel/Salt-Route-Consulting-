import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit3, MapPin, Users, Bed, Bath, DollarSign } from "lucide-react"

export default async function OwnerPropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  
  const { id } = await params
  
  const property = await prisma.property.findUnique({
    where: { id, ownerId: session.user.id }
  })

  if (!property) return notFound()

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/owner/properties"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h2 className="text-3xl font-display text-navy">{property.title}</h2>
            <p className="text-slate-500">{property.location}</p>
          </div>
        </div>
        <Button asChild className="bg-navy text-cream">
          <Link href={`/owner/request-edit?propertyId=${property.id}`}>
            <Edit3 className="w-4 h-4 mr-2" /> Request Edit
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border rounded-lg p-6 shadow-sm md:col-span-2 space-y-4">
          <h3 className="font-semibold text-lg text-navy border-b pb-2">Property Details</h3>
          <p className="text-slate-700 whitespace-pre-wrap">{property.description}</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4">
             <h3 className="font-semibold text-lg text-navy border-b pb-2">At a Glance</h3>
             <ul className="space-y-3 text-sm text-slate-600">
               <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {property.address || "Address not specified"}</li>
               <li className="flex items-center gap-2"><Users className="w-4 h-4" /> Up to {property.maxGuests} guests</li>
               <li className="flex items-center gap-2"><Bed className="w-4 h-4" /> {property.bedrooms} Bedrooms</li>
               <li className="flex items-center gap-2"><Bath className="w-4 h-4" /> {property.bathrooms} Bathrooms</li>
               <li className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> ${property.pricePerNight.toString()} / night</li>
             </ul>
          </div>
          <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4 text-center">
            <p className="text-sm text-slate-500">Need to block dates or update prices?</p>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/owner/request-edit?propertyId=${property.id}`}>Contact Admin</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
