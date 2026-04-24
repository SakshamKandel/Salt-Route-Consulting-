import Link from "next/link"
import { Mountain, Mail, Phone, MapPin } from "lucide-react"

const propertyLinks = [
  { href: "/properties?location=Nagarkot", label: "Nagarkot Villas" },
  { href: "/properties?location=Pokhara", label: "Pokhara Retreats" },
  { href: "/properties?location=Chitwan", label: "Chitwan Lodges" },
]

const companyLinks = [
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
]

const legalLinks = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refund-policy", label: "Refund Policy" },
]

export function Footer() {
  return (
    <footer className="bg-navy text-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="font-display text-2xl text-cream tracking-widest uppercase">
              Salt<span className="text-gold"> Route</span>
            </Link>
            <p className="text-cream/60 text-sm leading-relaxed">
              Bespoke luxury stays in Nepal&apos;s most captivating destinations. Every property is handpicked for authenticity, comfort, and connection to place.
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href="https://wa.me/9779800000000"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/60 hover:text-gold transition-colors text-sm"
              >
                WhatsApp
              </a>
              <span className="text-cream/20">·</span>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/60 hover:text-gold transition-colors text-sm"
              >
                Instagram
              </a>
            </div>
          </div>

          {/* Properties */}
          <div>
            <h4 className="font-display text-gold text-sm uppercase tracking-widest mb-4">Properties</h4>
            <ul className="space-y-2">
              {propertyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-cream/60 hover:text-gold text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/properties" className="text-cream/60 hover:text-gold text-sm transition-colors">
                  All Properties
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display text-gold text-sm uppercase tracking-widest mb-4">Company</h4>
            <ul className="space-y-2">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-cream/60 hover:text-gold text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-gold text-sm uppercase tracking-widest mb-4">Get in Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-cream/60 text-sm">
                <Mail size={15} className="mt-0.5 shrink-0 text-gold" />
                <a href="mailto:info@saltroutegroup.com" className="hover:text-gold transition-colors">
                  info@saltroutegroup.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-cream/60 text-sm">
                <Phone size={15} className="mt-0.5 shrink-0 text-gold" />
                <a href="tel:+9779800000000" className="hover:text-gold transition-colors">
                  +977 98-0000-0000
                </a>
              </li>
              <li className="flex items-start gap-2 text-cream/60 text-sm">
                <MapPin size={15} className="mt-0.5 shrink-0 text-gold" />
                <span>Kathmandu, Nepal</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-cream/40 text-xs">
            &copy; {new Date().getFullYear()} Salt Route Consulting. All rights reserved.
          </p>
          <div className="flex gap-4">
            {legalLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-cream/40 hover:text-gold text-xs transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
