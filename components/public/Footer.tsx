import Image from "next/image"
import Link from "next/link"
import { siteConfig } from "@/lib/site.config"
import { CompactContainer } from "./Compact"

const links = [
  ["Properties", "/properties"],
  ["Experiences", "/services"],
  ["Our Story", "/about"],
  ["For Owners", "/for-owners"],
  ["Contact", "/contact"],
] as const

export function Footer() {
  return (
    <footer className="border-t border-cream/12 bg-navy text-cream">
      <CompactContainer>
        <div className="flex flex-col gap-9 py-11 md:flex-row md:items-center md:justify-between">
          <Link href="/" aria-label={`${siteConfig.brandName} home`} className="inline-block self-start md:self-auto">
            <Image
              src="/brand/logo-light.png"
              alt={siteConfig.brandName}
              width={960}
              height={399}
              className="h-10 sm:h-11 w-auto object-contain hover:opacity-90 transition-opacity"
            />
          </Link>
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-7 gap-y-3">
              {links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="font-sans text-[11px] uppercase tracking-[0.16em] text-cream/68 transition-colors hover:text-gold">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex flex-col gap-3 border-t border-cream/12 py-6 font-sans text-[11px] text-cream/46 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.brandName} · {siteConfig.contact.address}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-cream">{siteConfig.contact.email}</a>
            <a href={siteConfig.contact.phoneHref} className="hover:text-cream">{siteConfig.contact.phone}</a>
            <Link href="/privacy" className="hover:text-cream">Privacy</Link>
          </div>
        </div>
      </CompactContainer>
    </footer>
  )
}
