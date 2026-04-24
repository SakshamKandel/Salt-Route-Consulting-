import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { HeartOff } from "lucide-react"

export default async function WishlistPage() {
  const session = await auth()
  if (!session?.user?.id) return redirect("/login")

  const wishlists = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      property: {
        include: { images: { take: 1 } }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display text-navy">My Wishlist</h1>

      {wishlists.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Your wishlist is empty.
          <div className="mt-4">
            <Button asChild className="bg-gold text-navy hover:bg-gold/90">
              <Link href="/properties">Browse Properties</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlists.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <div className="relative w-full h-48">
                {item.property.images[0] ? (
                  <Image
                    src={item.property.images[0].url}
                    alt={item.property.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
                <div className="absolute top-2 right-2">
                  <form action={async () => {
                    "use server"
                    const { revalidatePath } = await import("next/cache")
                    await prisma.wishlist.delete({ where: { id: item.id } })
                    revalidatePath("/account/wishlist")
                  }}>
                    <Button type="submit" size="icon" variant="destructive" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <HeartOff size={16} />
                    </Button>
                  </form>
                </div>
              </div>
              <CardContent className="p-4">
                <Link href={`/properties/${item.property.id}`}>
                  <h3 className="font-bold text-lg hover:underline truncate">{item.property.title}</h3>
                </Link>
                <p className="text-gray-500 text-sm mt-1 truncate">{item.property.location}</p>
                <p className="font-medium mt-2">${item.property.pricePerNight.toString()} <span className="text-sm font-normal text-gray-500">/ night</span></p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
