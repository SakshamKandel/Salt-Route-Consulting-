import Link from "next/link"
import Image from "next/image"
import { siteConfig } from "@/lib/site.config"

const guestLinks = [
  { href: "/properties", label: "Properties" },
  { href: "/about", label: "Our Story" },
  { href: "/services", label: "Experiences" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact Us" },
]

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/refund-policy", label: "Refund Policy" },
]

/* Shared 1px left-grow underline hover (§5.3). */
const underline =
  "relative after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-400 after:ease-out-quart hover:after:scale-x-100"

const columnLink = `font-sans text-[11px] uppercase tracking-[0.2em] text-navy/60 transition-colors duration-300 hover:text-navy ${underline}`

export function Footer() {
  return (
    <footer className="border-t border-navy/10 bg-bone text-navy">
      <div className="mx-auto max-w-[90rem] px-6 sm:px-8 md:px-12 lg:px-16">

        {/* Main band — asymmetric: brand block left, link columns right */}
        <div className="grid grid-cols-1 gap-14 pt-20 pb-16 sm:grid-cols-2 md:grid-cols-12 md:gap-8 md:pt-28 md:pb-24">

          {/* Brand */}
          <div className="flex flex-col items-start sm:col-span-2 md:col-span-5">
            <Link href="/" className="inline-flex">
              <Image
                src="/logo.png"
                alt={`${siteConfig.brandName} Logo`}
                width={768}
                height={319}
                className="h-auto w-32 md:w-36"
              />
            </Link>
            <p className="mt-8 max-w-sm font-display text-2xl font-normal leading-[1.35] tracking-[-0.01em] text-navy/90 md:text-[1.75rem]">
              {siteConfig.tagline}
            </p>
            <p className="mt-10 font-sans text-sm font-light leading-relaxed text-navy/60">
              Own a property in Nepal? Partner with us.
            </p>
            <Link
              href="/for-owners"
              className={`mt-4 font-sans text-[11px] font-medium uppercase tracking-[0.24em] text-navy/70 transition-colors duration-300 hover:text-navy ${underline}`}
            >
              For Owners
            </Link>
          </div>

          {/* Discover */}
          <div className="flex flex-col md:col-span-3 md:col-start-7">
            <h4 className="type-eyebrow mb-6">Discover</h4>
            <ul className="flex flex-col items-start gap-4">
              {guestLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={columnLink}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact — hairline-divided definition list, normal case */}
          <div className="flex flex-col md:col-span-3">
            <h4 className="type-eyebrow mb-6">Contact</h4>
            <div className="flex w-full flex-col divide-y divide-navy/10">
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="pb-3 font-sans text-sm font-light text-navy/70 transition-colors duration-300 hover:text-navy"
              >
                {siteConfig.contact.email}
              </a>
              <a
                href={siteConfig.contact.phoneHref}
                className="py-3 font-sans text-sm font-light text-navy/70 transition-colors duration-300 hover:text-navy"
              >
                {siteConfig.contact.phone}
              </a>
              <span className="pt-3 font-sans text-sm font-light leading-relaxed text-navy/60">
                {siteConfig.contact.address}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar — copyright left, legal right */}
        <div className="flex flex-col items-start gap-5 border-t border-navy/10 py-8 md:flex-row md:items-center md:justify-between">
          <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-navy/45">
            © {new Date().getFullYear()} {siteConfig.name}. All Rights Reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`font-sans text-[10px] uppercase tracking-[0.15em] text-navy/45 transition-colors duration-300 hover:text-navy ${underline}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
