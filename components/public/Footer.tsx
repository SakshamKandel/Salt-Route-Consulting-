import Image from "next/image"
import Link from "next/link"
import { siteConfig } from "@/lib/site.config"
import styles from "./site-chrome.module.css"

const links = [["Properties", "/properties"], ["Experiences", "/services"], ["Our story", "/about"], ["Journal", "/journal"], ["For owners", "/for-owners"], ["Contact", "/contact"]] as const

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerMain}>
          <div className={styles.footerBrand}>
            <Link href="/" aria-label={`${siteConfig.brandName} home`}>
              <Image src="/brand/Logo.png" alt={siteConfig.brandName} width={960} height={399} className={styles.footerLogo} />
            </Link>
            <p>Distinctive stays.<br />A personal connection to Nepal.</p>
          </div>
          <nav aria-label="Footer navigation" className={styles.footerNav}>
            {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
          </nav>
          <div className={styles.footerContact}>
            <p>Speak with Salt Route</p>
            <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>
            <a href={siteConfig.contact.phoneHref}>{siteConfig.contact.phone}</a>
            <address>{siteConfig.contact.address}</address>
          </div>
        </div>
        <div className={styles.legal}>
          <p>© {new Date().getFullYear()} {siteConfig.brandName}</p>
          <nav aria-label="Legal"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/refund-policy">Refund policy</Link></nav>
        </div>
      </div>
    </footer>
  )
}
