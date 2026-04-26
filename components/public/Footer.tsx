"use client"

import Link from "next/link"
import Image from "next/image"

const guestLinks = [
  { href: "/properties", label: "Properties" },
  { href: "/about", label: "Our Story" },
  { href: "/services", label: "Experiences" },
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
        <div className="mb-16">
          <Link href="/" className="inline-flex flex-col items-center">
            <Image 
              src="/logo.png" 
              alt="SRG Logo" 
              width={140} 
              height={65} 
              className="object-contain mb-3" 
            />
            <span className="text-[9px] tracking-[0.4em] text-charcoal/40 uppercase font-sans font-medium">
              Consulting
            </span>
          </Link>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 max-w-4xl mx-auto mb-20">
          
          <div className="flex flex-col items-center gap-4">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-sans font-semibold text-charcoal/40 mb-2">Discover</h4>
            {guestLinks.map(l => (
              <Link key={l.href} href={l.href} className="text-[11px] font-sans tracking-[0.15em] uppercase text-charcoal/60 hover:text-charcoal transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col items-center gap-4">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-sans font-semibold text-charcoal/40 mb-2">Contact</h4>
            <a href="mailto:info@saltroutegroup.com" className="text-[11px] font-sans tracking-[0.15em] uppercase text-charcoal/60 hover:text-charcoal transition-colors">
              info@saltroutegroup.com
            </a>
            <a href="tel:+97701XXXXXXX" className="text-[11px] font-sans tracking-[0.15em] uppercase text-charcoal/60 hover:text-charcoal transition-colors">
              +977 01 XXXXXXX
            </a>
            <span className="text-[11px] font-sans tracking-[0.15em] uppercase text-charcoal/60 text-center leading-relaxed">
              Jhamsikhel, Lalitpur<br />Nepal
            </span>
          </div>

          <div className="flex flex-col items-center gap-4">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-sans font-semibold text-charcoal/40 mb-2">Legal</h4>
            {legalLinks.map(l => (
              <Link key={l.href} href={l.href} className="text-[11px] font-sans tracking-[0.15em] uppercase text-charcoal/60 hover:text-charcoal transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-charcoal/5 pt-8 flex flex-col items-center gap-4">
          <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-charcoal/30">
            © {new Date().getFullYear()} Salt Route Consulting. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
