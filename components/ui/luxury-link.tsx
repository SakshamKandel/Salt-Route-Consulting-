import React from 'react'
import Link from 'next/link'
import { cn } from "@/lib/utils"

interface LuxuryLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  color?: "charcoal" | "white" | "gold"
}

export function LuxuryLink({ href, children, className, color = "charcoal" }: LuxuryLinkProps) {
  const colorMap = {
    charcoal: "text-charcoal bg-charcoal",
    white: "text-white bg-white",
    gold: "text-gold bg-gold"
  }

  return (
    <Link 
      href={href} 
      className={cn("group relative inline-block text-[10px] uppercase tracking-[0.3em] font-bold pb-2", colorMap[color].split(' ')[0], className)}
    >
      <span className="relative z-10">{children}</span>
      <span className={cn("absolute bottom-0 left-0 w-full h-[1px] origin-center scale-x-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100", colorMap[color].split(' ')[1])} />
    </Link>
  )
}
