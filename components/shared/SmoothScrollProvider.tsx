"use client"

import { usePathname } from "next/navigation"
import { useReducedMotion } from "framer-motion"
import { ReactLenis, useLenis } from "lenis/react"
import { useEffect, useRef, type ReactNode } from "react"

/**
 * Guarded Lenis smooth scroll (plan §5.5).
 *
 * Mount exactly once, inside the PUBLIC layout wrapper (app/(public)/layout.tsx)
 * — never in the root layout; the admin/owner/guest portals keep native
 * scrolling. Modals and scrollable sub-regions (booking calendar popovers,
 * AiConcierge message list, nav drawers, lightboxes — anything overflow-y-auto)
 * opt back into native scrolling with the `data-lenis-prevent` attribute,
 * which Lenis honors natively (structural CSS lives in app/globals.css).
 *
 * Lerped (not duration-tweened) wheel scrolling: Lenis prefers `duration` over
 * `lerp`, and a 1.2s tween restarted on every wheel tick makes trackpad
 * scrolling crawl. `lerp` continuously damps toward the target instead, so the
 * page tracks the input instead of feeling stuck.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()

  // Honor prefers-reduced-motion: fall back to native scrolling entirely.
  if (reduce) return <>{children}</>

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.11,
        smoothWheel: true,
        // Lenis 1.x renamed smoothTouch → syncTouch; false = fully native
        // touch scrolling, which is what the plan requires (§5.5).
        syncTouch: false,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        infinite: false,
        autoResize: true,
      }}
    >
      <ScrollMaintenance />
      {children}
    </ReactLenis>
  )
}

/**
 * Keeps Lenis's cached scroll height honest.
 *
 * Lenis stores `scrollHeight` once and only refreshes it from a ResizeObserver
 * on <html> (debounced 250ms). Whenever the document grows or shrinks for a
 * reason that observer misses — late-loading images, lazy sections, web fonts,
 * client-side navigation to a taller/shorter route — the cached `limit` goes
 * stale and Lenis clamps every scroll to it: the page appears to get stuck
 * part-way down. This watches the real content box and forces a resize.
 */
function ScrollMaintenance() {
  const lenis = useLenis()
  const pathname = usePathname()
  const isHistoryNav = useRef(false)

  // Back/forward navigations must keep the browser's restored scroll position.
  useEffect(() => {
    const onPopState = () => {
      isHistoryNav.current = true
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  // Re-measure the document whenever its height actually changes. <body> is
  // the element that reliably carries the full content height, so observing it
  // catches the cases Lenis's own <html> observer can miss.
  useEffect(() => {
    if (!lenis) return
    if (typeof ResizeObserver === "undefined") return

    const observer = new ResizeObserver(() => {
      // Only re-measure when the cached height is actually stale.
      // `dimensions.resize()` refreshes the measurement alone; `lenis.resize()`
      // would also re-sync animatedScroll and visibly interrupt an in-flight
      // smooth scroll (and undo browser scroll restoration).
      if (document.documentElement.scrollHeight !== lenis.dimensions.scrollHeight) {
        lenis.dimensions.resize()
      }
    })
    if (document.body) observer.observe(document.body)
    observer.observe(document.documentElement)

    return () => observer.disconnect()
  }, [lenis])

  // Late arrivals that change layout height after first paint.
  useEffect(() => {
    if (!lenis) return

    const resize = () => lenis.dimensions.resize()
    window.addEventListener("load", resize)
    window.addEventListener("orientationchange", resize)

    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) resize()
    })

    return () => {
      cancelled = true
      window.removeEventListener("load", resize)
      window.removeEventListener("orientationchange", resize)
    }
  }, [lenis])

  // Route changes: land at the top of the new page and re-measure once the
  // incoming tree has painted (and again after images/fonts settle).
  useEffect(() => {
    if (!lenis) return

    const restore = isHistoryNav.current
    isHistoryNav.current = false

    if (!restore) {
      window.scrollTo(0, 0)
      lenis.scrollTo(0, { immediate: true, force: true })
    }

    // Re-measure once the incoming tree has painted (and again after images
    // and fonts have settled). Dimensions only — never `lenis.resize()`, which
    // would re-sync animatedScroll and fight the browser's own restoration on
    // back/forward navigations.
    const frames = [
      requestAnimationFrame(() => lenis.dimensions.resize()),
      window.setTimeout(() => lenis.dimensions.resize(), 120),
      window.setTimeout(() => lenis.dimensions.resize(), 600),
    ]

    return () => {
      frames.forEach((id) => {
        cancelAnimationFrame(id)
        window.clearTimeout(id)
      })
    }
  }, [pathname, lenis])

  return null
}
