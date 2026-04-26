"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin } from "lucide-react"

export type ComboboxProperty = { title: string; slug: string; location: string }

function dedupeCities(properties: ComboboxProperty[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const p of properties) {
    const city = p.location.split(",")[0]?.trim()
    if (city && !seen.has(city)) {
      seen.add(city)
      out.push(city)
    }
  }
  return out
}

export function LocationCombobox({
  value,
  onChange,
  properties,
  placeholder = "Anywhere",
  inputClassName,
}: {
  value: string
  onChange: (val: string) => void
  properties: ComboboxProperty[]
  placeholder?: string
  inputClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const router = useRouter()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const q = query.toLowerCase()

  const matchedProperties = q
    ? properties.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      )
    : properties

  const allCities = dedupeCities(properties)
  const matchedCities = q
    ? allCities.filter((c) => c.toLowerCase().includes(q))
    : allCities

  const hasResults = matchedProperties.length > 0 || matchedCities.length > 0

  return (
    <div ref={rootRef} className="relative w-full">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={
          inputClassName ??
          "w-full bg-transparent border-0 outline-none text-sm text-charcoal placeholder:text-charcoal/30 font-light"
        }
      />

      {open && hasResults && (
        <div className="absolute top-[calc(100%+10px)] left-0 min-w-[260px] max-w-[340px] bg-white shadow-2xl border border-charcoal/8 z-50 max-h-72 overflow-y-auto">
          {matchedProperties.length > 0 && (
            <>
              <div className="flex items-center gap-2 px-4 pt-3 pb-1.5 border-b border-charcoal/5">
                <MapPin className="w-2.5 h-2.5 text-gold shrink-0" strokeWidth={2} />
                <p className="text-[8px] uppercase tracking-[0.25em] text-charcoal/40 font-bold">
                  Properties
                </p>
              </div>
              {matchedProperties.map((p) => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    router.push(`/properties/${p.slug}`)
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-[#F5F1E8] transition-colors duration-150 border-b border-charcoal/5 last:border-0"
                >
                  <div className="text-sm text-charcoal font-medium leading-tight">
                    {p.title}
                  </div>
                  <div className="text-[11px] text-charcoal/45 mt-0.5">{p.location}</div>
                </button>
              ))}
            </>
          )}

          {matchedCities.length > 0 && (
            <>
              <div className="flex items-center gap-2 px-4 pt-3 pb-1.5 border-b border-charcoal/5">
                <MapPin className="w-2.5 h-2.5 text-charcoal/30 shrink-0" strokeWidth={2} />
                <p className="text-[8px] uppercase tracking-[0.25em] text-charcoal/40 font-bold">
                  Locations
                </p>
              </div>
              {matchedCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setQuery(city)
                    onChange(city)
                    setOpen(false)
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-[#F5F1E8] transition-colors duration-150 border-b border-charcoal/5 last:border-0 text-sm text-charcoal font-light"
                >
                  {city}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

