"use client"

import { useState, useTransition } from "react"
import { Heart } from "lucide-react"
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
        toast.success(data.wishlisted ? "Saved to Sanctuary Collection" : "Removed from Sanctuary Collection")
      } catch {
        toast.error("Failed to update collection")
      }
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`group flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-sans transition-all duration-500 pb-1 border-b ${
        wishlisted 
          ? "text-gold/80 border-gold/80 hover:text-charcoal hover:border-charcoal" 
          : "text-charcoal/40 border-transparent hover:text-gold/80 hover:border-gold/30"
      }`}
    >
      <Heart 
        size={14} 
        strokeWidth={1.5}
        className={`transition-all duration-500 ${wishlisted ? "fill-gold/80 text-gold/80 group-hover:fill-charcoal group-hover:text-charcoal" : "text-charcoal/40 group-hover:text-gold/80"}`} 
      />
      {wishlisted ? "In Your Collection" : "Save to Collection"}
    </button>
  )
}
