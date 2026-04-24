import { test, expect } from "@playwright/test"

// ─── Auth Flow ────────────────────────────────────────────
test.describe("Auth flow", () => {
  test("login page loads", async ({ page }) => {
    await page.goto("/login")
    await expect(page.locator("h1, h2")).toContainText(/log\s*in|sign\s*in/i)
  })

  test("signup page loads", async ({ page }) => {
    await page.goto("/signup")
    await expect(page.locator("h1, h2")).toContainText(/sign\s*up|create\s*account/i)
  })

  test("forgot password page loads", async ({ page }) => {
    await page.goto("/forgot-password")
    await expect(page.locator("h1, h2")).toContainText(/forgot|reset/i)
  })

  test("protected admin route redirects to login", async ({ page }) => {
    await page.goto("/admin/dashboard")
    await page.waitForURL(/\/login/)
    expect(page.url()).toContain("/login")
  })

  test("protected owner route redirects to login", async ({ page }) => {
    await page.goto("/owner/dashboard")
    await page.waitForURL(/\/login/)
    expect(page.url()).toContain("/login")
  })

  test("signup form has all required fields", async ({ page }) => {
    await page.goto("/signup")
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible()
  })

  test("login form has email and password fields", async ({ page }) => {
    await page.goto("/login")
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test("login form rejects empty submission", async ({ page }) => {
    await page.goto("/login")
    await page.locator('button[type="submit"]').click()
    // Expect either a validation message or an error alert to appear
    await expect(
      page.locator('[role="alert"], .text-red-400, [data-slot="form-message"]').first()
    ).toBeVisible({ timeout: 3000 })
  })

  test("forgot password form shows success message for any email", async ({ page }) => {
    await page.goto("/forgot-password")
    const emailInput = page.locator('input[type="email"]').first()
    await emailInput.fill("nonexistent@example.com")
    await page.locator('button[type="submit"]').click()
    // Should always show the same message (no email enumeration)
    await expect(
      page.locator("text=/If an account exists|reset link/i").first()
    ).toBeVisible({ timeout: 5000 })
  })
})

// ─── Public Pages ─────────────────────────────────────────
test.describe("Public pages", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/salt route/i)
  })

  test("homepage has no console errors", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text())
    })
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    expect(errors.filter((e) => !e.includes("favicon"))).toHaveLength(0)
  })

  test("booking request page loads", async ({ page }) => {
    await page.goto("/booking-request")
    // Either loads or redirects to login if auth required
    const url = page.url()
    const isOnPage = url.includes("/booking-request")
    const isRedirected = url.includes("/login")
    expect(isOnPage || isRedirected).toBe(true)
  })
})

// ─── API Security ─────────────────────────────────────────
test.describe("API security", () => {
  test("booking API rejects unauthenticated requests", async ({ request }) => {
    const res = await request.post("/api/bookings", {
      data: { propertyId: "fake", checkIn: "2025-01-01", checkOut: "2025-01-02", guests: 1 },
    })
    expect(res.status()).toBe(401)
  })

  test("availability API rejects missing params", async ({ request }) => {
    const res = await request.get("/api/properties/fake/availability")
    expect(res.status()).toBe(400)
  })

  test("inquiry API rejects malformed data", async ({ request }) => {
    const res = await request.post("/api/inquiries", {
      data: { name: "", email: "bad", message: "" },
    })
    expect(res.status()).toBe(400)
  })

  test("upload signature rejects unauthenticated requests", async ({ request }) => {
    const res = await request.post("/api/upload/signature")
    expect(res.status()).toBe(401)
  })

  test("review API rejects unauthenticated requests", async ({ request }) => {
    const res = await request.post("/api/reviews", {
      data: { propertyId: "fake", rating: 5, comment: "Great stay!" },
    })
    expect(res.status()).toBe(401)
  })

  test("booking cancel API rejects unauthenticated requests", async ({ request }) => {
    const res = await request.post("/api/bookings/fake-id/cancel", {
      data: { reason: "Plans changed" },
    })
    expect(res.status()).toBe(401)
  })

  test("inquiry API rejects valid-looking honeypot submissions silently", async ({ request }) => {
    const res = await request.post("/api/inquiries", {
      data: {
        name: "Test Bot",
        email: "bot@example.com",
        subject: "Test",
        message: "Hello, I have a question about this property.",
        website: "http://spam.example.com",
      },
    })
    // Honeypot triggered → fake success (200)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  test("security headers are present", async ({ request }) => {
    const res = await request.get("/")
    const headers = res.headers()
    expect(headers["x-frame-options"]).toBeTruthy()
    expect(headers["x-content-type-options"]).toBe("nosniff")
    expect(headers["referrer-policy"]).toBeTruthy()
  })
})

// ─── Zod Validation (API) ─────────────────────────────────
test.describe("Input validation", () => {
  test("inquiry API rejects missing required fields", async ({ request }) => {
    const res = await request.post("/api/inquiries", {
      data: {},
    })
    expect(res.status()).toBe(400)
  })

  test("inquiry API returns 400 for too-short message", async ({ request }) => {
    const res = await request.post("/api/inquiries", {
      data: {
        name: "Test User",
        email: "test@example.com",
        subject: "Hello",
        message: "Hi",
      },
    })
    expect(res.status()).toBe(400)
  })

  test("availability API rejects invalid date format", async ({ request }) => {
    const res = await request.get(
      "/api/properties/some-id/availability?from=not-a-date&to=also-not"
    )
    expect(res.status()).toBe(400)
  })
})
