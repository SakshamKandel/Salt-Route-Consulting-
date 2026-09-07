import { NextResponse } from "next/server"
import { groqChat, isGroqConfigured } from "@/lib/ai/groq"

export const dynamic = "force-dynamic"
export const maxDuration = 30

export async function GET(request: Request) {
  const url = new URL(request.url)
  const shouldTest = url.searchParams.get("test") !== "false"

  const groqRaw = process.env.GROQ_API_KEY || ""
  const groqKey = groqRaw.trim().replace(/^["']|["']$/g, "").trim()
  const groqKeyRepaired = groqKey.startsWith("sk_") ? "g" + groqKey : groqKey

  const openRouterRaw = process.env.OPENROUTER_API_KEY || ""
  const openRouterKey = openRouterRaw.trim().replace(/^["']|["']$/g, "").trim()

  const status = {
    configured: isGroqConfigured(),
    groq: {
      hasKey: Boolean(groqKey),
      keyPrefix: groqKey ? `${groqKey.slice(0, 7)}...` : null,
      autoRepaired: groqKey.startsWith("sk_") ? "Prepended missing 'g' to sk_" : false,
      model: (process.env.GROQ_MODEL || "groq/compound-mini").trim(),
    },
    openRouter: {
      hasKey: Boolean(openRouterKey),
      keyPrefix: openRouterKey ? `${openRouterKey.slice(0, 10)}...` : null,
      model: (process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct").trim(),
    },
    redis: {
      configured: Boolean(process.env.REDIS_URL),
      isLocalhost: Boolean(process.env.REDIS_URL?.includes("localhost")),
    },
    vercelEnv: process.env.VERCEL_ENV || (process.env.VERCEL ? "vercel" : "local"),
    testResult: null as string | null,
    testError: null as string | null,
  }

  if (shouldTest && status.configured) {
    try {
      const reply = await groqChat(
        [{ role: "user", content: "Reply with the single word OK" }],
        { maxTokens: 10, temperature: 0.1 }
      )
      status.testResult = reply.trim()
    } catch (err) {
      status.testError = err instanceof Error ? err.message : String(err)
    }
  }

  return NextResponse.json(status, {
    status: status.configured && (!shouldTest || status.testResult) ? 200 : 503,
  })
}
