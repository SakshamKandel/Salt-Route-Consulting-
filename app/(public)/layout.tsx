import { Nav } from "@/components/public/Nav"
import { Footer } from "@/components/public/Footer"
import { DeferredConcierge } from "@/components/public/DeferredConcierge"
import { SmoothScrollProvider } from "@/components/shared/SmoothScrollProvider"

// Nav uses useSession + usePathname, SmoothScrollProvider uses useLenis.
// These hooks are unavailable during static prerendering — force-dynamic
// prevents Next.js from attempting SSR static generation for this segment tree.
export const dynamic = "force-dynamic"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <div
        className="relative flex min-h-screen flex-col bg-background font-sans text-navy overflow-x-clip"
        style={{ ["--font-sans" as string]: "var(--font-niramit)" }}
      >
        <Nav />
        <main className="flex-1 pt-[72px]">{children}</main>
        <Footer />
        <DeferredConcierge />
      </div>
    </SmoothScrollProvider>
  )
}
