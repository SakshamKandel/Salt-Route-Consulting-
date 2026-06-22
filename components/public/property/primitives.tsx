"use client"

// ── Shared brochure primitives ──────────────────────────────────────────────
// Animation + preview-guard helpers and the minimal brand vocabulary used by
// every Brochure* block. Motion is auto-disabled when embedded in the admin
// live preview (PreviewContext = true) so all sections render immediately.

import { createContext, useContext, useState } from "react"
import Image, { type ImageProps } from "next/image"
import { motion } from "framer-motion"

export const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070&auto=format&fit=crop"

/** True when the page is embedded in the admin live-preview pane (motion off). */
export const PreviewContext = createContext(false)
export const usePreview = () => useContext(PreviewContext)

/** next/image that falls back to a stock photo if the source fails to load. */
export function SafeImage({
  src,
  fallbackSrc = FALLBACK_IMAGE,
  alt,
  ...props
}: ImageProps & { fallbackSrc?: string }) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc)
  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt || "Image"}
      onError={() => {
        if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc)
      }}
    />
  )
}

/** Image inside a relative/overflow-hidden box with a gentle scale-in reveal. */
export function RevealImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
}: {
  src: string
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
}) {
  const preview = usePreview()
  if (preview) {
    return (
      <div className={`relative overflow-hidden ${className ?? ""}`}>
        <SafeImage src={src} alt={alt} fill sizes={sizes} className="object-cover" priority={priority} />
      </div>
    )
  }
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <motion.div
        initial={{ scale: 1.1 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-full relative"
      >
        <SafeImage src={src} alt={alt} fill sizes={sizes} className="object-cover" priority={priority} />
      </motion.div>
    </div>
  )
}

/** Scroll-reveal fade/translate wrapper (no-op in preview). */
export function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const preview = usePreview()
  if (preview) return <div className={className}>{children}</div>
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/** Tiny gold-on-brand eyebrow label. */
export function Eyebrow({
  children,
  light = false,
  className = "",
}: {
  children: React.ReactNode
  light?: boolean
  className?: string
}) {
  return (
    <p
      className={`text-[10px] uppercase tracking-[0.22em] sm:tracking-[0.45em] font-sans font-bold ${
        light ? "text-gold/80" : "text-gold"
      } ${className}`}
    >
      {children}
    </p>
  )
}

/** The single allowed ornament: a short gold hairline. */
export function GoldRule({ center = false, className = "" }: { center?: boolean; className?: string }) {
  return <div className={`w-12 h-px bg-gold ${center ? "mx-auto" : ""} ${className}`} />
}

/** Centered (or left) section heading: gold eyebrow + display title. */
export function SectionHeading({
  eyebrow,
  title,
  light = false,
  align = "center",
}: {
  eyebrow: string
  title: React.ReactNode
  light?: boolean
  align?: "center" | "left"
}) {
  return (
    <FadeUp className={`space-y-4 mb-12 ${align === "center" ? "text-center" : "text-left"}`}>
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <h2
        className={`font-display text-3xl sm:text-4xl md:text-5xl tracking-wide uppercase leading-tight ${
          light ? "text-white" : "text-charcoal"
        }`}
      >
        {title}
      </h2>
    </FadeUp>
  )
}

/**
 * Render admin-authored long text as real paragraphs. Splits on blank lines so
 * multi-paragraph stories don't collapse into one block; single newlines are
 * preserved within a paragraph. Optional drop-cap on the first paragraph.
 */
export function Prose({
  text,
  className = "",
  dropCap = false,
}: {
  text: string
  className?: string
  dropCap?: boolean
}) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
  if (paragraphs.length === 0) return null
  return (
    <div className={className}>
      {paragraphs.map((para, i) => (
        <p
          key={i}
          className={`whitespace-pre-line ${i > 0 ? "mt-5" : ""} ${
            dropCap && i === 0
              ? "first-letter:float-left first-letter:font-display first-letter:text-6xl first-letter:leading-[0.8] first-letter:pr-3 first-letter:pt-1 first-letter:text-charcoal"
              : ""
          }`}
        >
          {para}
        </p>
      ))}
    </div>
  )
}

/** Title-case legacy ALL-CAPS room class enums; pass free text through. */
export function formatClassType(classType: string) {
  if (classType && classType === classType.toUpperCase()) {
    return classType.charAt(0) + classType.slice(1).toLowerCase()
  }
  return classType
}
