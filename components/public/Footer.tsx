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
    <footer className="bg-background text-charcoal pt-24 pb-12 border-t border-charcoal/5">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 text-center">

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
            className="inline-flex items-center px-9 py-4 text-sm uppercase tracking-[0.2em] font-sans font-medium border border-charcoal text-charcoal hover:bg-charcoal hover:text-white transition-colors duration-300"
          >
            For Owners
          </Link>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 max-w-4xl mx-auto mb-20">

          <div className="flex flex-col items-center gap-5">
            <h4 className="text-sm uppercase tracking-[0.3em] font-sans font-semibold text-charcoal/50 mb-2">Discover</h4>
            {guestLinks.map(l => (
              <Link key={l.href} href={l.href} className="text-base font-sans tracking-[0.12em] uppercase text-charcoal/70 hover:text-charcoal transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col items-center gap-5">
            <h4 className="text-sm uppercase tracking-[0.3em] font-sans font-semibold text-charcoal/50 mb-2">Contact</h4>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="text-base font-sans tracking-[0.12em] uppercase text-charcoal/70 hover:text-charcoal transition-colors"
            >
              {siteConfig.contact.email}
            </a>
            <a
              href={siteConfig.contact.phoneHref}
              className="text-base font-sans tracking-[0.12em] uppercase text-charcoal/70 hover:text-charcoal transition-colors"
            >
              {siteConfig.contact.phone}
            </a>
            <span className="text-base font-sans tracking-[0.12em] uppercase text-charcoal/70 text-center leading-relaxed">
              {siteConfig.contact.address}
            </span>
          </div>

          <div className="flex flex-col items-center gap-5">
            <h4 className="text-sm uppercase tracking-[0.3em] font-sans font-semibold text-charcoal/50 mb-2">Legal</h4>
            {legalLinks.map(l => (
              <Link key={l.href} href={l.href} className="text-base font-sans tracking-[0.12em] uppercase text-charcoal/70 hover:text-charcoal transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-charcoal/5 pt-8 flex flex-col items-center gap-4">
          <p className="font-sans text-sm uppercase tracking-[0.2em] text-charcoal/40">
            © {new Date().getFullYear()} {siteConfig.name}. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
