"use client"

import { ReactLenis } from "lenis/react"
import { ReactNode } from "react"
import { useReducedMotion } from "framer-motion"

/**
 * Guarded Lenis smooth scroll (plan §5.5).
 *
 * Mount exactly once, inside the PUBLIC layout wrapper (app/(public)/layout.tsx)
 * — never in the root layout; the admin/owner/guest portals keep native
 * scrolling. Modals and scrollable sub-regions (booking calendar popovers,
 * AiConcierge message list, nav drawers, lightboxes — anything overflow-y-auto)
 * opt back into native scrolling with the `data-lenis-prevent` attribute,
 * which Lenis honors natively (structural CSS lives in app/globals.css).
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()

  // Honor prefers-reduced-motion: fall back to native scrolling entirely.
  if (reduce) return <>{children}</>

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        duration: 1.2,
        smoothWheel: true,
        // Lenis 1.x renamed smoothTouch → syncTouch; false = fully native
        // touch scrolling, which is what the plan requires (§5.5).
        syncTouch: false,
        wheelMultiplier: 1.1,
        touchMultiplier: 1.5,
        infinite: false,
      }}
    >
      {children}
    </ReactLenis>
  )
}
