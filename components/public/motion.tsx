"use client"

// ── Shared luxury motion primitives ─────────────────────────────────────────
// Slow, few, silent. Long durations, tiny travel, heavy decelerating eases,
// fired once. Every primitive honors prefers-reduced-motion by rendering its
// final state with no animation. Use these on general public pages; the
// Brochure* stack keeps its own preview-gated helpers in property/primitives.tsx.

import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion"
import Image, { type ImageProps } from "next/image"
import { useEffect, useRef, useState, type ReactNode, type ElementType } from "react"
import { twMerge } from "tailwind-merge"

/** Luxury easing curves (mirror the --ease-* tokens in globals.css). */
export const EASE = {
  outLuxe: [0.22, 1, 0.36, 1],
  outSoft: [0.16, 1, 0.3, 1],
  inOutLuxe: [0.77, 0, 0.175, 1],
  standard: [0.4, 0, 0.2, 1],
  outQuart: [0.25, 1, 0.5, 1],
} as const

const VIEWPORT = { once: true, margin: "0px 0px -15% 0px" } as const

// Static motion components (never create motion(tag) during render — that
// remounts children). Extend this map if a new wrapper tag is needed.
const MOTION = {
  div: motion.div,
  section: motion.section,
  li: motion.li,
  span: motion.span,
  figure: motion.figure,
} as const
type MotionTagName = keyof typeof MOTION

/**
 * Default scroll-reveal: fade + short rise, fired once at ~15% into view.
 * When `stagger` is set, direct <Reveal.Item> children animate in sequence.
 */
export function Reveal({
  children,
  as = "div",
  className,
  delay = 0,
  y = 24,
  stagger,
  id,
}: {
  children: ReactNode
  as?: MotionTagName
  className?: string
  delay?: number
  y?: number
  stagger?: number
  id?: string
}) {
  const reduce = useReducedMotion()
  const MotionTag = MOTION[as]

  if (reduce) {
    const Tag = as as ElementType
    return <Tag id={id} className={className}>{children}</Tag>
  }

  if (stagger) {
    const container: Variants = {
      hidden: {},
      show: { transition: { staggerChildren: stagger, delayChildren: delay } },
    }
    return (
      <MotionTag
        id={id}
        className={className}
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
      >
        {children}
      </MotionTag>
    )
  }

  return (
    <MotionTag
      id={id}
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.8, delay, ease: EASE.outLuxe }}
    >
      {children}
    </MotionTag>
  )
}

/** A child of a staggered <Reveal stagger>. */
Reveal.Item = function RevealItem({
  children,
  as = "div",
  className,
  y = 24,
}: {
  children: ReactNode
  as?: MotionTagName
  className?: string
  y?: number
}) {
  const MotionTag = MOTION[as]
  const item: Variants = {
    hidden: { opacity: 0, y },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE.outLuxe } },
  }
  return (
    <MotionTag className={className} variants={item}>
      {children}
    </MotionTag>
  )
}

/**
 * Line-masked heading reveal — each line rises from behind an overflow clip.
 * Pass an array of lines (H1/H2 only; expensive to run everywhere).
 */
