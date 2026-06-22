// Property types and room-category suggestions. Everything is FREE TEXT —
// these only power datalist autocomplete; admins can type anything.

export const PROPERTY_TYPE_SUGGESTIONS = [
  "Hotel",
  "Resort",
  "Boutique Hotel",
  "Villa",
  "Apartment",
  "Aparthotel",
  "Lodge",
  "Guesthouse",
  "Homestay",
  "Cottage",
  "Hostel",
  "Tented Camp",
]

/** Room/unit category suggestions tailored to the property type. */
export function roomTypeSuggestionsFor(propertyType?: string | null): string[] {
  const t = (propertyType ?? "").toLowerCase()

  if (t.includes("villa")) {
    return [
      "Entire Villa",
      "Garden Villa",
      "Pool Villa",
      "Hillside Villa",
      "One-Bedroom Villa",
      "Two-Bedroom Villa",
      "Family Villa",
      "Honeymoon Villa",
    ]
  }
  if (t.includes("apart") || t.includes("studio")) {
    return [
      "Studio Apartment",
      "One-Bedroom Apartment",
      "Two-Bedroom Apartment",
      "Three-Bedroom Apartment",
      "Duplex Apartment",
      "Penthouse",
    ]
  }
  if (t.includes("hostel") || t.includes("camp")) {
    return [
      "Dormitory Bed",
      "Private Room",
      "Twin Room",
      "Deluxe Tent",
      "Family Room",
    ]
  }
  if (t.includes("cottage") || t.includes("homestay") || t.includes("guest")) {
    return [
      "Standard Room",
      "Deluxe Room",
      "Family Room",
      "Entire Cottage",
      "Attic Room",
    ]
  }
  // Hotel, Resort, Lodge, Boutique and everything else
  return [
    "Normal Room",
    "Standard Room",
    "Deluxe Room",
    "Super Deluxe Room",
    "Junior Suite",
    "Suite",
    "Executive Suite",
    "Family Room",
    "Presidential Suite",
  ]
}

/** Helper copy for the inventory section, adapted to the property type. */
export function inventoryHintFor(propertyType?: string | null): string {
  const t = (propertyType ?? "").toLowerCase()
  if (t.includes("villa")) {
    return "How many villas of each kind you offer. Each row is one villa category with its own bedrooms, washrooms, price and number of villas."
  }
  if (t.includes("apart")) {
    return "How many apartments of each layout you offer (Studio, One-Bedroom...). Each row is one layout with its own price and unit count."
  }
  return "How many rooms of each category this property has (Normal Rooms, Deluxe Rooms, Suites...). Each row is one category with its own price and room count."
}
