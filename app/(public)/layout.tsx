import { Nav } from "@/components/public/Nav"
import { Footer } from "@/components/public/Footer"
import { WhatsAppFloat } from "@/components/public/WhatsAppFloat"
import { PageTransition } from "@/components/public/PageTransition"
import { LoadingScreen } from "@/components/public/LoadingScreen"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col min-h-screen">
      <LoadingScreen />
      <Nav />
      <main className="flex-grow w-full overflow-x-hidden">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  )
}
