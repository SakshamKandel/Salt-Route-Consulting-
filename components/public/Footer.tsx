import Image from "next/image"
import Link from "next/link"
import { siteConfig } from "@/lib/site.config"
import styles from "./site-chrome.module.css"

export function Footer() {
  return <footer className={styles.footer}>
    <div className={styles.footerInner}>
      <div className={styles.footerMain}>
        <div className={styles.footerBrand}><Link href="/" aria-label="Salt Route home"><Image src="/brand/logo.png" alt={siteConfig.brandName} width={960} height={399} /></Link><p>Distinctive stays.<br />A personal connection to Nepal.</p></div>
        <nav className={styles.footerNav} aria-label="Explore"><Link href="/properties">Destinations</Link><Link href="/services">Experiences</Link><Link href="/visual-journey">Visual Journey</Link><Link href="/faq">FAQs</Link></nav>
        <nav className={styles.footerNav} aria-label="Salt Route"><Link href="/about">Our Story</Link><Link href="/for-owners">For Owners</Link><Link href="/journal">Journal</Link><Link href="/contact">Contact</Link></nav>
        <div className={styles.footerContact}><h3>Contact us</h3><address>{siteConfig.contact.address}</address><a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a><h3>Call for reservations</h3><a href={siteConfig.contact.phoneHref}>{siteConfig.contact.phone}</a></div>
      </div>
      <div className={styles.legal}><p>© {new Date().getFullYear()} {siteConfig.brandName}</p><nav aria-label="Legal"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/refund-policy">Refund policy</Link></nav></div>
    </div>
  </footer>
}
