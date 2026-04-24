"use client"

import { useState } from "react"
import { toggleFeaturedAction } from "./actions"
import { Star } from "lucide-react"

export function FeaturedToggle({ propertyId, featured }: { propertyId: string; featured: boolean }) {
  const [isFeatured, setIsFeatured] = useState(featured)
  const [isPending, setIsPending] = useState(false)

  const handleToggle = async () => {
    setIsPending(true)
    const newValue = !isFeatured
    const res = await toggleFeaturedAction(propertyId, newValue)
    if (!res.error) setIsFeatured(newValue)
    setIsPending(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
        isFeatured
          ? "bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30"
          : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
      }`}
      title={isFeatured ? "Click to unfeature" : "Click to feature on homepage"}
    >
      <Star size={12} className={isFeatured ? "fill-gold" : ""} />
      {isPending ? "..." : isFeatured ? "Featured" : "Not featured"}
    </button>
  )
}
