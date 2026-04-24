import { describe, it, expect } from "vitest"
import { isHoneypotTriggered } from "@/lib/security/honeypot"
import { isPasswordPwned } from "@/lib/security/pwned"

// ─── Honeypot ─────────────────────────────────────────────
describe("isHoneypotTriggered", () => {
  it("returns false when website field is empty", () => {
    expect(isHoneypotTriggered({ website: "" })).toBe(false)
  })

  it("returns false when website field is missing", () => {
    expect(isHoneypotTriggered({ name: "test" })).toBe(false)
  })

  it("returns true when website field is filled", () => {
    expect(isHoneypotTriggered({ website: "http://spam.com" })).toBe(true)
  })

  it("returns true when hp_field is filled", () => {
    expect(isHoneypotTriggered({ hp_field: "spambot" })).toBe(true)
  })
})

// ─── Pwned Password ──────────────────────────────────────
describe("isPasswordPwned", { timeout: 10000 }, () => {
  it("returns true for 'password123' (known breach)", async () => {
    const result = await isPasswordPwned("password123")
    expect(result).toBe(true)
  })

  it("returns false for a very unique password", async () => {
    const uniquePassword = `Salt-Route-${Date.now()}-${Math.random().toString(36)}`
    const result = await isPasswordPwned(uniquePassword)
    expect(result).toBe(false)
  })
})
