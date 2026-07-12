import { prisma } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ManualBookingForm } from "./ManualBookingForm"

export default async function ManualBookingPage() {
  const [properties, guests] = await Promise.all([
    prisma.property.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        title: true,
        pricePerNight: true,
        roomTypes: {
          where: { active: true },
          select: { id: true, name: true, classType: true, pricePerNight: true, totalUnits: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { title: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "GUEST" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="rounded-lg text-[#1B3A5C]/40 hover:text-[#1B3A5C] hover:bg-[#1B3A5C]/5">
          <Link href="/admin/bookings">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Reservations</p>
          <h2 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Manual Booking</h2>
          <p className="text-[13px] text-[#1B3A5C]/45 mt-1">Create a confirmed booking directly on behalf of a guest.</p>
        </div>
      </div>

      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl p-6">
        <ManualBookingForm
          properties={properties.map((p) => ({
            ...p,
            pricePerNight: p.pricePerNight.toString(),
            roomTypes: p.roomTypes.map((rt) => ({
              ...rt,
              pricePerNight: rt.pricePerNight.toString(),
            })),
          }))}
          guests={guests}
        />
      </div>
    </div>
  )
}
