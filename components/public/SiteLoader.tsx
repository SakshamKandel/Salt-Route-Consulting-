"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { LottieAnimation } from "@/components/ui/lottie-animation"
import srgAnimation from "@/lib/animations/srg.json"

/** Keep the brand reveal on screen long enough to read, even on fast loads. */
const MIN_DISPLAY_MS = 500
/** Safety net: never trap the visitor behind the overlay if `load` never fires. */
const MAX_DISPLAY_MS = 6000

/**
 * Full-screen branded preloader shown on the first paint of the public site.
 * It mounts immediately (covering content), then fades out once the window has
 * finished loading — i.e. "until the content comes". Lives in the persistent
 * public layout, so it does NOT re-trigger on client-side navigation.
 */
export function SiteLoader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const start = performance.now()
    let hidden = false

    const hide = () => {
      if (hidden) return
      hidden = true
      const remaining = Math.max(0, MIN_DISPLAY_MS - (performance.now() - start))
      window.setTimeout(() => setVisible(false), remaining)
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
  }, [])

  // Lock background scroll while the overlay is covering the page.
  useEffect(() => {
    if (!visible) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="site-loader"
          className="site-loader fixed inset-0 z-[10100] flex items-center justify-center bg-cream"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          role="status"
          aria-label="Loading Salt Route Consulting"
        >
          <LottieAnimation
            animationData={srgAnimation}
            loop
            className="h-44 w-44 sm:h-56 sm:w-56"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
