"use client"

import { useState, useTransition } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function WishlistButton({
  propertyId,
  initialWishlisted,
}: {
  propertyId: string
  initialWishlisted: boolean
}) {
  const { data: session } = useSession()
  const router = useRouter()
  const [wishlisted, setWishlisted] = useState(initialWishlisted)
  const [pending, startTransition] = useTransition()

  function toggle() {
    if (!session?.user) {
      router.push("/login")
      return
    }
    startTransition(async () => {
      try {
        const res = await fetch(`/api/wishlist/${propertyId}`, { method: "POST" })
        if (!res.ok) throw new Error()
        const data = await res.json()
        setWishlisted(data.wishlisted)
        toast.success(data.wishlisted ? "Added to wishlist" : "Removed from wishlist")
      } catch {
        toast.error("Failed to update wishlist")
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={pending}
      className={`border-navy/20 ${wishlisted ? "bg-red-50 text-red-500 border-red-200" : "text-navy hover:text-red-500"}`}
    >
      <Heart size={16} className={wishlisted ? "fill-red-500" : ""} />
      {wishlisted ? "Wishlisted" : "Wishlist"}
    </Button>
  )
}
