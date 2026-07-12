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
      headers: { "User-Agent": "SaltRouteConsulting/1.0 (connect@saltroutecorp.com)" },
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
    <div className="rounded-2xl border border-[#1B3A5C]/8 bg-[#FFFAF3] p-5 space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#1B3A5C]/5 flex items-center justify-center shrink-0">
          <MapPin className="h-4 w-4 text-[#C9A96E]" />
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-[#1B3A5C]">Location</h3>
          <p className="text-[12px] text-[#1B3A5C]/45">
            Enter the city or area where the property is located.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-medium text-[#1B3A5C]/60 uppercase tracking-[0.15em]">City / Area</label>
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
            <span className="text-xs text-[#1B3A5C]/35 mr-1">Existing:</span>
            {knownLocations.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => { onLocationChange(loc); setCoords(null) }}
                className={
                  "text-xs px-2.5 py-0.5 rounded-full border transition-colors " +
                  (loc === location
                    ? "bg-[#1B3A5C] text-[#FFFAF3] border-[#1B3A5C]"
                    : "bg-[#FBF9F4] text-[#1B3A5C]/55 border-[#1B3A5C]/10 hover:border-[#1B3A5C]/30")
                }
              >
                {loc}
              </button>
            ))}
          </div>
        )}
        {error && <p className="text-xs text-rose-500">{error}</p>}
      </div>

      <div className="flex items-center justify-between text-xs">
        <a
          href={mapSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[#C9A96E] hover:underline"
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
              className="text-xs text-[#1B3A5C]/35 hover:text-[#1B3A5C]/60 flex items-center gap-1 transition-colors"
            >
              <X className="h-3 w-3" /> Close
            </button>
          </div>
          <div className="overflow-hidden rounded-lg border border-[#1B3A5C]/10">
            <iframe
              title="Map preview"
              src={embedUrl}
              className="w-full h-52 border-0"
              loading="lazy"
            />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-[#1B3A5C]/15 bg-[#FBF9F4] p-4 text-center">
          <p className="text-[13px] text-[#1B3A5C]/35">
            Click &ldquo;Preview Map&rdquo; to verify this location on a map.
          </p>
        </div>
      )}
    </div>
  )
}
