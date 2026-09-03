"use client"

import { useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { formatNpr } from "@/lib/currency"
import { getNepalLocationCoordinates } from "@/lib/nepal-locations"

export type MapProperty = {
  id: string
  title: string
  slug: string
  location: string
  pricePerNight?: number
  hidePrice?: boolean
  latitude?: number
  longitude?: number
  imageUrl?: string
}

type PositionedProperty = MapProperty & { latitude: number; longitude: number }

const NEPAL_BOUNDS: [[number, number], [number, number]] = [
  [26.4, 80],
  [30.45, 88.2],
]

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function markerHtml(index: number, location: string) {
  return `<button type="button" class="src-map-pin" aria-label="View ${escapeHtml(location)}">
    <span>${String(index + 1).padStart(2, "0")}</span>
    <small>${escapeHtml(location)}</small>
  </button>`
}

function previewHtml(property: PositionedProperty) {
  const image = property.imageUrl ? `<img src="${escapeHtml(property.imageUrl)}" alt="" />` : ""
  const price = property.hidePrice
    ? "Tailored quote"
    : property.pricePerNight
      ? `From ${formatNpr(property.pricePerNight)} / night`
      : "Discover the stay"

  return `<article class="src-map-card">
    ${image}
    <div>
      <small>${escapeHtml(property.location)}</small>
      <strong>${escapeHtml(property.title)}</strong>
      <span>${escapeHtml(price)}</span>
    </div>
  </article>`
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

export default function PropertyMapInner({ properties }: { properties: MapProperty[] }) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const positioned = useMemo<PositionedProperty[]>(
    () =>
      properties.map((property) => {
        const fallback = getNepalLocationCoordinates(property.location)
        return {
          ...property,
          latitude: property.latitude ?? fallback[0],
          longitude: property.longitude ?? fallback[1],
        }
      }),
    [properties],
  )

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, {
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

    const markers = positioned.map((property, index) => {
      const icon = L.divIcon({
        className: "src-map-marker-shell",
        html: markerHtml(index, property.location),
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        tooltipAnchor: [0, -24],
      })
      const marker = L.marker([property.latitude, property.longitude], { icon, riseOnHover: true })
        .addTo(map)
        .bindTooltip(previewHtml(property), {
          direction: "top",
          className: "src-map-preview",
          opacity: 1,
          offset: [0, -12],
        })
      marker.on("click", () => router.push(`/properties/${property.slug}`))
      return marker
    })

    if (markers.length === 1) {
      map.setView([positioned[0].latitude, positioned[0].longitude], 11.5)
    } else if (markers.length > 1) {
      map.fitBounds(L.featureGroup(markers).getBounds().pad(0.2), { padding: [64, 64], maxZoom: 10 })
    } else {
      map.fitBounds(NEPAL_BOUNDS, { padding: [28, 28] })
    }

    const resize = () => map.invalidateSize({ animate: false })
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(containerRef.current)
    const resizeTimer = window.setTimeout(resize, 100)

    return () => {
      window.clearTimeout(resizeTimer)
      resizeObserver.disconnect()
      removeTiles()
      map.remove()
      mapRef.current = null
    }
  }, [positioned, router])

  return (
    <div className="relative h-full min-h-[420px] w-full bg-[#EEE8DC]">
      <div ref={containerRef} className="h-full min-h-[420px] w-full" aria-label="Map of Salt Route properties across Nepal" />
      <div className="pointer-events-none absolute left-5 top-5 z-[500] max-w-[240px] bg-navy/94 px-5 py-4 text-cream shadow-xl backdrop-blur-sm">
        <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-gold">Salt Route collection</p>
        <p className="mt-1 font-display text-lg">{positioned.length} places across Nepal</p>
      </div>
      <p className="pointer-events-none absolute bottom-5 left-5 z-[500] bg-cream/90 px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.18em] text-navy/60 backdrop-blur-sm">
        Drag to explore · click a marker to view
      </p>
    </div>
  )
}
