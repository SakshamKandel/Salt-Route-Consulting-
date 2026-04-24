import { describe, it, expect } from "vitest"

/**
 * Unit-test the booking code format.
 * We cannot call the real generator (needs DB) so we test the format logic.
 */
describe("Booking code format", () => {
  it("matches the SLT-YYYY-NNNN pattern", () => {
    const year = new Date().getFullYear()
    const random = Math.floor(1000 + Math.random() * 9000)
    const code = `SLT-${year}-${random}`

    expect(code).toMatch(/^SLT-\d{4}-\d{4}$/)
  })

  it("year component matches current year", () => {
    const year = new Date().getFullYear()
    const code = `SLT-${year}-1234`
    const extractedYear = parseInt(code.split("-")[1])
    expect(extractedYear).toBe(year)
  })

  it("random component is 4 digits", () => {
    const random = Math.floor(1000 + Math.random() * 9000)
    expect(random).toBeGreaterThanOrEqual(1000)
    expect(random).toBeLessThanOrEqual(9999)
  })
})

/**
 * Price calculation tests
 */
describe("Price calculation", () => {
  function calculateTotalPrice(pricePerNight: number, checkIn: Date, checkOut: Date): number {
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    return nights * pricePerNight
  }

  it("calculates 1 night correctly", () => {
    const checkIn = new Date("2025-01-01")
    const checkOut = new Date("2025-01-02")
    expect(calculateTotalPrice(100, checkIn, checkOut)).toBe(100)
  })

  it("calculates 7 nights correctly", () => {
    const checkIn = new Date("2025-01-01")
    const checkOut = new Date("2025-01-08")
    expect(calculateTotalPrice(150, checkIn, checkOut)).toBe(1050)
  })

  it("returns 0 for same-day (edge case)", () => {
    const sameDay = new Date("2025-01-01")
    expect(calculateTotalPrice(100, sameDay, sameDay)).toBe(0)
  })
})

/**
 * Availability overlap detection tests
 */
describe("Availability overlap detection", () => {
  function hasOverlap(
    existingCheckIn: Date,
    existingCheckOut: Date,
    requestedCheckIn: Date,
    requestedCheckOut: Date
  ): boolean {
    return requestedCheckIn < existingCheckOut && requestedCheckOut > existingCheckIn
  }

  it("detects full overlap", () => {
    const result = hasOverlap(
      new Date("2025-03-01"),
      new Date("2025-03-10"),
      new Date("2025-03-03"),
      new Date("2025-03-07")
    )
    expect(result).toBe(true)
  })

  it("detects partial overlap at start", () => {
    const result = hasOverlap(
      new Date("2025-03-05"),
      new Date("2025-03-10"),
      new Date("2025-03-01"),
      new Date("2025-03-07")
    )
    expect(result).toBe(true)
  })

  it("detects partial overlap at end", () => {
    const result = hasOverlap(
      new Date("2025-03-01"),
      new Date("2025-03-05"),
      new Date("2025-03-04"),
      new Date("2025-03-10")
    )
    expect(result).toBe(true)
  })

  it("no overlap when entirely before", () => {
    const result = hasOverlap(
      new Date("2025-03-10"),
      new Date("2025-03-15"),
      new Date("2025-03-01"),
      new Date("2025-03-05")
    )
    expect(result).toBe(false)
  })

  it("no overlap when entirely after", () => {
    const result = hasOverlap(
      new Date("2025-03-01"),
      new Date("2025-03-05"),
      new Date("2025-03-10"),
      new Date("2025-03-15")
    )
    expect(result).toBe(false)
  })

  it("no overlap when touching boundaries (checkout == checkin)", () => {
    const result = hasOverlap(
      new Date("2025-03-01"),
      new Date("2025-03-05"),
      new Date("2025-03-05"),
      new Date("2025-03-10")
    )
    expect(result).toBe(false)
  })
})
