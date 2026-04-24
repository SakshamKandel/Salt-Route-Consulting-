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

  const [property, blockedDates] = await Promise.all([
    prisma.property.findUnique({ where: { id }, select: { id: true, title: true } }),
    prisma.blockedDate.findMany({
      where: { propertyId: id },
      orderBy: { date: "asc" },
    }),
  ])

  if (!property) return notFound()

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/admin/properties/${id}`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-display text-navy">Manage Calendar</h2>
          <p className="text-slate-500">{property.title} — block dates to prevent bookings.</p>
        </div>
      </div>

      <CalendarManager propertyId={id} initial={blockedDates} />
    </div>
  )
}
