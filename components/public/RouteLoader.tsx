"use client"

import { useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import { motion, useReducedMotion } from "framer-motion"
import { EASE } from "@/components/public/motion"

const noop = () => () => {}
/** True only after hydration on the client — safe for portal / DOM access. */
function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )
}

/**
 * Suspense fallback for public route transitions (see app/(public)/loading.tsx).
 *
 * Plan §5.4: "navigation must never feel blocked — skip full-screen curtain
 * overlays." The old full-screen cream Lottie cover (which blanked Nav,
 * Footer and content behind a scroll-locked curtain on every suspending
 * navigation) is replaced by a slim 1px gold progress hairline pinned to the
 * top of the viewport. The chrome stays visible and interactive the whole
 * time, so there is deliberately NO body scroll lock here any more.
 *
 * Preserved contracts:
 * - Portalled to <body> so it escapes the PageTransition stacking context
 *   (whose transform/opacity would otherwise trap it) and its z-[10100]
 *   stays above Nav (z-[10000]) and the mobile menu (z-[9999]).
 * - Hydration-gated via useSyncExternalStore so it is SSR-safe.
 * - Carries `.site-loader` so the <noscript> style in app/(public)/layout.tsx
 *   removes loader chrome entirely for no-JS visitors.
 *
 * Note on duration: this is a progress indicator tracking real network time,
 * not an entrance reveal, so the §5 600–1200ms rule does not apply — the bar
 * crawls toward ~92% with a decelerating ease and unmounts (with the whole
 * fallback) the instant the route resolves.
 */
export function RouteLoader() {
  const hydrated = useHydrated()
  const reduce = useReducedMotion()

  // In-flow placeholder: keeps the Footer from collapsing up under the Nav
  // while the incoming route's content streams in. Hidden for no-JS visitors
  // along with the rest of the loader chrome (.site-loader kill-switch).
  const spacer = <div aria-hidden className="site-loader min-h-[60vh] w-full" />

  if (!hydrated) return spacer

  return (
    <>
      {spacer}
      {createPortal(
        <div
          className="site-loader pointer-events-none fixed inset-x-0 top-0 z-[10100] h-px"
          role="status"
          aria-label="Loading"
        >
          {reduce ? (
            // Static activity hairline — no motion for reduced-motion users.
            <div className="h-full w-full bg-gold" />
          ) : (
            <motion.div
              className="h-full w-full origin-left bg-gold"
              animate={{ scaleX: [0, 0.55, 0.8, 0.92] }}
              transition={{ duration: 5, times: [0, 0.2, 0.55, 1], ease: EASE.outLuxe }}
            />
          )}
        </div>,
        document.body,
      )}
    </>
  )
}
