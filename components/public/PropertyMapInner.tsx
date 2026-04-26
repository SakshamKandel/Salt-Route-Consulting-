"use client"

import { useEffect, useRef } from "react"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { formatNpr } from "@/lib/currency"

export type MapProperty = {
  id: string
  title: string
  slug: string
  location: string
  pricePerNight?: number
  latitude: number
  longitude: number
  imageUrl?: string
}

function buildMarkerHtml(index: number, highlighted: boolean) {
  const bg = highlighted ? "#C9A96E" : "#1B3A5C"
  const color = highlighted ? "#1B3A5C" : "#FAF8F4"
  const ring = highlighted ? "rgba(201,169,110,0.35)" : "rgba(27,58,92,0.18)"
  return `
    <div style="
      width:38px;height:38px;
      background:${bg};
      border-radius:50%;
      border:2px solid ${color === "#FAF8F4" ? "rgba(250,248,244,0.9)" : "rgba(27,58,92,0.5)"};
      box-shadow:0 2px 12px rgba(27,58,92,0.25),0 0 0 6px ${ring};
      display:flex;align-items:center;justify-content:center;
      font-family:system-ui,sans-serif;
      font-size:12px;font-weight:700;
      color:${color};
      cursor:pointer;
      transition:all 0.25s;
    ">${index + 1}</div>`
}

function buildPopupHtml(p: MapProperty) {
  const price = p.pricePerNight ? `${formatNpr(p.pricePerNight)} / night` : ""
  const img = p.imageUrl
    ? `<div style="height:128px;overflow:hidden;margin:-16px -20px 16px;border-bottom:1px solid rgba(201,169,110,0.2);">
         <img src="${p.imageUrl}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" />
       </div>`
    : ""
  return `
    <div style="min-width:220px;font-family:system-ui,sans-serif;background:#FFFDF8;">
      ${img}
      <div style="padding:${img ? "0" : "2px 0"} 0 4px;">
        <p style="font-size:8px;text-transform:uppercase;letter-spacing:0.3em;color:#C9A96E;margin:0 0 5px;font-weight:700;">${p.location}</p>
        <h3 style="font-size:14px;font-weight:600;color:#1B3A5C;margin:0 0 ${price ? "4px" : "14px"};line-height:1.35;">${p.title}</h3>
        ${price ? `<p style="font-size:11px;color:#1B3A5C;opacity:0.45;margin:0 0 14px;font-weight:500;">${price}</p>` : ""}
        <a href="/properties/${p.slug}"
           style="display:inline-flex;align-items:center;gap:6px;background:#1B3A5C;color:#FAF8F4;font-size:8px;text-transform:uppercase;letter-spacing:0.28em;padding:9px 18px;text-decoration:none;font-weight:700;"
        >View Estate <span style="color:#C9A96E;font-size:11px;">&rarr;</span></a>
      </div>
    </div>`
}

export default function PropertyMapInner({ properties }: { properties: MapProperty[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      zoomControl: false,
      scrollWheelZoom: true,
      dragging: true,
    })
    mapRef.current = map

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" style="color:#1B3A5C;opacity:0.6">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" style="color:#1B3A5C;opacity:0.6">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map)

    // Subtle enhancement instead of heavy sepia/brightness
    const tilePaneEl = map.getPane("tilePane")
    if (tilePaneEl instanceof HTMLElement) {
      tilePaneEl.style.filter = "saturate(1.1) contrast(1.05)"
    }

    L.control.zoom({ position: "bottomright" }).addTo(map)
    map.fitBounds([[26.347, 80.058], [30.447, 88.201]])

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current = []
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    if (properties.length === 0) return

    const newMarkers: L.Marker[] = []

    properties.forEach((p, i) => {
      const defaultIcon = L.divIcon({
        className: "",
        html: buildMarkerHtml(i, false),
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -24],
      })
      const hoverIcon = L.divIcon({
        className: "",
        html: buildMarkerHtml(i, true),
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -24],
      })

      const marker = L.marker([p.latitude, p.longitude], { icon: defaultIcon })
        .addTo(map)
        .bindPopup(buildPopupHtml(p), { maxWidth: 260, className: "src-popup" })

      marker.on("mouseover", () => marker.setIcon(hoverIcon))
      marker.on("mouseout",  () => marker.setIcon(defaultIcon))

      newMarkers.push(marker)
    })

    markersRef.current = newMarkers

    if (properties.length === 1) {
      map.setView([properties[0].latitude, properties[0].longitude], 14)
    } else {
      const group = L.featureGroup(newMarkers)
      map.fitBounds(group.getBounds().pad(0.4))
    }
  }, [properties])

  return <div ref={containerRef} className="w-full h-full" />
}
