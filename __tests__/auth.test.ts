import { describe, it, expect } from "vitest"
import { getDestination, getSafeCallback } from "@/lib/auth-utils"
import { loginSchema } from "@/lib/validations"
import { compare, hash } from "bcryptjs"

describe("Authentication & Routing Helpers", () => {
  describe("getSafeCallback", () => {
    it("should allow relative local paths", () => {
      // Mock window.location in node
      const originalWindow = global.window
      global.window = {
        location: { origin: "http://localhost:3000" },
      } as unknown as Window & typeof globalThis

      expect(getSafeCallback("/admin/properties")).toBe("/admin/properties")
      expect(getSafeCallback("/owner/dashboard?tab=bookings")).toBe("/owner/dashboard?tab=bookings")
      expect(getSafeCallback("https://malicious-site.com/steal")).toBeNull()

      global.window = originalWindow
    })
  })

  describe("getDestination", () => {
    it("should route ADMIN to admin dashboard or safe admin callback", () => {
      expect(getDestination("ADMIN", null)).toBe("/admin/dashboard")
      expect(getDestination("ADMIN", "/admin/properties/create")).toBe("/admin/properties/create")
      expect(getDestination("ADMIN", "/account")).toBe("/admin/dashboard")
    })

    it("should route OWNER to owner dashboard or safe owner callback", () => {
      expect(getDestination("OWNER", null)).toBe("/owner/dashboard")
      expect(getDestination("OWNER", "/owner/inquiries")).toBe("/owner/inquiries")
      expect(getDestination("OWNER", "/admin/dashboard")).toBe("/owner/dashboard")
    })

    it("should route GUEST to account page or safe guest callback", () => {
      expect(getDestination("GUEST", null)).toBe("/account")
      expect(getDestination("GUEST", "/stays/nepal-villa")).toBe("/stays/nepal-villa")
      expect(getDestination("GUEST", "/admin/dashboard")).toBe("/account")
      expect(getDestination("GUEST", "/login")).toBe("/account")
    })

    it("should route unauthenticated / null role to home", () => {
      expect(getDestination(null, null)).toBe("/")
    })
  })

  describe("Credentials Validation", () => {
    it("should validate proper emails and reject malformed emails", () => {
      expect(loginSchema.safeParse({ email: "admin@saltroutegroup.com", password: "Password123!" }).success).toBe(true)
      expect(loginSchema.safeParse({ email: "invalid-email", password: "Password123!" }).success).toBe(false)
      expect(loginSchema.safeParse({ email: "admin@saltroutegroup.com", password: "" }).success).toBe(false)
    })

    it("should verify bcrypt hashed passwords correctly", async () => {
      const password = "TestSecurePassword2026!"
      const hashed = await hash(password, 10)
      expect(await compare(password, hashed)).toBe(true)
      expect(await compare("WrongPassword!", hashed)).toBe(false)
    })
  })
})
