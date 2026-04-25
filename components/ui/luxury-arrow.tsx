import React from 'react'
import { cn } from "@/lib/utils"

interface LuxuryArrowProps {
  className?: string
  color?: "charcoal" | "white" | "gold"
}

export function LuxuryArrow({ className, color = "charcoal" }: LuxuryArrowProps) {
  const colorMap = {
    charcoal: "bg-charcoal text-charcoal",
    white: "bg-white text-white",
    gold: "bg-gold text-gold"
  }

  return (
    <div className={cn("group flex items-center gap-4 cursor-pointer", className)}>
      <span className={cn("h-[1px] w-6 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-16", colorMap[color].split(' ')[0])} />
      <svg 
        width="6" 
        height="10" 
        viewBox="0 0 6 10" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={cn("transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2", colorMap[color].split(' ')[1])}
      >
        <path d="M1 9L5 5L1 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}
