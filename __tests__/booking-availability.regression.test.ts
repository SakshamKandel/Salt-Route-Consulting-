import { describe, expect, it } from "vitest"
import { eachNightDay, nightsBetween, toDateOnlyString } from "@/lib/booking-dates"
import { computeDisabledDays, maxUnitsForRange, type AvailabilityPayload } from "@/lib/availability-client"

function localDay(year: number, monthIndex: number, day: number) {
  return new Date(year, monthIndex, day)
}

describe("booking availability night ranges", () => {
  it("counts nights as [checkIn, checkOut) so checkout day is free for turnover", () => {
    const nights = eachNightDay(localDay(2026, 0, 10), localDay(2026, 0, 14))
      .map(toDateOnlyString)

    expect(nights).toEqual(["2026-01-10", "2026-01-11", "2026-01-12", "2026-01-13"])
    expect(nightsBetween(localDay(2026, 0, 10), localDay(2026, 0, 14))).toBe(4)
  })

  it("does not disable the checkout date for a fully booked room type", () => {
    const data: AvailabilityPayload = {
      propertyUnits: 1,
      roomTypes: [{ id: "deluxe", name: "Deluxe", totalUnits: 1 }],
      blockedDates: [],
      bookings: [{
        checkIn: localDay(2026, 0, 10),
        checkOut: localDay(2026, 0, 14),
        roomTypeId: "deluxe",
        units: 1,
      }],
    }

    const disabled = computeDisabledDays(data, "deluxe").map(toDateOnlyString)

    expect(disabled).toContain("2026-01-10")
    expect(disabled).toContain("2026-01-13")
    expect(disabled).not.toContain("2026-01-14")
  })

  it("allows a new stay that begins on another booking's checkout date", () => {
    const data: AvailabilityPayload = {
      propertyUnits: 1,
      roomTypes: [{ id: "deluxe", name: "Deluxe", totalUnits: 1 }],
      blockedDates: [],
      bookings: [{
        checkIn: localDay(2026, 0, 10),
        checkOut: localDay(2026, 0, 14),
        roomTypeId: "deluxe",
        units: 1,
      }],
    }

    expect(maxUnitsForRange(data, "deluxe", localDay(2026, 0, 14), localDay(2026, 0, 16))).toBe(1)
    expect(maxUnitsForRange(data, "deluxe", localDay(2026, 0, 13), localDay(2026, 0, 15))).toBe(0)
  })

  it("does not treat a checkout-day block as occupying the previous night", () => {
    const data: AvailabilityPayload = {
      propertyUnits: 1,
      roomTypes: [{ id: "deluxe", name: "Deluxe", totalUnits: 1 }],
      blockedDates: [{ date: localDay(2026, 0, 14), roomTypeId: "deluxe" }],
      bookings: [],
    }

    expect(maxUnitsForRange(data, "deluxe", localDay(2026, 0, 10), localDay(2026, 0, 14))).toBe(1)
    expect(maxUnitsForRange(data, "deluxe", localDay(2026, 0, 14), localDay(2026, 0, 15))).toBe(0)
  })
})
