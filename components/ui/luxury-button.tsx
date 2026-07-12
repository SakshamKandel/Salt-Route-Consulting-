import React from 'react'
import Link from 'next/link'
import { cn } from "@/lib/utils"

interface LuxuryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  className?: string
  dark?: boolean
  /**
   * 'ghost' (default) keeps the original hairline-outline whisper CTA.
   * 'primary' is the one high-weight filled CTA allowed per page (plan
   * §3.4): filled navy (cream on dark surfaces) with a §5.3 fill-wipe —
   * the fill sweeps in from the left over 350ms, text crossfades, no scale.
   */
  variant?: 'ghost' | 'primary'
}

export function LuxuryButton({ href, onClick, children, className, dark = false, variant = 'ghost', type, disabled, ...props }: LuxuryButtonProps) {
  const isPrimary = variant === 'primary'

  const baseClasses = cn(
    "group relative inline-flex min-w-0 items-center justify-center overflow-hidden border text-center uppercase",
    isPrimary
      ? cn(
          "px-10 py-5 text-[11px] md:text-xs tracking-[0.2em] font-medium transition-colors duration-[350ms] ease-standard",
          dark ? "border-cream bg-cream text-navy" : "border-navy bg-navy text-cream"
        )
      : cn(
          "px-6 py-4 text-[10px] tracking-[0.18em] font-bold transition-all duration-700 sm:px-10 sm:tracking-[0.3em]",
          dark ? "border-white/30 text-white" : "border-charcoal/20 text-charcoal"
        ),
    className
  )

  // Sliding fill: ghost rises from the bottom (original mechanics, 700ms);
  // primary wipes in from the left (350ms, ease-standard — §5.3).
  const innerSpanClasses = isPrimary
    ? cn(
        "absolute inset-0 z-0 h-full w-full origin-left scale-x-0 transition-transform duration-[350ms] ease-standard group-hover:scale-x-100",
        dark ? "bg-navy" : "bg-cream"
      )
    : cn(
        "absolute inset-0 z-0 h-full w-full translate-y-[100%] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0",
        dark ? "bg-white" : "bg-charcoal"
      )

  const textClasses = isPrimary
    ? cn(
        "relative z-10 min-w-0 transition-colors duration-[350ms] ease-standard",
        dark ? "group-hover:text-cream" : "group-hover:text-navy"
      )
    : cn(
        "relative z-10 min-w-0 transition-colors duration-700",
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
