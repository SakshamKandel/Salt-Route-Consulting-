"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { LanguageSwitcher } from "./LanguageSwitcher"

const guestLinks = [
  { href: "/properties", label: "Destinations" },
  { href: "/services", label: "Experiences" },
  { href: "/about", label: "Our Story" },
  { href: "/journal", label: "Journal" },
  { href: "/for-owners", label: "For Owners" },
]

const ownerLinks = [
  { href: "/", label: "Guest View" },
  { href: "/for-owners#portfolio", label: "Portfolio" },
  { href: "/for-owners#owner-marketing", label: "Marketing" },
  { href: "/for-owners#owner-enquiry", label: "Enquire" },
]

export function Nav() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)

  const ownerSection = pathname?.startsWith("/for-owners")
  const links = ownerSection ? ownerLinks : guestLinks
  const authenticated = status === "authenticated" && Boolean(session?.user)
  const accountHref =
    session?.user?.role === "ADMIN"
      ? "/admin/dashboard"
      : session?.user?.role === "OWNER"
        ? "/owner/dashboard"
        : "/account"

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[10000] h-[72px] bg-cream/95 backdrop-blur-sm">
        <div className="mx-auto flex h-full max-w-[92rem] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-11 w-11 items-center justify-start lg:hidden"
          >
            <span className="font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-navy">
              {open ? "Close" : "Menu"}
            </span>
          </button>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
            {links.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-navy/72 hover:text-navy"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href={ownerSection ? "/for-owners" : "/"}
            className="absolute left-1/2 -translate-x-1/2"
          >
            <Image
              src="/brand/logo.png"
              alt="Salt Route Group"
              width={768}
              height={319}
              priority
              className="h-auto w-[82px]"
            />
          </Link>

          <div className="flex items-center gap-5">
            <nav className="hidden items-center gap-6 lg:flex" aria-label="Secondary navigation">
              {links.slice(3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-navy/72 hover:text-navy"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={authenticated ? accountHref : "/login"}
                className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-navy/72 hover:text-navy"
              >
                {authenticated ? "Account" : "Sign In"}
              </Link>
              <LanguageSwitcher />
            </nav>

            <Link
              href={ownerSection ? "/for-owners#owner-enquiry" : "/properties"}
              className="inline-flex min-h-10 items-center bg-navy px-4 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-cream hover:bg-navy-dark sm:px-5"
            >
              {ownerSection ? "Enquire" : "Reserve"}
            </Link>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-cream px-5 pb-10 pt-24 lg:hidden">
          <nav className="mx-auto flex max-w-xl flex-col gap-1" aria-label="Mobile navigation">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-3 font-display text-3xl leading-tight text-navy"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={authenticated ? accountHref : "/login"}
              className="py-3 font-display text-3xl leading-tight text-navy"
            >
              {authenticated ? "Your Account" : "Sign In"}
            </Link>
            <div className="mt-5">
              <LanguageSwitcher variant="mobile" onSelect={() => setOpen(false)} />
            </div>
          </nav>
        </div>
      ) : null}
    </>
  )
}
