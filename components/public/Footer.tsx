import Image from "next/image"
import Link from "next/link"
import { siteConfig } from "@/lib/site.config"
import { CompactContainer } from "./Compact"

const groups = [
  {
    title: "Discover",
    links: [
      ["Destinations", "/properties"],
      ["Experiences", "/services"],
      ["Journal", "/journal"],
      ["Our Story", "/about"],
    ],
  },
  {
    title: "Plan",
    links: [
      ["Reserve", "/properties"],
      ["Contact", "/contact"],
      ["FAQs", "/faq"],
      ["For Owners", "/for-owners"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
      ["Refund Policy", "/refund-policy"],
    ],
  },
] as const

export function Footer() {
  return (
    <footer className="bg-navy py-10 text-cream sm:py-12">
      <CompactContainer>
        <div className="grid gap-9 md:grid-cols-[1.35fr_2fr] md:gap-14">
          <div>
            <Link href="/" className="inline-block">
              <Image
                src="/brand/logo-light.png"
                alt={siteConfig.brandName}
                width={768}
                height={319}
                className="h-auto w-24 object-contain"
              />
            </Link>
            <p className="mt-4 max-w-sm font-sans text-sm font-light leading-6 text-cream/72">
              Private stays and considered journeys across Nepal, shaped around place, people, and time.
            </p>
            <div className="mt-5 space-y-1 font-sans text-sm text-cream/80">
              <a href={`mailto:${siteConfig.contact.email}`} className="block hover:text-white">
                {siteConfig.contact.email}
              </a>
              <a href={siteConfig.contact.phoneHref} className="block hover:text-white">
                {siteConfig.contact.phone}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {groups.map((group) => (
              <div key={group.title}>
                <h2 className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-cream/55">
                  {group.title}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} className="font-sans text-sm font-light text-cream/82 hover:text-white">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-2 font-sans text-[11px] text-cream/48 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {siteConfig.brandName}. All rights reserved.</p>
          <p>Bespoke Himalayan hospitality.</p>
        </div>
      </CompactContainer>
    </footer>
  )
}
