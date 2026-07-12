"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

// ssr:false is only legal inside a client component — that is this wrapper's
// whole job. AiConcierge itself is untouched (owned by another work order).
const AiConcierge = dynamic(
  () => import("@/components/public/AiConcierge").then((m) => m.AiConcierge),
  { ssr: false },
)

/**
 * Defers the floating concierge widget off the critical path (plan §6.5):
 * the chunk (framer-motion variants + srg.json + lucide icons) is neither
 * server-rendered nor part of the layout's initial client bundle, and it is
 * mounted only after the main thread goes idle — requestIdleCallback where
 * available, with a ~2s setTimeout fallback (Safari).
 */
export function DeferredConcierge() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 2000 })
      return () => window.cancelIdleCallback(id)
    }
    const timer = window.setTimeout(() => setReady(true), 2000)
    return () => window.clearTimeout(timer)
  }, [])

  if (!ready) return null
  return <AiConcierge />
}
