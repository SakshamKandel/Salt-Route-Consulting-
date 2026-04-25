import Image from "next/image"
import Link from "next/link"
import React from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-charcoal flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Light Lobby Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop"
          alt="Salt Route Grand Lobby"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/90" />
      </div>

      <div className="w-full max-w-[460px] relative z-10">
        <div className="flex flex-col items-center justify-center mb-12">
          <Link href="/" className="flex flex-col items-center group">
            <span className="font-display text-3xl tracking-[0.4em] uppercase leading-none text-charcoal group-hover:text-gold transition-colors duration-500">
              Salt Route
            </span>
            <div className="w-12 h-px bg-charcoal/20 mt-4 group-hover:bg-gold transition-colors" />
          </Link>
        </div>
        
        <div className="bg-white/80 backdrop-blur-2xl border border-charcoal/10 p-10 md:p-14 shadow-2xl">
          {children}
        </div>

        <div className="mt-12 text-center">
          <p className="text-[9px] uppercase tracking-[0.5em] text-charcoal/40 font-medium">Privileged Access Only</p>
        </div>
      </div>
    </div>
  )
}
