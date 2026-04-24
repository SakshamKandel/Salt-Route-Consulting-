import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Image as ImageIcon, Calendar as CalendarIcon, CheckCircle } from "lucide-react"
import { StatCard } from "@/components/admin/stat-card"
import { DashboardBookingsTable } from "@/components/admin/dashboard-tables"
import { Badge } from "@/components/ui/badge"

export default async function PropertyOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      owner: true,
      _count: { select: { bookings: true, reviews: true, images: true } },
      bookings: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { guest: true, property: true }
      }
    }
  })

  if (!property) return notFound()

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/properties"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-display text-navy">{property.title}</h2>
              <Badge variant={property.status === "ACTIVE" ? "default" : "secondary"}>
                {property.status}
              </Badge>
            </div>
            <p className="text-slate-500">{property.location}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="text-navy border-navy/20">
            <Link href={`/admin/properties/${id}/edit`}>
              <Edit className="w-4 h-4 mr-2" /> Edit Details
            </Link>
          </Button>
          <Button asChild variant="outline" className="text-navy border-navy/20">
            <Link href={`/admin/properties/${id}/images`}>
              <ImageIcon className="w-4 h-4 mr-2" /> Images
            </Link>
          </Button>
          <Button asChild variant="outline" className="text-navy border-navy/20">
            <Link href={`/admin/properties/${id}/calendar`}>
              <CalendarIcon className="w-4 h-4 mr-2" /> Calendar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Bookings" value={property._count.bookings} icon={CheckCircle} />
        <StatCard title="Total Reviews" value={property._count.reviews} icon={CheckCircle} />
        <StatCard title="Photos" value={property._count.images} icon={ImageIcon} />
        <StatCard title="Price / Night" value={`$${property.pricePerNight.toString()}`} icon={CheckCircle} />
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-navy mb-4">Recent Bookings</h3>
        {property.bookings.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No bookings yet.</p>
        ) : (
          <DashboardBookingsTable bookings={property.bookings} />
        )}
      </div>
    </div>
  )
}
