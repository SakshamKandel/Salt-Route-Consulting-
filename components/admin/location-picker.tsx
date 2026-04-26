"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, ExternalLink, Loader2, MapPin, X } from "lucide-react"

type LocationPickerProps = {
  knownLocations: string[]
  location: string
  onLocationChange: (value: string) => void
}

async function geocodeLocation(query: string): Promise<[number, number] | null> {
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

export function LocationPicker({
  knownLocations,
  location,
  onLocationChange,
}: LocationPickerProps) {
  const [coords, setCoords] = useState<[number, number] | null>(null)
  const [geocoding, setGeocoding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location || "Nepal")}`

  const embedUrl = coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coords[1] - 0.006},${coords[0] - 0.006},${coords[1] + 0.006},${coords[0] + 0.006}&layer=mapnik&marker=${coords[0]},${coords[1]}`
    : null

  async function handlePreview() {
    if (!location.trim()) return
    setGeocoding(true)
    setError(null)
    const result = await geocodeLocation(`${location}, Nepal`)
    setGeocoding(false)
    if (result) {
      setCoords(result)
    } else {
      setError("Location not found. Try a more specific name.")
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 space-y-5">
      <div className="flex items-start gap-3">
        <MapPin className="h-5 w-5 text-slate-500 mt-0.5 shrink-0" />
        <div>
          <h3 className="font-semibold text-navy">Location</h3>
          <p className="text-sm text-slate-500">
            Enter the city or area where the property is located.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">City / Area</label>
        <div className="flex gap-2">
          <Input
            list="lp-known-locations"
            value={location}
            onChange={(e) => {
              onLocationChange(e.target.value)
              setCoords(null)
              setError(null)
            }}
            placeholder={knownLocations[0] ?? "e.g. Lalitpur, Nepal"}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handlePreview}
            disabled={geocoding || !location.trim()}
            className="shrink-0"
          >
            {geocoding ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Checking…</>
            ) : (
              "Preview Map"
            )}
          </Button>
        </div>
        <datalist id="lp-known-locations">
          {knownLocations.map((loc) => (
            <option key={loc} value={loc} />
          ))}
        </datalist>
        {knownLocations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-xs text-slate-400 mr-1">Existing:</span>
            {knownLocations.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => { onLocationChange(loc); setCoords(null) }}
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
        {error && <p className="text-xs text-red-600">{error}</p>}
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
      </div>

      {embedUrl ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <CheckCircle className="h-3.5 w-3.5" /> Location found
            </span>
            <button
              type="button"
              onClick={() => setCoords(null)}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Close
            </button>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <iframe
              title="Map preview"
              src={embedUrl}
              className="w-full h-52 border-0"
              loading="lazy"
            />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-center">
          <p className="text-sm text-slate-400">
            Click &ldquo;Preview Map&rdquo; to verify this location on a map.
          </p>
        </div>
      )}
    </div>
  )
}
