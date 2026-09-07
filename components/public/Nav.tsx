"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useLenis } from "lenis/react"
import { Menu, X } from "lucide-react"
import { LanguageSwitcher } from "./LanguageSwitcher"
import styles from "./site-chrome.module.css"

const columns = [
  [["Our Story", "/about"], ["For Owners", "/for-owners"], ["Journal", "/journal"], ["Visual Journey", "/visual-journey"]],
  [["Destinations", "/properties"], ["Experiences", "/services"], ["FAQs", "/faq"], ["Contact", "/contact"]],
]

export function Nav({ contact }: { contact: { email: string; phone: string; phoneHref: string; address: string } }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const lenis = useLenis()
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const plain = /^(\/privacy|\/terms|\/refund-policy|\/booking-request)/.test(pathname)
  const account = session?.user?.role === "ADMIN" ? "/admin/dashboard" : session?.user?.role === "OWNER" ? "/owner/dashboard" : "/account"

  useEffect(() => {
    const marker = document.getElementById("header-boundary")
    if (!marker) return
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting))
    observer.observe(marker)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    lenis?.stop()
    return () => { document.body.style.overflow = previous; lenis?.start() }
  }, [open, lenis])

  function finishClose() {
    dialog.current?.close()
    setOpen(false)
    setClosing(false)
    trigger.current?.focus()
  }
  function close() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) finishClose()
    else setClosing(true)
  }
  function show() { setClosing(false); dialog.current?.showModal(); setOpen(true) }

  return <>
    <header className={`${styles.header} ${scrolled || plain ? styles.headerSolid : ""}`}>
      <div className={styles.headerInner}>
        <button ref={trigger} type="button" className={styles.menuTrigger} onClick={show} aria-label="Open navigation menu" aria-expanded={open} aria-controls="site-menu"><Menu strokeWidth={1} size={28} /><span>Menu</span></button>
        <Link href="/" className={styles.logoLink} aria-label="Salt Route home"><Image src="/brand/logo.png" alt="Salt Route" width={960} height={399} priority /></Link>
        <Link href="/contact" className={styles.enquire}>Enquire now</Link>
      </div>
    </header>
    <dialog ref={dialog} id="site-menu" className={`${styles.menu} ${closing ? styles.menuClosing : ""}`} aria-label="Main navigation" onCancel={(event) => { event.preventDefault(); close() }} onClose={() => setOpen(false)} onAnimationEnd={(event) => { if (closing && event.target === event.currentTarget) finishClose() }} data-lenis-prevent>
      <div className={styles.menuTop}>
        <button type="button" onClick={close} className={styles.close} aria-label="Close navigation menu" autoFocus><X size={27} strokeWidth={1} /></button>
        <Link href="/" onClick={close} className={styles.logoLink} aria-label="Salt Route home"><Image src="/brand/logo.png" alt="Salt Route" width={960} height={399} /></Link>
      </div>
      <div className={styles.menuContent}>
        <nav className={styles.menuLinks} aria-label="Main navigation">
          {columns.map((column, i) => <div key={i}>{column.map(([label, href]) => <Link key={href} href={href} onClick={close} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}</div>)}
        </nav>
        <div className={styles.menuContact}>
          <p className={styles.label}>Contact us</p><address>{contact.address}</address><a href={`mailto:${contact.email}`}>{contact.email}</a>
          <p className={styles.label}>Call for reservations</p><a href={contact.phoneHref}>{contact.phone}</a>
          <div className={styles.menuAccount}><Link href={session ? account : "/login"} onClick={close}>{session ? "My account" : "Guest sign in"}</Link><LanguageSwitcher transparent /></div>
        </div>
      </div>
      <p className={styles.menuLegal}>© {new Date().getFullYear()} Salt Route Group · A personal connection to Nepal.</p>
    </dialog>
  </>
}
