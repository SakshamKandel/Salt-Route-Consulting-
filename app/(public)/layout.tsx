import { Nav } from "@/components/public/Nav"
import { Footer } from "@/components/public/Footer"
import { DeferredConcierge } from "@/components/public/DeferredConcierge"
import { SmoothScrollProvider } from "@/components/shared/SmoothScrollProvider"
import { siteConfig } from "@/lib/site.config"
import "./editorial.css"

// Nav uses useSession + usePathname, SmoothScrollProvider uses useLenis.
// These hooks are unavailable during static prerendering — force-dynamic
// prevents Next.js from attempting SSR static generation for this segment tree.
export const dynamic = "force-dynamic"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <div
        className="editorial-site relative flex min-h-screen flex-col bg-background font-sans text-navy overflow-x-clip"
        style={{ ["--font-sans" as string]: "var(--font-niramit)" }}
      >
        <span id="header-boundary" className="absolute top-12 h-px w-px" aria-hidden="true" />
        <a className="editorial-skip" href="#main-content">Skip to content</a>
        <Nav contact={siteConfig.contact} />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
        <DeferredConcierge />
      </div>
    </SmoothScrollProvider>
  )
}
