"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { EASE } from "./motion"

const guestLinks = [
  { href: "/properties", label: "Stays" },
  { href: "/about", label: "Our Story" },
  { href: "/services", label: "Experiences" },
  { href: "/journal", label: "Journal" },
]

const ownerLinks = [
  { href: "/", label: "Guest View" },
  { href: "#portfolio", label: "Portfolio" },
  { href: "#owner-marketing", label: "Marketing" },
  { href: "#owner-enquiry", label: "Enquire" },
]

/* Tracked-uppercase nav link + shared 1px left-grow underline (§5.3). */
const navLinkBase =
  "relative font-sans text-[11px] font-medium uppercase tracking-[0.24em] transition-colors duration-300 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-400 after:ease-out-quart hover:after:scale-x-100"

export function Nav() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const reduceMotion = useReducedMotion()

  const isOwnerSection = pathname?.startsWith("/for-owners")
  const isBookingPage = pathname?.startsWith("/booking-request")
  const isAuthenticated = status === "authenticated" && !!session?.user

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      // rAF batching: coalesce multiple scroll events into one state update per frame.
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20)
        ticking = false
      })
    }
    // passive: true → the browser can scroll without waiting for our handler,
    // eliminating scroll jank on mobile.
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Body scroll lock while the menu is open — restore whatever overflow value
  // was there before (never force "unset", other overlays may own a lock).
  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileOpen])

  const closeMobile = () => {
    setMobileOpen(false)
  }

  const toggleMobile = () => {
    setMobileOpen((open) => !open)
  }

  const role = session?.user.role
  const accountHref =
    role === "ADMIN" ? "/admin/dashboard" :
    role === "OWNER" ? "/owner/dashboard" :
    "/account"
  const navLinks = isOwnerSection ? ownerLinks : guestLinks

  // Light-topped editorial routes (no dark hero): a transparent nav would be
  // cream-on-cream illegible, so force the solid state, like booking.
  const isLightPage = ["/faq", "/privacy", "/terms", "/refund-policy", "/journal"].some(
    (route) => pathname?.startsWith(route)
  )

  const solid = scrolled || isBookingPage || isLightPage
  const linkTone = solid
    ? "text-navy/70 hover:text-navy"
    : "text-cream/90 hover:text-cream"

  return (
    <>
      {/* Bar: transparent over the hero → solid cream + hairline on scroll.
          On <md the bar always carries a faint cream scrim so the navy toggle
          and logo stay legible over photography. */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[10000] border-b transition-[background-color,border-color,height] duration-700 ease-out-luxe ${
          solid
            ? "h-20 bg-cream/85 backdrop-blur-md border-navy/10"
            : "h-20 md:h-28 bg-cream/85 backdrop-blur-md border-navy/10 md:bg-transparent md:backdrop-blur-none md:border-transparent"
        }`}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-12 h-full flex items-center justify-between relative">

          {/* Left Actions (Mobile Toggle) */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleMobile}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="z-[10001] flex h-8 w-8 flex-col items-center justify-center gap-[7px]"
            >
              <span
                className={`block h-px w-6 bg-navy transition-transform duration-300 ease-out-luxe ${
                  mobileOpen ? "translate-y-1 rotate-45" : ""
                }`}
              />
              <span
                className={`block h-px w-6 bg-navy transition-transform duration-300 ease-out-luxe ${
                  mobileOpen ? "-translate-y-1 -rotate-45" : ""
                }`}
              />
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            <LanguageSwitcher transparent={!solid} />
            {navLinks.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${navLinkBase} ${linkTone}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Logo - Centered (intrinsic 768x319, sized via width + h-auto) */}
          <Link
            href={isOwnerSection ? "/for-owners" : "/"}
            onClick={(e) => {
              if (isOwnerSection && pathname === "/for-owners") {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: "smooth" })
              } else if (!isOwnerSection && pathname === "/") {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
            }}
            className="absolute left-1/2 -translate-x-1/2 z-[80] flex items-center"
          >
            <Image
              src="/logo.png"
              alt="Salt Route Group"
              width={768}
              height={319}
              priority
              className="h-auto w-20 md:w-24"
            />
          </Link>

          {/* Right Actions */}
          <div className="flex min-w-0 items-center gap-2 md:gap-8">
            <div className="hidden lg:flex items-center gap-10 mr-4">
              {navLinks.slice(3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${navLinkBase} ${linkTone}`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={isAuthenticated ? accountHref : "/login"}
                className={`${navLinkBase} ${linkTone}`}
              >
                {isAuthenticated ? "Account" : "Sign In"}
              </Link>
            </div>

            {/* The one high-weight nav CTA — navy fill, fill-wipe hover (§5.3). */}
            <Link
              href={isOwnerSection ? "#owner-enquiry" : "/properties"}
              className="group relative hidden overflow-hidden bg-navy px-7 py-3.5 sm:inline-flex md:px-9"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-navy-dark transition-transform duration-350 ease-in-out group-hover:scale-x-100"
              />
              <span className="relative z-10 font-sans text-[11px] font-medium uppercase tracking-[0.24em] text-cream">
                {isOwnerSection ? "Partner With Us" : "Reserve"}
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu — full-screen cream, editorial serif list. Sits below the
          nav bar (z-[9999] < z-[10000]) so the toggle stays interactive. */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={reduceMotion ? false : { y: "-100%" }}
            animate={{ y: 0 }}
            exit={
              reduceMotion
                ? { y: "-100%", transition: { duration: 0 } }
                : { y: "-100%" }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.8, ease: EASE.inOutLuxe }
            }
            className="fixed inset-0 z-[9999] overflow-y-auto bg-cream"
          >
            <div className="flex min-h-full w-full flex-col justify-between px-6 pt-28 pb-10 sm:px-10">
              <nav className="flex w-full max-w-md flex-col">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { delay: 0.25 + i * 0.08, duration: 0.7, ease: EASE.outLuxe }
                    }
                  >
                    <Link
                      href={link.href}
                      onClick={closeMobile}
                      className="group flex items-baseline gap-5 border-b border-navy/10 py-5"
                    >
                      <span className="font-sans text-[10px] tracking-[0.2em] text-gold">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-3xl leading-[1.1] tracking-[-0.01em] text-navy transition-colors duration-300 group-hover:text-navy/70 min-[360px]:text-4xl">
                        {link.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { delay: 0.55, duration: 0.6, ease: EASE.outLuxe }
                }
                className="mt-12 flex flex-col items-start gap-6"
              >
                <Link
                  href={isAuthenticated ? accountHref : "/login"}
                  onClick={closeMobile}
                  className={`${navLinkBase} text-navy/60 hover:text-navy`}
                >
                  {isAuthenticated ? "Your Account" : "Sign In"}
                </Link>

                <div className="h-px w-16 bg-navy/10" />
                <LanguageSwitcher variant="mobile" onSelect={closeMobile} />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
