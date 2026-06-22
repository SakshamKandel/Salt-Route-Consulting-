"use client"

import { useEffect, useRef } from "react"
import type { AnimationItem } from "lottie-web"

type LottieAnimationProps = {
  /** Parsed Lottie JSON (import the .json file and pass it here). */
  animationData: unknown
  loop?: boolean
  autoplay?: boolean
  className?: string
  style?: React.CSSProperties
  /** Fires when a non-looping animation reaches its last frame. */
  onComplete?: () => void
}

/**
 * Thin, SSR-safe wrapper around lottie-web. The player is dynamically
 * imported inside an effect so it never executes during server rendering
 * (lottie-web touches `document`), and is fully torn down on unmount.
 */
export function LottieAnimation({
  animationData,
  loop = true,
  autoplay = true,
  className,
  style,
  onComplete,
}: LottieAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onCompleteRef = useRef(onComplete)

  // Keep the latest callback in a ref without re-running the load effect.
  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  useEffect(() => {
    let anim: AnimationItem | null = null
    let cancelled = false

    void import("lottie-web").then((mod) => {
      if (cancelled || !containerRef.current) return
      anim = mod.default.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop,
        autoplay,
        animationData,
      })
      if (onCompleteRef.current) {
        anim.addEventListener("complete", () => onCompleteRef.current?.())
      }
    })

    return () => {
      cancelled = true
      anim?.destroy()
    }
  }, [animationData, loop, autoplay])

  return <div ref={containerRef} className={className} style={style} aria-hidden="true" />
}
