import { NextResponse } from "next/server"
import { groqChat, isGroqConfigured, testProviderDirect } from "@/lib/ai/groq"

export const dynamic = "force-dynamic"
export const maxDuration = 30

export async function GET(request: Request) {
  const url = new URL(request.url)
  const shouldTest = url.searchParams.get("test") !== "false"

  const groqRaw = process.env.GROQ_API_KEY || ""
  const groqKey = groqRaw.trim().replace(/^["']|["']$/g, "").trim()

  const openRouterRaw = process.env.OPENROUTER_API_KEY || ""
  const openRouterKey = openRouterRaw.trim().replace(/^["']|["']$/g, "").trim()

  const status = {
    configured: isGroqConfigured(),
    groq: {
      hasKey: Boolean(groqKey),
      keyPrefix: groqKey ? `${groqKey.slice(0, 7)}...` : null,
      autoRepaired: groqKey.startsWith("sk_") ? "Prepended missing 'g' to sk_" : false,
      rawModelEnv: process.env.GROQ_MODEL ?? null,
      directTest: null as unknown,
    },
    openRouter: {
      hasKey: Boolean(openRouterKey),
      keyPrefix: openRouterKey ? `${openRouterKey.slice(0, 10)}...` : null,
      rawModelEnv: process.env.OPENROUTER_MODEL ?? null,
      directTest: null as unknown,
    },
    redis: {
      configured: Boolean(process.env.REDIS_URL),
      isLocalhost: Boolean(process.env.REDIS_URL?.includes("localhost")),
    },
    vercelEnv: process.env.VERCEL_ENV || (process.env.VERCEL ? "vercel" : "local"),
    chatTest: {
      result: null as string | null,
      error: null as string | null,
    },
  }

  if (shouldTest && status.configured) {
    // 1. Test Groq directly
    if (status.groq.hasKey) {
      status.groq.directTest = await testProviderDirect("groq", "Reply with OK")
    }
    // 2. Test OpenRouter directly
    if (status.openRouter.hasKey) {
      status.openRouter.directTest = await testProviderDirect("openrouter", "Reply with OK")
    }
    // 3. Test full groqChat (primary + fallback)
    try {
      const reply = await groqChat(
        [{ role: "user", content: "Reply with the single word OK" }],
        { maxTokens: 10, temperature: 0.1 }
      )
      status.chatTest.result = reply.trim()
    } catch (err) {
      status.chatTest.error = err instanceof Error ? err.message : String(err)
    }
  }

  const isHealthy =
    status.configured &&
    (!shouldTest || Boolean(status.chatTest.result))

  return NextResponse.json(status, {
    status: isHealthy ? 200 : 503,
  })
}
