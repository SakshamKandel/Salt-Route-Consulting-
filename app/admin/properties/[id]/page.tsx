import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Image as ImageIcon, Calendar as CalendarIcon, CheckCircle, DoorOpen, LayoutList, Star, Banknote, CalendarRange } from "lucide-react"
import { StatCard } from "@/components/admin/stat-card"
import { DashboardBookingsTable } from "@/components/admin/dashboard-tables"
import { formatNpr } from "@/lib/currency"

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
  DRAFT: "bg-amber-50 text-amber-600 border-amber-200/60",
  PENDING: "bg-sky-50 text-sky-600 border-sky-200/60",
  ARCHIVED: "bg-rose-50 text-rose-600 border-rose-200/60",
}

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
      _count: { select: { bookings: true, reviews: true, images: true, roomTypes: true, sections: true } },
      bookings: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { guest: true, property: true }
      }
    }
  })

  if (!property) return notFound()

  const bookingsForTable = property.bookings.map((b) => ({
    id: b.id,
    bookingCode: b.bookingCode,
    checkIn: b.checkIn.toISOString(),
    status: b.status,
    property: { title: b.property.title },
    guest: { name: b.guest.name, email: b.guest.email },
  }))

  const quickLinks = [
    { href: `/admin/properties/${id}/edit`, icon: Edit, label: "Edit Details" },
    { href: `/admin/properties/${id}/images`, icon: ImageIcon, label: "Media" },
    { href: `/admin/properties/${id}/calendar`, icon: CalendarIcon, label: "Calendar" },
    { href: `/admin/properties/${id}/rooms`, icon: DoorOpen, label: `Room Classes${property._count.roomTypes > 0 ? ` (${property._count.roomTypes})` : ""}` },
    { href: `/admin/properties/${id}/sections`, icon: LayoutList, label: `Story Sections${property._count.sections > 0 ? ` (${property._count.sections})` : ""}` },
  ]

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col xl:flex-row xl:items-end gap-4 justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/properties"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#1B3A5C]/40 hover:text-[#1B3A5C] hover:bg-[#1B3A5C]/5 transition-colors shrink-0"
            aria-label="Back to properties"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Portfolio</p>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">{property.title}</h1>
              <span className={`inline-flex rounded-full text-[9px] font-semibold border uppercase tracking-[0.15em] px-2.5 py-1 ${STATUS_STYLES[property.status] || "bg-[#1B3A5C]/5 text-[#1B3A5C]/60 border-[#1B3A5C]/10"}`}>
                {property.status}
              </span>
            </div>
            <p className="text-[13px] text-[#1B3A5C]/45 mt-1">{property.location}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickLinks.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[#1B3A5C]/15 bg-[#FFFAF3] text-[12px] font-medium text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 transition-colors"
            >
              <Icon className="w-3.5 h-3.5 text-[#1B3A5C]/35" /> {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Bookings" value={property._count.bookings} icon={CalendarRange} />
        <StatCard title="Total Reviews" value={property._count.reviews} icon={Star} />
        <StatCard title="Media" value={property._count.images} icon={ImageIcon} />
        <StatCard title="Price / Night" value={formatNpr(property.pricePerNight)} icon={Banknote} />
      </div>

      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl p-5">
        <p className="text-[10px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.2em] mb-4">Recent Bookings</p>
        {property.bookings.length === 0 ? (
          <div className="py-10 text-center">
            <CheckCircle className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-3" />
            <p className="text-[13px] text-[#1B3A5C]/40">No bookings yet.</p>
            <p className="text-[11px] text-[#1B3A5C]/30 mt-1">Bookings for this property will appear here.</p>
          </div>
        ) : (
          <DashboardBookingsTable bookings={bookingsForTable} />
        )}
      </div>
    </div>
  )
}
