"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

const guestLinks = [
  { href: "/properties", label: "Stays" },
  { href: "/about", label: "Philosophy" },
  { href: "/services", label: "Experiences" },
  { href: "/for-owners", label: "For Owners" },
  { href: "/contact", label: "Contact" },
]

const ownerLinks = [
  { href: "/", label: "Guest View" },
  { href: "/for-owners#portfolio", label: "Portfolio" },
  { href: "/for-owners#services", label: "Services" },
  { href: "/for-owners#why-us", label: "Why Us" },
  { href: "/contact", label: "Enquire" },
]

export function Nav() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isOwnerSection = pathname?.startsWith("/for-owners")
  const isAuthenticated = status === "authenticated" && !!session?.user

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "unset"
    return () => {
      document.body.style.overflow = "unset"
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

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[70] transition-all duration-700 border-b ${scrolled ? 'bg-white/80 backdrop-blur-xl border-charcoal/5 h-20' : 'bg-transparent border-transparent h-28'}`}>
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 h-full flex items-center justify-between relative">
          
          {/* Left Actions (Mobile Toggle & Language) */}
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={toggleMobile}
              className="flex flex-col justify-center items-center w-8 h-8 z-[80]"
            >
              <span className={`block w-6 h-[1px] transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[1px] bg-charcoal' : (scrolled ? 'bg-charcoal' : 'bg-charcoal md:bg-white')} -translate-y-1`} />
              <span className={`block w-6 h-[1px] transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[0px] bg-charcoal' : (scrolled ? 'bg-charcoal' : 'bg-charcoal md:bg-white')} translate-y-1`} />
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            <p className={`text-[10px] uppercase tracking-[0.2em] font-sans font-medium transition-colors duration-300 ${scrolled ? 'text-charcoal/40' : 'text-charcoal/60 md:text-white/60'}`}>EN</p>
            {navLinks.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[10px] uppercase tracking-[0.2em] font-sans transition-colors duration-300 ${scrolled ? 'text-charcoal/70 hover:text-charcoal' : 'text-charcoal/90 md:text-white/80 hover:text-charcoal md:hover:text-white'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Logo - Centered */}
          <Link href={isOwnerSection ? "/for-owners" : "/"} className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center z-[80]">
            <Image 
              src="/logo.png" 
              alt="SRG Logo" 
              width={80} 
              height={38} 
              priority
              className="object-contain transition-all duration-300"
            />
            <span className={`text-[7px] tracking-[0.4em] uppercase font-sans font-medium mt-2 transition-colors duration-300 ${mobileOpen || scrolled ? 'text-charcoal/50' : 'text-charcoal/70 md:text-white/70'}`}>
              {isOwnerSection ? "Partner Portal" : "Consulting"}
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden lg:flex items-center gap-10 mr-4">
              {navLinks.slice(3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[10px] uppercase tracking-[0.2em] font-sans transition-colors duration-300 ${scrolled ? 'text-charcoal/70 hover:text-charcoal' : 'text-charcoal/90 md:text-white/80 hover:text-charcoal md:hover:text-white'}`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={isAuthenticated ? accountHref : "/login"}
                className={`text-[10px] uppercase tracking-[0.2em] font-sans transition-colors duration-300 ${scrolled ? 'text-charcoal/70 hover:text-charcoal' : 'text-charcoal/90 md:text-white/80 hover:text-charcoal md:hover:text-white'}`}
              >
                {isAuthenticated ? "Account" : "Sign In"}
              </Link>
            </div>
            
            <Link
              href={isOwnerSection ? "/contact" : "/properties"}
              className={`px-8 py-3.5 text-[9px] uppercase tracking-[0.2em] font-sans font-medium transition-all duration-500 border ${scrolled ? 'bg-charcoal text-white border-charcoal hover:bg-charcoal/90' : 'bg-transparent text-charcoal md:text-white border-charcoal md:border-white/30 hover:bg-white/10 md:hover:border-white/60'}`}
            >
              {isOwnerSection ? "Partner With Us" : "Reserve Stays"}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: "0%" }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] bg-background flex flex-col justify-center items-center"
          >
            <div className="flex flex-col items-center gap-8 w-full px-6">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
                >
                  <Link
                    href={link.href}
                    onClick={closeMobile}
                    className="font-display text-4xl uppercase tracking-[0.1em] text-charcoal hover:text-charcoal/70 transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="w-16 h-[1px] bg-charcoal/10 my-6"
              />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col items-center gap-6"
              >
                <Link
                  href={isAuthenticated ? accountHref : "/login"}
                  onClick={closeMobile}
                  className="text-[11px] uppercase tracking-[0.2em] font-sans text-charcoal/60 hover:text-charcoal transition-colors"
                >
                  {isAuthenticated ? "Your Account" : "Sign In"}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
