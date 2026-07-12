import { Nav } from "@/components/public/Nav"
import { Footer } from "@/components/public/Footer"
import { DeferredConcierge } from "@/components/public/DeferredConcierge"
import { PageTransition } from "@/components/public/PageTransition"
import { SiteLoader } from "@/components/public/SiteLoader"
import { NavProgress } from "@/components/public/NavProgress"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    // Native scrolling by owner's request — no smooth-scroll wrapper.
    // Fast, responsive, zero scroll-hijacking.
    <>
      {/* Scope the public body font to Niramit without touching the global
          --font-sans (which the admin/owner/guest portals keep on Inter). */}
      <div
        className="relative flex flex-col min-h-screen font-sans"
        style={{ ["--font-sans" as string]: "var(--font-niramit)" }}
      >
        {/* Loader chrome (SiteLoader overlay) is hidden entirely when JS is
            off via the shared .site-loader kill-switch. */}
        <noscript
          dangerouslySetInnerHTML={{ __html: "<style>.site-loader{display:none!important}</style>" }}
        />
        <SiteLoader />
        <NavProgress />
        <Nav />
        {/* PageTransition renders the flex-grow <main> itself (motion.main). */}
        <PageTransition>{children}</PageTransition>
        <Footer />
        {/* Concierge loads ssr:false and mounts after idle (§6.5). */}
        <DeferredConcierge />
      </div>
    </>
  )
}
