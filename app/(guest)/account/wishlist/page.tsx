import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Heart, X, ArrowRight, MapPin } from "lucide-react"
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
    select: {
      id: true,
      property: {
        select: {
          slug: true,
          title: true,
          location: true,
          pricePerNight: true,
          images: {
            take: 1,
            orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
            select: { url: true, isPrimary: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-10">
      {/* ─── PAGE HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium text-[#C9A96E] uppercase tracking-[0.18em] mb-1.5">
            Saved Stays
          </p>
          <h1 className="font-display text-3xl md:text-4xl text-[#1B3A5C] tracking-wide">
            Your Collection
          </h1>
          <p className="text-[15px] leading-relaxed text-[#1B3A5C]/70 mt-2">
            {wishlists.length > 0
              ? `${wishlists.length} saved ${wishlists.length === 1 ? "stay" : "stays"}, kept close for your next journey.`
              : "The stays you love, kept close for your next journey."}
          </p>
        </div>
        <Link
          href="/properties"
          className="group inline-flex items-center gap-2 py-2.5 text-[13px] uppercase tracking-[0.15em] font-medium text-[#1B3A5C]/60 hover:text-[#1B3A5C] transition-colors shrink-0"
        >
          <span>Discover More</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
        </Link>
      </div>

      {wishlists.length === 0 ? (
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-8 sm:p-16 text-center">
          <Heart className="h-8 w-8 text-[#1B3A5C]/15 mx-auto mb-4" strokeWidth={1.5} />
          <h3 className="font-display text-xl text-[#1B3A5C] tracking-wide mb-2">Start saving stays</h3>
          <p className="text-[14px] text-[#1B3A5C]/60 mb-6 max-w-sm mx-auto">
            Save your favourite properties and keep every stay you love close at hand.
          </p>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B3A5C] text-[#FFFAF3] rounded-lg text-[13px] font-medium hover:bg-[#2A4F7A] transition-colors"
          >
            Explore stays <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {wishlists.map((item) => {
            const imageUrl = getPrimaryImageUrl(item.property.images) || "/placeholder-property.jpg"

            return (
              <div key={item.id} className="group bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl overflow-hidden hover:border-[#1B3A5C]/15 transition-colors">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#1B3A5C]/5">
                  <Image
                    src={imageUrl}
                    alt={item.property.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Remove Button */}
                  <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <form action={async () => {
                      "use server"
                      const { revalidatePath } = await import("next/cache")
                      await prisma.wishlist.delete({ where: { id: item.id } })
                      revalidatePath("/account/wishlist")
                    }}>
                      <button
                        type="submit"
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FFFAF3] border border-[#1B3A5C]/10 text-[#1B3A5C]/40 hover:text-rose-500 hover:border-rose-200 transition-colors"
                        title="Remove from collection"
                      >
                        <X size={12} strokeWidth={1.5} />
                      </button>
                    </form>
                  </div>

                  {/* Saved Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-flex items-center gap-1.5 bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1B3A5C]/70">
                      <Heart className="w-2.5 h-2.5 fill-[#C9A96E] text-[#C9A96E]" />
                      Saved
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">
                  <p className="text-[11px] text-[#C9A96E] uppercase tracking-[0.18em] font-medium mb-1.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {item.property.location}
                  </p>
                  <Link href={`/properties/${item.property.slug}`}>
                    <h3 className="font-display text-xl text-[#1B3A5C] tracking-wide group-hover:text-[#2A4F7A] transition-colors">
                      {item.property.title}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#1B3A5C]/5">
                    <p className="text-base font-semibold text-[#1B3A5C] tabular-nums">
                      {formatNpr(item.property.pricePerNight)}
                      <span className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#1B3A5C]/55 ml-1.5">/ night</span>
                    </p>
                    <Link
                      href={`/properties/${item.property.slug}`}
                      className="flex items-center gap-1.5 py-2.5 text-[13px] uppercase tracking-[0.15em] font-medium text-[#1B3A5C]/60 hover:text-[#1B3A5C] transition-colors"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
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
