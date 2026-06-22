import Link from "next/link"
import Image from "next/image"
import { siteConfig } from "@/lib/site.config"

const guestLinks = [
  { href: "/properties", label: "Properties" },
  { href: "/about", label: "Our Story" },
  { href: "/services", label: "Experiences" },
  { href: "/contact", label: "Contact Us" },
]

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/refund-policy", label: "Refund Policy" },
]

export function Footer() {
  return (
    <footer className="bg-background text-charcoal pt-16 pb-10 border-t border-charcoal/5 md:pt-24 md:pb-12">
      <div className="max-w-screen-2xl mx-auto px-5 sm:px-6 md:px-12 text-center">

        {/* Brand */}
        <div className="mb-12">
          <Link href="/" className="inline-flex flex-col items-center">
            <Image
              src="/logo.png"
              alt={`${siteConfig.brandName} Logo`}
              width={160}
              height={75}
              className="object-contain"
            />
          </Link>
        </div>

        {/* Owner CTA */}
        <div className="mb-20 flex flex-col items-center gap-4">
          <p className="text-base font-sans text-charcoal/60 max-w-md leading-relaxed">
            Own a property in Nepal? Partner with us.
          </p>
          <Link
            href="/for-owners"
            className="inline-flex w-full max-w-xs items-center justify-center px-7 py-4 text-sm uppercase tracking-[0.16em] font-sans font-medium border border-charcoal text-charcoal hover:bg-charcoal hover:text-white transition-colors duration-300 sm:w-auto sm:tracking-[0.2em]"
          >
            For Owners
          </Link>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 max-w-4xl mx-auto mb-20">

          <div className="flex flex-col items-center gap-5">
            <h4 className="text-sm uppercase tracking-[0.22em] sm:tracking-[0.3em] font-sans font-semibold text-charcoal/50 mb-2">Discover</h4>
            {guestLinks.map(l => (
              <Link key={l.href} href={l.href} className="text-base font-sans tracking-[0.08em] uppercase text-charcoal/70 hover:text-charcoal transition-colors sm:tracking-[0.12em]">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col items-center gap-5">
            <h4 className="text-sm uppercase tracking-[0.22em] sm:tracking-[0.3em] font-sans font-semibold text-charcoal/50 mb-2">Contact</h4>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="max-w-full text-base font-sans tracking-[0.04em] uppercase text-charcoal/70 hover:text-charcoal transition-colors sm:tracking-[0.12em]"
            >
              {siteConfig.contact.email}
            </a>
            <a
              href={siteConfig.contact.phoneHref}
              className="max-w-full text-base font-sans tracking-[0.08em] uppercase text-charcoal/70 hover:text-charcoal transition-colors sm:tracking-[0.12em]"
            >
              {siteConfig.contact.phone}
            </a>
            <span className="max-w-xs text-base font-sans tracking-[0.08em] uppercase text-charcoal/70 text-center leading-relaxed sm:tracking-[0.12em]">
              {siteConfig.contact.address}
            </span>
          </div>

          <div className="flex flex-col items-center gap-5">
            <h4 className="text-sm uppercase tracking-[0.22em] sm:tracking-[0.3em] font-sans font-semibold text-charcoal/50 mb-2">Legal</h4>
            {legalLinks.map(l => (
              <Link key={l.href} href={l.href} className="text-base font-sans tracking-[0.08em] uppercase text-charcoal/70 hover:text-charcoal transition-colors sm:tracking-[0.12em]">
                {l.label}
              </Link>
            ))}
          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-charcoal/5 pt-8 flex flex-col items-center gap-4">
          <p className="font-sans text-xs uppercase tracking-[0.12em] text-charcoal/40 sm:text-sm sm:tracking-[0.2em]">
            © {new Date().getFullYear()} {siteConfig.name}. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
