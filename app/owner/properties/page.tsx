import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getPrimaryImageUrl } from "@/lib/property-media"

export default async function OwnerPropertiesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const properties = await prisma.property.findMany({
    where: { ownerId: session.user.id, status: "ACTIVE" },
    include: {
      _count: {
        select: { bookings: { where: { status: "CONFIRMED" } } }
      },
      images: { take: 6, orderBy: { order: "asc" } }
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-16">
      <div className="flex items-center gap-4">
        <span className="w-8 h-[1px] bg-gold/50" />
        <h2 className="text-[11px] font-sans text-sand uppercase tracking-[0.4em]">My Portfolio</h2>
      </div>

      {properties.length === 0 ? (
        <div className="p-20 text-center border border-white/[0.05] bg-white/[0.02]">
          <p className="text-[10px] uppercase tracking-[0.4em] text-sand/30 font-sans">No listed properties in your collection yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {properties.map(p => {
            const imageUrl = getPrimaryImageUrl(p.images) || "/placeholder-property.jpg"

            return (
              <div key={p.id} className="group flex flex-col relative">
                <div className="aspect-[4/5] relative overflow-hidden bg-white/5 mb-8">
                  <Image 
                    src={imageUrl} 
                    alt={p.title} 
                    fill 
                    className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-charcoal/20 group-hover:bg-transparent transition-colors duration-700" />
                  <div className="absolute top-6 right-6">
                    <span className="bg-charcoal/80 backdrop-blur-md text-gold px-4 py-2 text-[9px] uppercase tracking-[0.3em] border border-gold/20">
                      {p.status}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-display text-2xl text-sand tracking-widest uppercase group-hover:text-gold transition-colors duration-500">{p.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-[1px] bg-gold/30" />
                    <p className="text-[9px] uppercase tracking-[0.3em] text-sand/40 font-sans">{p.location}</p>
                  </div>
                  
                  <div className="pt-8 flex justify-between items-center border-t border-white/5 mt-4">
                    <span className="text-[9px] uppercase tracking-[0.4em] text-sand/30 font-sans">{p._count.bookings} CONFIRMED</span>
                    <Link 
                      href={`/owner/properties/${p.id}`} 
                      className="text-[9px] uppercase tracking-[0.4em] text-gold hover:text-sand transition-colors pb-1 border-b border-transparent hover:border-sand"
                    >
                      MANAGE
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
