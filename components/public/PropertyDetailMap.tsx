"use client"

import dynamic from "next/dynamic"

const Inner = dynamic(() => import("./PropertyDetailMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[380px] w-full items-center justify-center gap-3 bg-[#EEE8DC]">
      <div className="h-px w-8 overflow-hidden bg-navy/10"><span className="block h-full w-1/2 animate-pulse bg-gold" /></div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-navy/35">
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
