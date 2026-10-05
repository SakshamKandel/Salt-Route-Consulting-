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
  address?: string | null
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
  const layers = [
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      subdomains: "abc",
      maxZoom: 19,
      crossOrigin: true,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    }),
    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      subdomains: "abc",
      maxZoom: 19,
      crossOrigin: true,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>, Tiles style by <a href="https://www.hotosm.org/">HOT</a>',
    }),
    L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      subdomains: "abc",
      maxZoom: 17,
      crossOrigin: true,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>, map style by <a href="https://opentopomap.org/">OpenTopoMap</a>',
    }),
  ]

  let activeIndex = -1
  let activeLayer: L.TileLayer | null = null
  let fallbackTimer: number | undefined
  const scheduleFallback = () => {
    window.clearTimeout(fallbackTimer)
    fallbackTimer = window.setTimeout(tryNextLayer, 5500)
  }
  const tryNextLayer = () => {
    if (activeIndex >= layers.length - 1 || !map.getContainer().isConnected) return
    if (activeLayer) activeLayer.remove()
    activeIndex += 1
    activeLayer = layers[activeIndex]
    activeLayer.once("tileload", () => window.clearTimeout(fallbackTimer))
    activeLayer.once("tileerror", tryNextLayer)
    activeLayer.addTo(map)
    scheduleFallback()
  }
  tryNextLayer()

  return () => {
    window.clearTimeout(fallbackTimer)
    layers.forEach((layer) => layer.remove())
  }
}

export default function PropertyMapInner({ properties }: { properties: MapProperty[] }) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const positioned = useMemo<PositionedProperty[]>(
    () =>
      properties.map((property) => {
        const fallback = getNepalLocationCoordinates(property.location, property.address)
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

    const seenCoordinates = new Map<string, number>()
    const markers = positioned.map((property, index) => {
      const coordinateKey = `${property.latitude.toFixed(4)}:${property.longitude.toFixed(4)}`
      const duplicateIndex = seenCoordinates.get(coordinateKey) ?? 0
      seenCoordinates.set(coordinateKey, duplicateIndex + 1)
      const spread = duplicateIndex === 0 ? 0 : 0.0065
      const angle = duplicateIndex * (Math.PI / 2)
      const markerLatitude = property.latitude + Math.sin(angle) * spread
      const markerLongitude = property.longitude + Math.cos(angle) * spread
      const icon = L.divIcon({
        className: "src-map-marker-shell",
        html: markerHtml(index, property.location),
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        tooltipAnchor: [0, -24],
      })
      const marker = L.marker([markerLatitude, markerLongitude], { icon, riseOnHover: true })
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
    markersRef.current = markers

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
      markersRef.current = []
    }
  }, [positioned, router])

  return (
    <div className="src-map-frame relative h-full min-h-[420px] w-full bg-[#102943]">
      <div ref={containerRef} className="h-full min-h-[420px] w-full" aria-label="Map of Salt Route properties across Nepal" />
      <div className="src-map-intro pointer-events-none absolute left-5 top-5 z-[500] max-w-[250px] text-cream">
        <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-gold">Salt Route collection</p>
        <p className="mt-2 font-display text-[clamp(1.25rem,2.5vw,1.7rem)] leading-tight">{positioned.length} stays, one route through Nepal.</p>
        <p className="mt-2 max-w-[220px] text-[10px] leading-5 text-cream/65">A location-led view of the places that shape our collection.</p>
      </div>
      <div className="src-map-legend absolute bottom-5 left-5 z-[500] w-[min(290px,calc(100%-2.5rem))] overflow-hidden">
        <div className="flex items-center justify-between border-b border-cream/12 px-4 py-3">
          <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-cream/50">Destinations</span>
          <span className="text-[9px] font-medium tabular-nums text-gold">{String(positioned.length).padStart(2, "0")}</span>
        </div>
        <div className="grid max-h-[156px] grid-cols-1 overflow-y-auto">
          {positioned.map((property, index) => (
            <button
              key={property.id}
              type="button"
              className="src-map-legend-item group flex items-center gap-3 border-b border-cream/10 px-4 py-2.5 text-left last:border-b-0"
              onClick={() => {
                const marker = markersRef.current[index]
                const map = mapRef.current
                if (!marker || !map) return
                map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 8), { duration: 0.8 })
                marker.openTooltip()
              }}
            >
              <span className="text-[9px] font-semibold tabular-nums text-gold/80">{String(index + 1).padStart(2, "0")}</span>
              <span className="min-w-0">
                <span className="block truncate text-[11px] font-medium text-cream/90 transition-colors group-hover:text-gold">{property.title}</span>
                <span className="mt-0.5 block truncate text-[9px] uppercase tracking-[0.12em] text-cream/42">{property.location}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <p className="pointer-events-none absolute bottom-5 right-5 z-[500] hidden bg-cream/90 px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.18em] text-navy/60 backdrop-blur-sm sm:block">
        Drag to explore · select a stay
      </p>
    </div>
  )
}
