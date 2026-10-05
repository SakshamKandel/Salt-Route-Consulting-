"use client"

import dynamic from "next/dynamic"
import type { MapProperty } from "./PropertyMapInner"

export type { MapProperty }

const Inner = dynamic(() => import("./PropertyMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[420px] w-full flex-col items-center justify-center gap-4 bg-[#102943]">
      <div className="h-px w-12 overflow-hidden bg-cream/20"><span className="block h-full w-1/2 animate-pulse bg-gold" /></div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-cream/55">
        Preparing the route
      </p>
    </div>
  ),
})

export function PropertyMap({ properties }: { properties: MapProperty[] }) {
  return <Inner properties={properties} />
}
