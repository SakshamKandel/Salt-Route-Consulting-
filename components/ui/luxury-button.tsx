import React from 'react'
import Link from 'next/link'
import { cn } from "@/lib/utils"

interface LuxuryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  className?: string
  dark?: boolean
}

export function LuxuryButton({ href, onClick, children, className, dark = false, type, disabled, ...props }: LuxuryButtonProps) {
  const baseClasses = cn(
    "group relative inline-flex items-center justify-center overflow-hidden border px-10 py-4 text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-700",
    dark ? "border-white/30 text-white" : "border-charcoal/20 text-charcoal",
    className
  )

  const innerSpanClasses = cn(
    "absolute inset-0 z-0 h-full w-full translate-y-[100%] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0",
    dark ? "bg-white" : "bg-charcoal"
  )

  const textClasses = cn(
    "relative z-10 transition-colors duration-700",
    dark ? "group-hover:text-charcoal" : "group-hover:text-white"
  )

  const content = (
    <>
      <span className={innerSpanClasses} />
      <span className={textClasses}>{children}</span>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={cn(baseClasses, disabled && "opacity-50 cursor-not-allowed")} {...props}>
      {content}
    </button>
  )
}
