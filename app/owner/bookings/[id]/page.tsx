import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Home } from "lucide-react"

export default async function OwnerBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  
  const { id } = await params
  
  const booking = await prisma.booking.findUnique({
    where: { 
      id,
      property: { ownerId: session.user.id },
      status: "CONFIRMED" // Only confirmed
    },
    include: {
      guest: { select: { name: true, email: true, phone: true } },
      property: { select: { title: true, id: true } }
    }
  })

  if (!booking) return notFound()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/owner/bookings"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h2 className="text-3xl font-display text-navy">{booking.bookingCode}</h2>
            <Badge variant="default">Confirmed</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4">
           <h3 className="font-semibold text-lg text-navy flex items-center gap-2 border-b pb-2">
            <Home className="w-5 h-5" /> Stay Information
           </h3>
           <div className="space-y-3 text-sm">
             <p className="flex justify-between"><span className="text-slate-500">Property:</span> <Link href={`/owner/properties/${booking.property.id}`} className="font-medium text-blue-600 hover:underline">{booking.property.title}</Link></p>
             <p className="flex justify-between"><span className="text-slate-500">Check-in:</span> <span className="font-medium">{new Date(booking.checkIn).toLocaleDateString()}</span></p>
             <p className="flex justify-between"><span className="text-slate-500">Check-out:</span> <span className="font-medium">{new Date(booking.checkOut).toLocaleDateString()}</span></p>
             <p className="flex justify-between"><span className="text-slate-500">Guests:</span> <span className="font-medium">{booking.guests}</span></p>
             <div className="pt-3 mt-3 border-t flex justify-between items-center text-base">
               <span className="text-slate-500 font-semibold">Total Revenue:</span>
               <span className="font-bold text-green-700">${booking.totalPrice.toString()}</span>
             </div>
           </div>
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4">
           <h3 className="font-semibold text-lg text-navy flex items-center gap-2 border-b pb-2">
            <User className="w-5 h-5" /> Guest Details
           </h3>
           <div className="space-y-3 text-sm">
             <p className="flex justify-between"><span className="text-slate-500">Name:</span> <span className="font-medium">{booking.guest.name}</span></p>
             <p className="flex justify-between"><span className="text-slate-500">Email:</span> <span><a href={`mailto:${booking.guest.email}`} className="text-blue-600 hover:underline">{booking.guest.email}</a></span></p>
             {booking.guest.phone && (
               <p className="flex justify-between"><span className="text-slate-500">Phone:</span> <span><a href={`tel:${booking.guest.phone}`} className="text-blue-600 hover:underline">{booking.guest.phone}</a></span></p>
             )}
             {booking.notes && (
               <div className="pt-3 mt-3 border-t">
                 <span className="text-slate-500 block mb-1">Guest Notes/Requests:</span>
                 <p className="bg-slate-50 p-3 rounded-md text-slate-700 whitespace-pre-wrap">{booking.notes}</p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  )
}
