"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const MIN_DISPLAY_MS = 1400
const FAILSAFE_MS = 5000
const SESSION_KEY = "salt-route-loaded"

export function LoadingScreen() {
  const [show, setShow] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (typeof window === "undefined") return

    if (sessionStorage.getItem(SESSION_KEY)) {
      setShow(false)
      return
    }

    const start = Date.now()
    let dismissed = false

    const dismiss = () => {
      if (dismissed) return
      dismissed = true
      const elapsed = Date.now() - start
      const wait = Math.max(0, MIN_DISPLAY_MS - elapsed)
      window.setTimeout(() => {
        setShow(false)
        sessionStorage.setItem(SESSION_KEY, "1")
      }, wait)
    }

    if (document.readyState === "complete") {
      dismiss()
    } else {
      window.addEventListener("load", dismiss, { once: true })
    }

    const failsafe = window.setTimeout(dismiss, FAILSAFE_MS)

    return () => {
      window.removeEventListener("load", dismiss)
      window.clearTimeout(failsafe)
    }
  }, [])

  if (!mounted) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 z-[10001] bg-charcoal flex flex-col items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-9 px-6"
          >
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.4em" }}
              animate={{ opacity: 1, letterSpacing: "0.6em" }}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="text-[10px] md:text-[11px] uppercase text-white/45 font-light"
            >
              Salt Route
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
              className="font-display text-white tracking-wide uppercase leading-none"
              style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
            >
              Consulting
            </motion.h1>

            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 80, opacity: 1 }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
              className="h-px bg-gold/55 mx-auto"
              aria-hidden
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
              className="text-[9px] uppercase tracking-[0.5em] text-white/30 font-light"
            >
              Boutique Stays · Property Care · Nepal
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent origin-left"
            aria-hidden
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
