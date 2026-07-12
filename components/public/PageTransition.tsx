"use client"

import { useRef } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { usePathname } from "next/navigation"
import { EASE } from "@/components/public/motion"

/**
 * Route entrance transition: a quick 200ms fade with a tiny 4px rise,
 * re-keyed on `pathname` so every navigation gets one quiet entrance.
 *
 * Reduced from 500ms/12px to 200ms/4px so content appears almost
 * instantly — the old page stays visible until the new page is ready
 * (no loading.tsx Suspense fallback), then this subtle fade plays.
 *
 * Entrance-ONLY by design — App Router caveat: with `AnimatePresence
 * mode="wait"`, the exiting tree re-renders with the NEW route's content
 * unless the router context is frozen (the "FrozenRouter" LayoutRouterContext
 * hack), which ships a broken half-exit. Per §5.4 ("navigation must never
 * feel blocked") we take the low-risk reading: entrance only, no exit phase.
 *
 * This component renders the layout's <main> itself (motion.main) so the
 * transition sits on the page wrapper. The transform is cleared once the
 * entrance finishes so position:fixed/sticky descendants (booking bars,
 * sticky rails) anchor to the viewport again — a transformed ancestor would
 * otherwise become their containing block.
 */
const MAIN_CLASS = "flex-grow w-full overflow-x-hidden"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  // The globals.css reduced-motion backstop does not neutralize framer-motion
  // JS animations — guard explicitly and render a static <main>.
  if (reduce) {
    return <main className={MAIN_CLASS}>{children}</main>
  }

  return (
    <motion.main
      key={pathname}
      ref={ref}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: EASE.outLuxe }}
      onAnimationComplete={() => {
        // Belt-and-braces: drop any residual transform so <main> stops acting
        // as a containing block for fixed/sticky descendants.
        ref.current?.style.removeProperty("transform")
      }}
      className={MAIN_CLASS}
    >
      {children}
    </motion.main>
  )
}
