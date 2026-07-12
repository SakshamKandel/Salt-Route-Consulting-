"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { useReducedMotion } from "framer-motion"

/**
 * Slim 1px gold progress hairline pinned to the top of the viewport.
 *
 * Replaces the old RouteLoader (which lived in loading.tsx and showed a
 * blank min-h-[60vh] spacer during navigation). This component lives in
 * the persistent layout, takes zero layout space (position: fixed, 1px),
 * and briefly animates when the route changes so the user gets feedback
 * that navigation is happening — without any blank space.
 *
 * Detection: compares the previous pathname with the current one. When
 * they differ, a new navigation has completed (App Router updates
 * usePathname() after the new page is ready). We show a quick sweep
 * to signal the transition.
 */
export function NavProgress() {
  const pathname = usePathname()
  const reduce = useReducedMotion()
  const [active, setActive] = useState(false)
  const prevPath = useRef(pathname)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname
      setActive(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setActive(false), reduce ? 0 : 600)
    }
    return () => clearTimeout(timer.current)
  }, [pathname, reduce])

  if (!active) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[10100] h-px"
      role="status"
      aria-label="Navigating"
    >
      {reduce ? (
        <div className="h-full w-full bg-gold" />
      ) : (
        <div
          className="h-full bg-gold"
          style={{
            animation: "nav-progress-sweep 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
          }}
        />
      )}
      <style>{`@keyframes nav-progress-sweep{0%{width:0}30%{width:55%}60%{width:80%}100%{width:100%}}`}</style>
    </div>
  )
}
