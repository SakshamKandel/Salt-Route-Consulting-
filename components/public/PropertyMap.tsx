"use client"

import dynamic from "next/dynamic"
import type { MapProperty } from "./PropertyMapInner"

export type { MapProperty }

const Inner = dynamic(() => import("./PropertyMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0C1F33] flex flex-col items-center justify-center gap-4">
      <div className="w-1 h-1 rounded-full bg-gold animate-ping" />
      <p className="text-[9px] uppercase tracking-[0.35em] text-white/20 font-bold">
        Locating properties
      </p>
    </div>
  ),
})

export function PropertyMap({ properties }: { properties: MapProperty[] }) {
  return <Inner properties={properties} />
}

