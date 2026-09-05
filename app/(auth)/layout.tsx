import Image from "next/image"
import Link from "next/link"
import React from "react"
import imgInterior from "@/public/images/marketing/nepalese-interior-details.png"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-charcoal flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Light Lobby Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imgInterior}
          alt="Traditional Nepali interior details"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/90" />
      </div>

      <div className="w-full max-w-[460px] relative z-10">
        <div className="flex flex-col items-center justify-center mb-10">
          <Link href="/" className="flex flex-col items-center group gap-3.5">
            <Image
              src="/brand/Logo.png"
              alt="Salt Route"
              width={960}
              height={399}
              priority
              className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-display text-sm tracking-[0.35em] uppercase leading-none text-charcoal/80 group-hover:text-gold transition-colors duration-300">
              Salt Route
            </span>
          </Link>
        </div>
        
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 p-10 md:p-14">
          {children}
        </div>

        <div className="mt-12 text-center">
          <p className="text-[9px] uppercase tracking-[0.5em] text-charcoal/40 font-medium">Privileged Access Only</p>
        </div>
      </div>
    </div>
  )
}
