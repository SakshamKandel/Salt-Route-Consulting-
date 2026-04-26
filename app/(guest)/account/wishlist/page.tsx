import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Heart, X, ArrowRight } from "lucide-react"
import { formatNpr } from "@/lib/currency"
import { getPrimaryImageUrl } from "@/lib/property-media"
import { getPagination, parsePage } from "@/lib/pagination"
import { PaginationControls } from "@/components/shared/pagination-controls"

export default async function WishlistPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()
  if (!session?.user?.id) return redirect("/login")
  const params = await searchParams
  const requestedPage = parsePage(params.page)
  const where = { userId: session.user.id }
  const total = await prisma.wishlist.count({ where })
  const pagination = getPagination(requestedPage, total)

  const wishlists = await prisma.wishlist.findMany({
    where,
    skip: pagination.skip,
    take: pagination.take,
    include: {
      property: {
        include: { images: { take: 1, orderBy: [{ isPrimary: "desc" }, { order: "asc" }] } }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-12">
      {/* ─── PAGE HEADER ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-8 h-[1px] bg-charcoal/20" />
          <h1 className="text-[11px] uppercase tracking-[0.3em] text-charcoal/50 font-medium">
            Your Collection
          </h1>
          {wishlists.length > 0 && (
            <span className="text-[9px] text-charcoal/25 font-sans">{wishlists.length} saved</span>
          )}
        </div>
        <Link
          href="/properties"
          className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/30 hover:text-charcoal transition-colors"
        >
          <span>Discover More</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
        </Link>
      </div>

      {wishlists.length === 0 ? (
        <div className="text-center py-24 bg-white border border-charcoal/5">
          <Heart className="w-8 h-8 text-charcoal/15 mx-auto mb-6" strokeWidth={1} />
          <p className="font-display text-xl text-charcoal/60 mb-3">Start Saving Stays</p>
          <p className="text-charcoal/30 text-sm font-sans max-w-sm mx-auto mb-8 leading-relaxed">
            Save your favourite properties and keep every stay you love close at hand.
          </p>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 bg-charcoal text-white px-8 py-3.5 text-[9px] uppercase tracking-[0.3em] hover:bg-charcoal/90 transition-colors"
          >
            <span>Explore Stays</span>
            <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {wishlists.map((item) => {
            const imageUrl = getPrimaryImageUrl(item.property.images) || "/placeholder-property.jpg"

            return (
              <div key={item.id} className="group bg-white border border-charcoal/5 overflow-hidden hover:border-charcoal/15 transition-all duration-300">
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={item.property.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                  />
                  
                  {/* Remove Button */}
                  <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <form action={async () => {
                      "use server"
                      const { revalidatePath } = await import("next/cache")
                      await prisma.wishlist.delete({ where: { id: item.id } })
                      revalidatePath("/account/wishlist")
                    }}>
                      <button
                        type="submit"
                        className="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm border border-charcoal/10 text-charcoal/40 hover:text-red-500 hover:border-red-200 transition-all duration-300"
                      >
                        <X size={12} strokeWidth={1.5} />
                      </button>
                    </form>
                  </div>

                  {/* Saved Badge */}
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[8px] uppercase tracking-[0.2em] text-charcoal/60 flex items-center gap-1.5">
                      <Heart className="w-2.5 h-2.5 fill-current" />
                      Saved
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 md:p-6">
                  <Link href={`/properties/${item.property.slug}`}>
                    <h3 className="font-display text-lg text-charcoal tracking-wide mb-1 group-hover:text-charcoal/70 transition-colors">
                      {item.property.title}
                    </h3>
                  </Link>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-charcoal/30 mb-4">
                    {item.property.location}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-charcoal/5">
                    <p className="font-display text-sm text-charcoal tracking-wider">
                      {formatNpr(item.property.pricePerNight)}
                      <span className="text-[8px] font-sans tracking-[0.1em] uppercase text-charcoal/25 ml-1">/ night</span>
                    </p>
                    <Link
                      href={`/properties/${item.property.slug}`}
                      className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-charcoal/30 hover:text-charcoal transition-colors"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <PaginationControls
        basePath="/account/wishlist"
        page={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={total}
        startItem={pagination.startItem}
        endItem={pagination.endItem}
        label="saved properties"
      />
    </div>
  )
}