export function RevealText({
  lines,
  as = "h2",
  className,
  delay = 0,
  clipPad,
}: {
  lines: string[]
  as?: ElementType
  className?: string
  delay?: number
  // Vertical padding (CSS length) added inside the line-mask clip box so
  // fonts with tall ascenders/descenders aren't cropped.
  // Negative margin cancels the padding so surrounding layout is unchanged.
  clipPad?: string
}) {
  const reduce = useReducedMotion()
  const Tag = as as ElementType
  const clipStyle = clipPad
    ? {
        paddingTop: clipPad,
        paddingBottom: clipPad,
        marginTop: `-${clipPad}`,
        marginBottom: `-${clipPad}`,
        overflowClipMargin: clipPad,
      }
    : undefined

  if (reduce) {
    return (
      <Tag className={className}>
        {lines.map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </Tag>
    )
  }

  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden" style={clipStyle}>
          <motion.span
            className="block"
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.8, delay: delay + i * 0.08, ease: EASE.outLuxe }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

/**
 * Curtain image reveal — the frame uncovers via clip-path while the photo
 * counter-scales to rest. The single most "expensive-feeling" technique.
 */
export function CurtainImage({
  className,
  direction = "up",
  rounded = false,
  children,
}: {
  className?: string
  direction?: "up" | "left"
  rounded?: boolean
  children: ReactNode
}) {
  const reduce = useReducedMotion()
  const hidden =
    direction === "left" ? "inset(0 100% 0 0)" : "inset(0 0 100% 0)"

  if (reduce) {
    return (
      <div className={twMerge("relative overflow-hidden", rounded ? "" : "rounded-none", className)}>
        {children}
      </div>
    )
  }

  return (
    <div className={twMerge("relative overflow-hidden", className)}>
      <motion.div
        className="relative h-full w-full"
        initial={{ clipPath: hidden }}
        whileInView={{ clipPath: "inset(0 0 0 0)" }}
        viewport={VIEWPORT}
        transition={{ duration: 1.0, ease: EASE.inOutLuxe }}
      >
        <motion.div
          className="relative h-full w-full"
          initial={{ scale: 1.15 }}
          whileInView={{ scale: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 1.0, ease: EASE.outSoft }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  )
}

/**
 * Whisper-parallax: the wrapped image drifts against scroll. Keep `speed`
 * small (≤0.15) — more reads tacky. Parent clips; image should be sized ~120%.
 */
export function ParallaxImage({
  className,
  speed = 0.1,
  children,
}: {
  className?: string
  speed?: number
  children: ReactNode
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const pct = Math.min(Math.max(speed, 0), 0.2) * 100
  const yRaw = useTransform(scrollYProgress, [0, 1], [`-${pct}%`, `${pct}%`])
  const y = useSpring(yRaw, { stiffness: 100, damping: 30, mass: 0.5 })

  if (reduce) {
    return (
      <div ref={ref} className={twMerge("relative overflow-hidden", className)}>
        {children}
      </div>
    )
  }

  return (
    <div ref={ref} className={twMerge("relative overflow-hidden", className)}>
      <motion.div style={{ y }} className="absolute inset-x-0 -top-[20%] h-[140%] w-full will-change-transform">
        {children}
      </motion.div>
    </div>
  )
}

/**
 * Ken Burns slow-zoom hero. CSS-driven (no JS runtime); freezes on
 * reduced-motion. Wrap a next/image with `fill`.
 */
export function KenBurns({
  className,
  duration = 20,
  scale = 1.06,
  children,
}: {
  className?: string
  duration?: number
  scale?: number
  children: ReactNode
}) {
  const reduce = useReducedMotion()
  return (
    <div className={twMerge("relative overflow-hidden", className)}>
      <div
        className="relative h-full w-full will-change-transform"
        style={
          reduce
            ? undefined
            : {
                animation: `kenburns ${duration}s ease-out both`,
                // @ts-expect-error — custom property consumed by the keyframe below
                "--kb-scale": String(scale),
              }
        }
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Counts up to `value` the first time it scrolls into view. Numbers land on the
 * final value immediately when the user prefers reduced motion.
 */
export function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" })
  const reduce = useReducedMotion()
  // Tracks 0 → 1 animation progress rather than the number itself, so no
  // setState happens synchronously inside the effect.
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!inView || reduce) return
    const controls = animate(0, 1, {
      duration: 1.6,
      ease: EASE.outLuxe,
      onUpdate: setProgress,
    })
    return () => controls.stop()
  }, [inView, reduce])

  const shown = reduce ? value : value * progress

  return (
    <span ref={ref} className={twMerge("tabular-nums", className)}>
      {prefix}
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  )
}

/** next/image with a blur-up placeholder by default when a blurDataURL exists. */
export function SmartImage({
  blurDataURL,
  ...props
}: ImageProps & { blurDataURL?: string }) {
  return (
    <Image
      {...props}
      {...(blurDataURL
        ? { placeholder: "blur" as const, blurDataURL }
        : {})}
    />
  )
}
