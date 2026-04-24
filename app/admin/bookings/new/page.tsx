import { prisma } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ManualBookingForm } from "./ManualBookingForm"

export default async function ManualBookingPage() {
  const [properties, guests] = await Promise.all([
    prisma.property.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, title: true, pricePerNight: true },
      orderBy: { title: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "GUEST" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/bookings">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-display text-navy">Manual Booking</h2>
          <p className="text-slate-500">Create a confirmed booking directly on behalf of a guest.</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <ManualBookingForm
          properties={properties.map((p) => ({ ...p, pricePerNight: p.pricePerNight.toString() }))}
          guests={guests}
        />
      </div>
    </div>
  )
}
