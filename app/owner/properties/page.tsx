import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default async function OwnerPropertiesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const properties = await prisma.property.findMany({
    where: { ownerId: session.user.id },
    include: { _count: { select: { bookings: { where: { status: "CONFIRMED" } } } } }
  })

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display text-navy">My Properties</h2>
        <p className="text-slate-500">View your portfolio of properties.</p>
      </div>

      {properties.length === 0 ? (
        <div className="p-12 text-center border rounded-lg bg-white">
          <p className="text-slate-500">You have no properties assigned yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(p => (
            <div key={p.id} className="border rounded-lg bg-white overflow-hidden shadow-sm flex flex-col">
              <div className="h-48 bg-slate-100 flex items-center justify-center text-slate-400">
                {/* Placeholder for image */}
                No Image
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-navy">{p.title}</h3>
                  <Badge variant={p.status === "ACTIVE" ? "default" : "secondary"}>{p.status}</Badge>
                </div>
                <p className="text-sm text-slate-500 mb-4 flex-1">{p.location}</p>
                
                <div className="flex justify-between items-center text-sm pt-4 border-t mt-auto">
                  <span className="text-slate-600">{p._count.bookings} Bookings</span>
                  <Button asChild variant="outline" size="sm" className="text-navy">
                    <Link href={`/owner/properties/${p.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
