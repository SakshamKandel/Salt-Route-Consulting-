export type MapCoordinates = [latitude: number, longitude: number]

const NEPAL_CENTER: MapCoordinates = [28.2, 84.0]

const DESTINATIONS: Array<{ terms: string[]; coordinates: MapCoordinates }> = [
  { terms: ["fikkal", "ilam", "suryodaya"], coordinates: [26.9114, 87.9282] },
  { terms: ["fulbari", "pokhara", "kaski"], coordinates: [28.2096, 83.9856] },
  { terms: ["lete", "thasang", "mustang"], coordinates: [28.6462, 83.5967] },
  { terms: ["nagarkot"], coordinates: [27.7172, 85.5208] },
  { terms: ["dhulikhel"], coordinates: [27.6221, 85.5426] },
  { terms: ["bandipur"], coordinates: [27.9389, 84.4069] },
  { terms: ["chitwan", "sauraha"], coordinates: [27.5291, 84.3542] },
  { terms: ["bhaktapur"], coordinates: [27.671, 85.4298] },
  { terms: ["lalitpur", "patan"], coordinates: [27.6644, 85.3188] },
  { terms: ["kathmandu"], coordinates: [27.7172, 85.324] },
  { terms: ["janakpur"], coordinates: [26.7271, 85.9407] },
  { terms: ["lumbini"], coordinates: [27.4833, 83.2767] },
  { terms: ["solukhumbu", "everest", "namche"], coordinates: [27.8069, 86.714] },
]

/**
 * Resolve the destinations represented by Salt Route without calling a
 * geocoding service. Unknown locations fall back to a country-level view.
 */
export function getNepalLocationCoordinates(location: string, address?: string | null): MapCoordinates {
  const haystack = `${location} ${address ?? ""}`.toLowerCase()
  const match = DESTINATIONS.find((destination) =>
    destination.terms.some((term) => haystack.includes(term)),
  )
  return match?.coordinates ?? NEPAL_CENTER
}
