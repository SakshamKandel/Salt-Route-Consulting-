"use client"

import Image, { type StaticImageData } from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Reveal, ParallaxImage } from "./motion"

type MediaSource = string | StaticImageData

export function CompactContainer({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("editorial-container", className)}>
      {children}
    </div>
  )
}

export function CompactSection({
  children,
  className,
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <Reveal as="section" id={id} className={cn("editorial-section", className)}>
      <CompactContainer>{children}</CompactContainer>
    </Reveal>
  )
}

export function CompactHeading({
  eyebrow,
  title,
  copy,
  align = "left",
  className,
}: {
  eyebrow?: string
  title: string
  copy?: string
  align?: "left" | "center"
  className?: string
}) {
  return (
    <Reveal as="div">
      <header
        className={cn(
          "editorial-heading",
          align === "center" && "mx-auto text-center",
          className,
        )}
      >
        {eyebrow ? (
          <p className="mb-2 font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-navy/55">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-[clamp(2rem,3.4vw,3.25rem)] leading-[1.08] tracking-[-0.015em] text-navy">
          {title}
        </h2>
        {copy ? (
          <p className="mt-4 max-w-2xl font-sans text-base font-light leading-7 text-navy/72 sm:text-[17px]">
            {copy}
          </p>
        ) : null}
      </header>
    </Reveal>
  )
}

export function CompactButton({
  href,
  children,
  className,
  tone = "gold",
}: {
  href: string
  children: ReactNode
  className?: string
  tone?: "gold" | "navy" | "text"
}) {
  return (
    <Link
      href={href}
      className={cn(
        "editorial-link inline-flex min-h-11 items-center justify-center py-3 font-sans text-[10px] font-medium uppercase tracking-[0.14em] transition-colors duration-200",
        tone === "gold" && "text-navy hover:text-gold-dark",
        tone === "navy" && "text-navy hover:text-gold-dark",
        tone === "text" && "min-h-0 px-0 py-0 text-navy hover:text-gold-dark",
        className,
      )}
    >
      {children}
    </Link>
  )
}

export function CompactMediaCard({
  image,
  alt,
  title,
  copy,
  href,
  action = "Explore",
  imageClassName,
}: {
  image: MediaSource
  alt: string
  title: string
  copy: string
  href: string
  action?: string
  imageClassName?: string
}) {
  return (
    <article className="editorial-media-card flex h-full flex-col">
      <Link href={href} className="relative block aspect-[3/2] overflow-hidden bg-sand-dark">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className={cn("object-cover transition-transform duration-500 hover:scale-[1.02]", imageClassName)}
        />
      </Link>
      <div className="flex flex-1 flex-col pt-5">
        <h3 className="font-display text-2xl leading-tight text-navy">{title}</h3>
        <p className="mt-2 flex-1 font-sans text-[15px] font-light leading-6 text-navy/72">{copy}</p>
        <CompactButton href={href} className="mt-5 self-start">
          {action}
        </CompactButton>
      </div>
    </article>
  )
}

export function CompactImageText({
  image,
  alt,
  eyebrow,
  title,
  copy,
  href,
  action = "Explore",
  imageSide = "left",
  imageClassName,
  children,
}: {
  image: MediaSource
  alt: string
  eyebrow?: string
  title: string
  copy: string
  href?: string
  action?: string
  imageSide?: "left" | "right"
  imageClassName?: string
  children?: ReactNode
}) {
  return (
    <div className="editorial-image-text grid items-center gap-7 lg:grid-cols-12 lg:gap-10">
      {/* Image drifts against scroll for a whisper of parallax. */}
      <ParallaxImage
        className={cn(
          "aspect-[16/10] bg-sand-dark lg:col-span-7",
          imageSide === "right" && "lg:order-2",
        )}
        speed={0.08}
      >
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 58vw"
          className={cn("object-cover", imageClassName)}
        />
      </ParallaxImage>
      <Reveal
        as="div"
        className={cn("lg:col-span-5 lg:px-4", imageSide === "right" && "lg:order-1")}
      >
        {eyebrow ? (
          <p className="mb-2 font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-navy/55">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="max-w-xl font-display text-[clamp(2rem,3.2vw,3.15rem)] leading-[1.08] tracking-[-0.015em] text-navy">
          {title}
        </h2>
        <p className="mt-4 max-w-xl font-sans text-base font-light leading-7 text-navy/72 sm:text-[17px]">
          {copy}
        </p>
        {children}
        {href ? (
          <CompactButton href={href} className="mt-6">
            {action}
          </CompactButton>
        ) : null}
      </Reveal>
    </div>
  )
}
