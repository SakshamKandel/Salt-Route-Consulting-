import { Nav } from "@/components/public/Nav"
import { Footer } from "@/components/public/Footer"
import { AiConcierge } from "@/components/public/AiConcierge"
import { PageTransition } from "@/components/public/PageTransition"
import { SiteLoader } from "@/components/public/SiteLoader"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Branded loading overlay on first paint; hidden entirely when JS is off. */}
      <noscript
        dangerouslySetInnerHTML={{ __html: "<style>.site-loader{display:none!important}</style>" }}
      />
      <SiteLoader />
      <Nav />
      <main className="flex-grow w-full overflow-x-hidden">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Footer />
      <AiConcierge />
    </div>
  )
}
