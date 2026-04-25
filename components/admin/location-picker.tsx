"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ExternalLink, MapPin } from "lucide-react"

type LocationPickerProps = {
  knownLocations: string[]
  location: string
  latitude: number | null
  longitude: number | null
  onLocationChange: (value: string) => void
  onLatLngChange: (lat: number | null, lng: number | null) => void
}

// Pulls (lat, lng) out of a Google Maps URL.
// Supports: ?q=lat,lng / @lat,lng,zoom / !3dlat!4dlng / lat,lng pasted directly.
export function parseLatLng(input: string): { lat: number; lng: number } | null {
  if (!input) return null
  const trimmed = input.trim()

  const patterns: RegExp[] = [
    /[?&]q=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
    /[?&]ll=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
    /^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/,
  ]

  for (const re of patterns) {
    const match = trimmed.match(re)
    if (match) {
      const lat = Number(match[1])
      const lng = Number(match[2])
      if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        return { lat, lng }
      }
    }
  }
  return null
}

export function LocationPicker({
  knownLocations,
  location,
  latitude,
  longitude,
  onLocationChange,
  onLatLngChange,
}: LocationPickerProps) {
  const [pasteValue, setPasteValue] = useState("")
  const [pasteError, setPasteError] = useState<string | null>(null)

  const datalistId = "known-property-locations"

  const hasCoords = latitude !== null && longitude !== null
  const mapSearchUrl = location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
    : `https://www.google.com/maps`
  const embedUrl = hasCoords
    ? `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`
    : null

  function handleApplyPaste() {
    const parsed = parseLatLng(pasteValue)
    if (!parsed) {
      setPasteError("Could not read coordinates from that link. Paste a Google Maps URL or `lat,lng`.")
      return
    }
    setPasteError(null)
    onLatLngChange(parsed.lat, parsed.lng)
    setPasteValue("")
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 space-y-5">
      <div className="flex items-start gap-3">
        <MapPin className="h-5 w-5 text-slate-500 mt-0.5 shrink-0" />
        <div>
          <h3 className="font-semibold text-navy">Location & Map</h3>
          <p className="text-sm text-slate-500">
            Pick from existing listing locations, then drop a Google Maps pin to set the exact spot.
          </p>
        </div>
      </div>

      {/* Location with datalist of existing values */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">City / General Location</label>
        <Input
          list={datalistId}
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder={knownLocations[0] ?? "e.g. Pokhara, Nepal"}
        />
        <datalist id={datalistId}>
          {knownLocations.map((loc) => (
            <option key={loc} value={loc} />
          ))}
        </datalist>
        {knownLocations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-xs text-slate-500 mr-1">Existing locations:</span>
            {knownLocations.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => onLocationChange(loc)}
                className={
                  "text-xs px-2 py-0.5 rounded-full border transition-colors " +
                  (loc === location
                    ? "bg-navy text-cream border-navy"
                    : "bg-white text-slate-600 border-slate-200 hover:border-navy")
                }
              >
                {loc}
              </button>
            ))}
          </div>
        )}

      </div>

      {/* Lat / Lng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Latitude</label>
          <Input
            type="number"
            step="any"
            value={latitude ?? ""}
            onChange={(e) => {
              const raw = e.target.value
              if (raw === "") {
                onLatLngChange(null, longitude)
                return
              }
              const v = Number(raw)
              onLatLngChange(Number.isFinite(v) ? v : null, longitude)
            }}
            placeholder="27.7172"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Longitude</label>
          <Input
            type="number"
            step="any"
            value={longitude ?? ""}
            onChange={(e) => {
              const raw = e.target.value
              if (raw === "") {
                onLatLngChange(latitude, null)
                return
              }
              const v = Number(raw)
              onLatLngChange(latitude, Number.isFinite(v) ? v : null)
            }}
            placeholder="85.3240"
          />
        </div>
      </div>

      {/* Paste a Google Maps URL */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Paste a Google Maps link or <code>lat,lng</code>
        </label>
        <div className="flex gap-2">
          <Input
            value={pasteValue}
            onChange={(e) => {
              setPasteValue(e.target.value)
              if (pasteError) setPasteError(null)
            }}
            placeholder="https://www.google.com/maps/place/.../@27.7172,85.3240,15z"
          />
          <Button type="button" variant="outline" onClick={handleApplyPaste}>
            Apply
          </Button>
        </div>
        <div className="flex items-center justify-between text-xs">
          <a
            href={mapSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-navy hover:underline"
          >
            Open Google Maps <ExternalLink className="h-3 w-3" />
          </a>
          {pasteError && <span className="text-red-600">{pasteError}</span>}
        </div>
      </div>

      {/* Map preview */}
      {embedUrl ? (
        <div className="rounded-lg overflow-hidden border border-slate-200 bg-white">
          <iframe
            title="Map preview"
            src={embedUrl}
            className="w-full h-64"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          Set a latitude and longitude to preview the map.
        </div>
      )}
    </div>
  )
}
