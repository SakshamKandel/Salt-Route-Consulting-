"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import Image from "next/image"
import { EASE } from "@/components/public/motion"

const noop = () => () => {}
/** True only after hydration on the client — safe for motion/portal usage. */
function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )
}

/** Keep the brand reveal on screen just long enough to register (§6: ≤300ms).
 *  Reduced from 300→120ms for faster perceived load on repeat visits. */
const MIN_DISPLAY_MS = 120
/** Safety net: never trap the visitor behind the overlay if `load` never fires. */
const MAX_DISPLAY_MS = 4000
/** sessionStorage key — once a visitor has seen the loader this session,
 *  skip it on subsequent navigations back to the public site. */
const SEEN_KEY = "site-loader-seen"

/**
 * Full-screen branded preloader shown on the first paint of the public site.
 * It mounts immediately (covering content), then fades out once the DOM is
 * interactive. Lives in the persistent public layout, so it does NOT
 * re-trigger on client-side navigation.
 *
 * Per plan §6.5 ("slim SiteLoader") this renders a static logo with a gentle
 * CSS opacity pulse instead of the Lottie, keeping lottie-web (~250KB) off
 * the critical path — the player is now only fetched where AiConcierge needs
 * it. LottieAnimation's prop API in components/ui/lottie-animation.tsx is
 * untouched. Preserved contracts: `.site-loader` class (noscript
 * kill-switch), z-[10100] above Nav, MIN/MAX display failsafes,
 * DOMContentLoaded-based hide, body scroll lock while covering.
 */
export function SiteLoader() {
  const hydrated = useHydrated()
  // Skip the overlay entirely on repeat visits within the same browser session
  // (e.g. navigating back to the homepage from a sub-page). First-time visitors
  // still get the branded reveal.
  const [visible, setVisible] = useState(true)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!visible) return
    try {
      if (sessionStorage.getItem(SEEN_KEY) === "1") {
        const skipTimer = window.setTimeout(() => setVisible(false), 0)
        return () => window.clearTimeout(skipTimer)
      }
    } catch {
      /* sessionStorage may be unavailable (private mode) — non-fatal */
    }
    const start = performance.now()
    let hidden = false

    const hide = () => {
      if (hidden) return
      hidden = true
      const remaining = Math.max(0, MIN_DISPLAY_MS - (performance.now() - start))
      window.setTimeout(() => {
        setVisible(false)
        try {
          sessionStorage.setItem(SEEN_KEY, "1")
        } catch {
          /* sessionStorage may be unavailable (private mode) — non-fatal */
        }
      }, remaining)
    }

    // Clear as soon as the DOM is parsed/interactive — do NOT wait for the
    // window 'load' event, which blocks on the hero video and all images.
    if (document.readyState === "interactive" || document.readyState === "complete") {
      hide()
    } else {
      document.addEventListener("DOMContentLoaded", hide, { once: true })
    }
    const maxTimer = window.setTimeout(hide, MAX_DISPLAY_MS)

    return () => {
      document.removeEventListener("DOMContentLoaded", hide)
      window.clearTimeout(maxTimer)
    }
  }, [visible])

  // Lock background scroll while the overlay is covering the page.
  useEffect(() => {
    if (!visible) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [visible])

  if (!hydrated) {
    return visible ? (
      <div
        className="site-loader fixed inset-0 z-[10100] flex items-center justify-center bg-cream"
        style={{ opacity: 1 }}
        role="status"
        aria-label="Loading Salt Route Corp"
      >
        <style>{`@keyframes site-loader-pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
        <Image
          src="/brand/logo.png"
          alt=""
          width={768}
          height={319}
          priority
          className="h-auto w-28 sm:w-36"
        />
      </div>
    ) : null
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="site-loader"
          className="site-loader fixed inset-0 z-[10100] flex items-center justify-center bg-cream"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.5, ease: EASE.inOutLuxe }}
          role="status"
          aria-label="Loading Salt Route Corp"
        >
          {/* Keyframes are scoped here (globals.css is owned elsewhere); the
              global reduced-motion backstop also freezes this CSS animation. */}
          <style>{`@keyframes site-loader-pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
          <Image
            src="/brand/logo.png"
            alt=""
            width={768}
            height={319}
            priority
            className="h-auto w-28 sm:w-36"
            style={
              reduce
                ? undefined
                : { animation: "site-loader-pulse 2.4s var(--ease-in-out-luxe) infinite" }
            }
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
