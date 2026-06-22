"use client"

import { useEffect, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import { LottieAnimation } from "@/components/ui/lottie-animation"
import srgAnimation from "@/lib/animations/srg.json"

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
 * Full-screen brand animation used as the Suspense fallback during public
 * route transitions (see app/(public)/loading.tsx).
 *
 * It is portalled to <body> so it escapes the PageTransition stacking context
 * (whose opacity animation would otherwise trap it and let the fixed Nav,
 * z-10000, paint on top). At z-10100 in the root stacking context it covers
 * the navbar, footer and floating buttons — nothing else shows while loading.
 */
export function RouteLoader() {
  const hydrated = useHydrated()

  // Lock background scroll while the overlay covers the page.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  if (!hydrated) return null

  return createPortal(
    <div
      className="site-loader fixed inset-0 z-[10100] flex items-center justify-center bg-cream"
      role="status"
      aria-label="Loading"
    >
      <LottieAnimation animationData={srgAnimation} loop className="h-44 w-44 sm:h-56 sm:w-56" />
    </div>,
    document.body,
  )
}
