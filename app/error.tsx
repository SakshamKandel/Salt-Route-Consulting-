"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center text-center px-4">
      <p className="font-display text-[8rem] leading-none text-navy/10 font-bold select-none">500</p>
      <h1 className="font-display text-3xl md:text-4xl text-navy mt-4 mb-3">Something Went Wrong</h1>
      <p className="text-navy/60 max-w-md mb-8">
        An unexpected error occurred. Our team has been notified. Please try again or return to the homepage.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset} className="bg-navy text-cream hover:bg-navy/90">
          Try Again
        </Button>
        <Button asChild variant="outline" className="border-navy/20 text-navy">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  )
}
