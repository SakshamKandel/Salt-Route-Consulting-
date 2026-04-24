"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Menu, X, Mountain } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "/properties", label: "Properties" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
]

export function Nav() {
  const { data: session } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const accountHref = session?.user
    ? session.user.role === "ADMIN"
      ? "/admin/dashboard"
      : session.user.role === "OWNER"
      ? "/owner/dashboard"
      : "/account"
    : "/login"

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled || open ? "bg-navy shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20">
        <Link href="/" className="font-display text-2xl text-cream tracking-widest uppercase">
          Salt<span className="text-gold"> Route</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-cream/80 hover:text-gold text-sm uppercase tracking-widest transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {session?.user ? (
            <>
              <Button asChild variant="ghost" className="text-cream hover:text-gold hover:bg-transparent">
                <Link href={accountHref}>My Account</Link>
              </Button>
              <Button asChild className="bg-gold hover:bg-gold-dark text-navy font-semibold">
                <Link href="/properties">Book Now</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="text-cream hover:text-gold hover:bg-transparent">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-gold hover:bg-gold-dark text-navy font-semibold">
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-cream p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-navy border-t border-white/10 px-4 pb-6 space-y-4">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block text-cream/80 hover:text-gold py-2 text-sm uppercase tracking-widest"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            {session?.user ? (
              <>
                <Button asChild variant="ghost" className="text-cream hover:text-gold justify-start">
                  <Link href={accountHref} onClick={() => setOpen(false)}>My Account</Link>
                </Button>
                <Button asChild className="bg-gold text-navy">
                  <Link href="/properties" onClick={() => setOpen(false)}>Book Now</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-cream hover:text-gold justify-start">
                  <Link href="/login" onClick={() => setOpen(false)}>Sign In</Link>
                </Button>
                <Button asChild className="bg-gold text-navy">
                  <Link href="/register" onClick={() => setOpen(false)}>Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
