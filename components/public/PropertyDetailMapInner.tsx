"use client"

import { useEffect, useRef } from "react"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

type Props = {
  location: string
  address?: string | null
  title: string
}

const NEPAL_BOUNDS: [[number, number], [number, number]] = [[26.347, 80.058], [30.447, 88.201]]

async function geocodeQuery(query: string): Promise<[number, number] | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
    const res = await fetch(url, {
      headers: { "User-Agent": "SaltRouteConsulting/1.0 (contact@saltroutegroup.com)" },
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) return null
    return [Number(data[0].lat), Number(data[0].lon)]
  } catch {
    return null
  }
}

const MARKER_HTML = `
  <div style="
    width:46px;height:46px;
    background:#1B3A5C;
    border-radius:50%;
    border:3px solid #C9A96E;
    box-shadow:0 4px 20px rgba(27,58,92,0.35),0 0 0 8px rgba(201,169,110,0.14);
    display:flex;align-items:center;justify-content:center;
  ">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#C9A96E">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  </div>`

export default function PropertyDetailMapInner({ location, address, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
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

    // Enhanced contrast and saturation for clarity
    const tilePaneEl = map.getPane("tilePane")
    if (tilePaneEl instanceof HTMLElement) {
      tilePaneEl.style.filter = "saturate(1.1) contrast(1.05)"
    }

    L.control.zoom({ position: "bottomright" }).addTo(map)
    map.fitBounds(NEPAL_BOUNDS)

    const icon = L.divIcon({
      className: "",
      html: MARKER_HTML,
      iconSize: [46, 46],
      iconAnchor: [23, 23],
    })

    let marker: L.Marker | null = null

    const query = address ? `${address}, ${location}, Nepal` : `${location}, Nepal`
    geocodeQuery(query).then((coords) => {
      if (!coords || !mapRef.current) return
      marker = L.marker(coords, { icon })
        .addTo(mapRef.current)
        .bindPopup(
          `<div style="font-family:system-ui,sans-serif;min-width:170px;background:#FFFDF8;">
            <p style="font-size:8px;text-transform:uppercase;letter-spacing:0.3em;color:#C9A96E;margin:0 0 5px;font-weight:700;">${location}</p>
            <p style="font-size:13px;font-weight:600;color:#1B3A5C;margin:0;line-height:1.4;">${title}</p>
          </div>`,
          { maxWidth: 230, className: "src-popup" }
        )
      mapRef.current.flyTo(coords, 15, { animate: true, duration: 1.6 })
    })

    return () => {
      marker?.remove()
      map.remove()
      mapRef.current = null
    }
  }, [location, address, title])

  return <div ref={containerRef} className="w-full h-full" />
}
