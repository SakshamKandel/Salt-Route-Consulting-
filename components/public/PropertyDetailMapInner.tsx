"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { getNepalLocationCoordinates } from "@/lib/nepal-locations"

type Props = {
  location: string
  address?: string | null
  title: string
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function addLuxuryTiles(map: L.Map) {
  let fallbackLayer: L.TileLayer | null = null
  let usingFallback = false
  const primary = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      subdomains: "abc",
      maxZoom: 19,
      crossOrigin: true,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    },
  ).addTo(map)

  primary.once("tileerror", () => {
    if (usingFallback || !map.getContainer().isConnected) return
    usingFallback = true
    primary.remove()
    fallbackLayer = L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      subdomains: "abc",
      maxZoom: 19,
      crossOrigin: true,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>, Tiles style by <a href="https://www.hotosm.org/">HOT</a>',
    }).addTo(map)
  })

  return () => {
    primary.remove()
    fallbackLayer?.remove()
  }
}

export default function PropertyDetailMapInner({ location, address, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const [latitude, longitude] = getNepalLocationCoordinates(location, address)
    const fallback = latitude === 28.2 && longitude === 84
    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: fallback ? 7 : 12.5,
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: true,
      preferCanvas: true,
      attributionControl: true,
    })
    mapRef.current = map
    const removeTiles = addLuxuryTiles(map)
    const tilePane = map.getPane("tilePane")
    if (tilePane) tilePane.classList.add("src-luxury-map-tiles")
    L.control.zoom({ position: "bottomright" }).addTo(map)

    const marker = L.marker([latitude, longitude], {
      riseOnHover: true,
      icon: L.divIcon({
        className: "src-map-marker-shell",
        html: `<button type="button" class="src-map-pin src-map-pin--property" aria-label="${escapeHtml(title)}">
          <span aria-hidden="true"></span><small>${escapeHtml(location)}</small>
        </button>`,
        iconSize: [50, 50],
        iconAnchor: [25, 25],
        popupAnchor: [0, -30],
      }),
    })
      .addTo(map)
      .bindPopup(
        `<article class="src-map-card src-map-card--detail"><div><small>Salt Route stay</small><strong>${escapeHtml(title)}</strong>${address ? `<span>${escapeHtml(address)}</span>` : ""}</div></article>`,
        { className: "src-popup", maxWidth: 280 },
      )

    const resize = () => map.invalidateSize({ animate: false })
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(containerRef.current)
    const resizeTimer = window.setTimeout(resize, 100)

    return () => {
      window.clearTimeout(resizeTimer)
      resizeObserver.disconnect()
      marker.remove()
      removeTiles()
      map.remove()
      mapRef.current = null
    }
  }, [address, location, title])

  return (
    <div className="relative h-full min-h-[380px] w-full bg-[#EEE8DC]">
      <div ref={containerRef} className="h-full min-h-[380px] w-full" aria-label={`Map showing ${title} in ${location}`} />
      <div className="pointer-events-none absolute left-5 top-5 z-[500] bg-navy/94 px-5 py-4 text-cream shadow-xl backdrop-blur-sm">
        <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-gold">In Nepal</p>
        <p className="mt-1 font-display text-lg">{location}</p>
      </div>
    </div>
  )
}
