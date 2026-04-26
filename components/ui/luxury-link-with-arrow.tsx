"use client"

import React from 'react'
import Link from 'next/link'
import { cn } from "@/lib/utils"

interface LuxuryLinkWithArrowProps {
  href: string
  children: React.ReactNode
  className?: string
  color?: "charcoal" | "white" | "gold"
}

export function LuxuryLinkWithArrow({ href, children, className, color = "charcoal" }: LuxuryLinkWithArrowProps) {
  const colorMap = {
    charcoal: "text-charcoal bg-charcoal",
    white: "text-white bg-white",
    gold: "text-gold bg-gold"
  }

  return (
    <Link 
      href={href} 
      className={cn(
        "group inline-flex items-center gap-6 text-[10px] uppercase tracking-[0.4em] font-bold py-2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]", 
        colorMap[color].split(' ')[0], 
        className
      )}
    >
      <span className="relative z-10 transition-transform duration-700 group-hover:text-gold">{children}</span>
      <div className="flex items-center gap-4">
        <span className={cn(
          "h-[px] w-12 h-[1px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-20", 
          colorMap[color].split(' ')[1]
        )} />
        <svg 
          width="6" 
          height="10" 
          viewBox="0 0 6 10" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2"
        >
          <path d="M1 9L5 5L1 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </Link>
  )
}
