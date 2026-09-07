import Image, { type StaticImageData } from "next/image"
import type { ReactNode } from "react"

export function EditorialHero({ image, title, eyebrow, children, home = false }: { image: string | StaticImageData; title: string; eyebrow?: string; children?: ReactNode; home?: boolean }) {
  return <section className={`editorial-hero ${home ? "editorial-hero-home" : ""}`}>
    <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" />
    <div className="editorial-hero-shade" />
    <div className="editorial-hero-content">{eyebrow && <p className="editorial-eyebrow">{eyebrow}</p>}<h1>{title}</h1>{children}</div>
  </section>
}

