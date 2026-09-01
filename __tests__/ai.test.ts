import { describe, it, expect } from "vitest"
import { isGroqConfigured, groqChat, groqJson } from "@/lib/ai/groq"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

describe("AI Provider Integration", () => {
  it("should detect configured AI provider", () => {
    expect(isGroqConfigured()).toBe(true)
  })

  it("should successfully generate chat completions", async () => {
    const reply = await groqChat([
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Reply with the single word: working" },
    ])
    expect(typeof reply).toBe("string")
    expect(reply.length).toBeGreaterThan(0)
  }, 15000)

  it("should successfully generate structured JSON", async () => {
    const data = await groqJson<{ status: string }>([
      { role: "system", content: "Return valid JSON." },
      { role: "user", content: 'Return JSON: {"status": "ok"}' },
    ])
    expect(data).toBeDefined()
    expect(data.status).toBe("ok")
  }, 15000)
})
