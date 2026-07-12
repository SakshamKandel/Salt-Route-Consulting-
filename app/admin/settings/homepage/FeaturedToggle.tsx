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
      className={`flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full font-medium transition-colors ${
        isFeatured
          ? "bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/30 hover:bg-[#C9A96E]/25"
          : "bg-[#1B3A5C]/5 text-[#1B3A5C]/45 border border-[#1B3A5C]/10 hover:bg-[#1B3A5C]/10"
      }`}
      title={isFeatured ? "Click to unfeature" : "Click to feature on homepage"}
    >
      <Star size={12} className={isFeatured ? "fill-[#C9A96E]" : ""} />
      {isPending ? "..." : isFeatured ? "Featured" : "Not featured"}
    </button>
  )
}
