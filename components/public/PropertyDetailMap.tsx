"use client"

import dynamic from "next/dynamic"

const Inner = dynamic(() => import("./PropertyDetailMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-charcoal/5 flex items-center justify-center gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-gold/40 animate-ping" />
      <p className="text-[9px] uppercase tracking-[0.35em] text-charcoal/30 font-bold">
        Locating
      </p>
    </div>
  ),
})

export function PropertyDetailMap({
  location,
  address,
  title,
}: {
  location: string
  address?: string | null
  title: string
}) {
  return <Inner location={location} address={address} title={title} />
}
