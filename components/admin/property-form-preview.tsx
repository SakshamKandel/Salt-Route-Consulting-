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
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/70">
        <p className="text-xs font-semibold text-navy">Live Page Preview</p>
        <p className="text-[10px] text-slate-400">updates as you type</p>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={`p-1.5 rounded ${device === "desktop" ? "bg-navy text-white" : "text-slate-400 hover:bg-slate-200"}`}
            title="Desktop"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={`p-1.5 rounded ${device === "mobile" ? "bg-navy text-white" : "text-slate-400 hover:bg-slate-200"}`}
            title="Mobile"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        className="relative bg-slate-100 overflow-y-auto overflow-x-hidden"
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
