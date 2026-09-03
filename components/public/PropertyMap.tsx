"use client"

import dynamic from "next/dynamic"
import type { MapProperty } from "./PropertyMapInner"

export type { MapProperty }

const Inner = dynamic(() => import("./PropertyMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[420px] w-full flex-col items-center justify-center gap-4 bg-[#EEE8DC]">
      <div className="h-px w-10 overflow-hidden bg-navy/10"><span className="block h-full w-1/2 animate-pulse bg-gold" /></div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-navy/35">
        Locating properties
      </p>
    </div>
  ),
})

export function PropertyMap({ properties }: { properties: MapProperty[] }) {
  return <Inner properties={properties} />
}
