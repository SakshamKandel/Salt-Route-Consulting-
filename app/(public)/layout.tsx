import { Nav } from "@/components/public/Nav"
import { Footer } from "@/components/public/Footer"
import { DeferredConcierge } from "@/components/public/DeferredConcierge"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex min-h-screen flex-col bg-background font-sans text-navy"
      style={{ ["--font-sans" as string]: "var(--font-niramit)" }}
    >
      <Nav />
      <main className="flex-1 pt-[72px]">{children}</main>
      <Footer />
      <DeferredConcierge />
    </div>
  )
}
