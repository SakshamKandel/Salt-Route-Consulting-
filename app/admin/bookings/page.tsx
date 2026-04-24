import { prisma } from "@/lib/db"
import { BookingsTable } from "./BookingsTable"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { BookingStatus } from "@prisma/client"

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const statusFilter = (resolvedParams.status as string) || "PENDING"

  const bookings = await prisma.booking.findMany({
    where: {
      status: statusFilter !== "ALL" ? (statusFilter as BookingStatus) : undefined
    },
    orderBy: { createdAt: "desc" },
    include: {
      guest: { select: { name: true, email: true } },
      property: { select: { title: true } }
    }
  })

  const tabs = [
    { label: "Pending", value: "PENDING" },
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Cancelled", value: "CANCELLED" },
    { label: "Rejected", value: "REJECTED" },
    { label: "All", value: "ALL" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display text-navy">Bookings</h2>
          <p className="text-slate-500">Manage all reservation requests across properties.</p>
        </div>
        <Button asChild className="bg-navy text-cream">
          <Link href="/admin/bookings/new">
            <Plus className="w-4 h-4 mr-2" /> Manual Booking
          </Link>
        </Button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            asChild
            variant={statusFilter === tab.value ? "default" : "outline"}
            className={statusFilter === tab.value ? "bg-navy" : "text-navy"}
          >
            <Link href={`/admin/bookings?status=${tab.value}`}>{tab.label}</Link>
          </Button>
        ))}
      </div>

      <BookingsTable bookings={bookings} />
    </div>
  )
}
