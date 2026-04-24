import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center text-center px-4">
      <p className="font-display text-[8rem] leading-none text-navy/10 font-bold select-none">404</p>
      <h1 className="font-display text-3xl md:text-4xl text-navy mt-4 mb-3">Page Not Found</h1>
      <p className="text-navy/60 max-w-md mb-8">
        The page you&apos;re looking for has been removed, renamed, or never existed. Let&apos;s get you back on the right trail.
      </p>
      <div className="flex gap-4">
        <Button asChild className="bg-navy text-cream hover:bg-navy/90">
          <Link href="/">Back to Home</Link>
        </Button>
        <Button asChild variant="outline" className="border-navy/20 text-navy">
          <Link href="/properties">Browse Properties</Link>
        </Button>
      </div>
    </div>
  )
}
