import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { CalendarManager } from "./CalendarManager"

export default async function PropertyCalendarPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [property, blockedDates, roomTypes] = await Promise.all([
    prisma.property.findUnique({ where: { id }, select: { id: true, title: true } }),
    prisma.blockedDate.findMany({
      where: { propertyId: id },
      orderBy: { date: "asc" },
    }),
    prisma.roomType.findMany({
      where: { propertyId: id },
      select: { id: true, name: true },
      orderBy: { order: "asc" },
    }),
  ])

  if (!property) return notFound()

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="rounded-lg text-[#1B3A5C]/40 hover:text-[#1B3A5C] hover:bg-[#1B3A5C]/5">
          <Link href={`/admin/properties/${id}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Portfolio</p>
          <h2 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Manage Calendar</h2>
          <p className="text-[13px] text-[#1B3A5C]/45 mt-1">{property.title} — block dates to prevent bookings.</p>
        </div>
      </div>

      <CalendarManager propertyId={id} initial={blockedDates} roomTypes={roomTypes} />
    </div>
  )
}
