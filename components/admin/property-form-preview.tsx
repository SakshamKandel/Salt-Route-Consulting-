"use client"

// Live, as-you-type preview of the REAL public property page.
// Desktop: CSS-scale to fit the narrow admin panel (media queries already work
// because the browser viewport is wide).
// Mobile: rendered inside an iframe so media queries see a 414 px viewport.

import { useLayoutEffect, useRef, useState } from "react"
import PropertyDetailClient, { type PropertyDetail } from "@/components/public/PropertyDetailClient"
import { PreviewIframe } from "./preview-iframe"
import { Monitor, Smartphone } from "lucide-react"

const PANEL_W = 372

export function PropertyFormPreview({ property }: { property: PropertyDetail }) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop")
  const innerRef = useRef<HTMLDivElement>(null)
  const [innerHeight, setInnerHeight] = useState(1600)

  const contentW = device === "desktop" ? 1280 : 414
  const scale = PANEL_W / contentW

  useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setInnerHeight(el.offsetHeight))
    ro.observe(el)
    setInnerHeight(el.offsetHeight)
    return () => ro.disconnect()
  }, [device, property])

  const preview = <PropertyDetailClient property={property} wishlistItem={false} previewMode />

  return (
    <div className="rounded-2xl border border-[#1B3A5C]/8 bg-[#FFFAF3] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1B3A5C]/8 bg-[#FBF9F4]">
        <p className="text-[10px] font-medium text-[#1B3A5C]/50 uppercase tracking-[0.2em]">Live Page Preview</p>
        <p className="text-[10px] text-[#1B3A5C]/30">updates as you type</p>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={`p-1.5 rounded-md transition-colors ${device === "desktop" ? "bg-[#1B3A5C] text-[#FFFAF3]" : "text-[#1B3A5C]/35 hover:bg-[#1B3A5C]/8"}`}
            title="Desktop"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={`p-1.5 rounded-md transition-colors ${device === "mobile" ? "bg-[#1B3A5C] text-[#FFFAF3]" : "text-[#1B3A5C]/35 hover:bg-[#1B3A5C]/8"}`}
            title="Mobile"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        className="relative bg-[#1B3A5C]/5 overflow-y-auto overflow-x-hidden"
        style={{ height: "calc(100vh - 170px)", minHeight: 460 }}
      >
        {device === "desktop" ? (
          /* ── Desktop: scale to fit the 372 px panel ── */
          <div style={{ width: PANEL_W, height: Math.max(innerHeight * scale, 1) }} className="relative mx-auto">
            <div
              ref={innerRef}
              className="absolute top-0 left-0 origin-top-left"
              style={{ width: contentW, transform: `scale(${scale})`, pointerEvents: "none" }}
            >
              {preview}
            </div>
          </div>
        ) : (
          /* ── Mobile: iframe so media queries see a 414 px viewport ── */
          <div className="flex justify-center h-full">
            <div style={{ width: contentW }}>
              <PreviewIframe className="w-full h-full">
                {preview}
              </PreviewIframe>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
