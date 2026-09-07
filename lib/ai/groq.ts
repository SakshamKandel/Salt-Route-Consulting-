// Server-only LLM client with automatic provider fallback.
// Primary: Groq (fast). Fallback: OpenRouter (used when Groq errors or is unset).
// Both are OpenAI-compatible chat-completions APIs. Keys live in env only
// (GROQ_API_KEY / OPENROUTER_API_KEY) — never hardcoded or exposed to the client.
import "server-only"

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string }

function cleanEnv(val?: string): string {
  if (!val) return ""
  return val.trim().replace(/^["']|["']$/g, "").trim()
}

function cleanGroqKey(val?: string): string {
  let key = cleanEnv(val)
  if (key.startsWith("sk_")) {
    key = "g" + key
  }
  return key
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

function getGroqModel(): string {
  const custom = cleanEnv(process.env.GROQ_MODEL)
  // Auto-correct common model mismatches (e.g. decommissioned or 404 models on current Groq tier)
  if (
    !custom ||
    custom.toLowerCase().includes("llama") ||
    custom.toLowerCase().includes("mixtral") ||
    custom.toLowerCase().includes("gemma")
  ) {
    return "qwen/qwen3.8-27b"
  }
  return custom
}

function getOpenRouterModel(): string {
  const custom = cleanEnv(process.env.OPENROUTER_MODEL)
  return custom || "meta-llama/llama-3.3-70b-instruct"
}

type GroqOptions = {
  model?: string
  temperature?: number
  maxTokens?: number
  json?: boolean
  signal?: AbortSignal
}

type Provider = {
  name: string
  url: string
  key: string
  model: string
  extraHeaders?: Record<string, string>
}

/** True when ANY AI provider is configured (Groq primary or OpenRouter fallback). */
export function isGroqConfigured() {
  return Boolean(cleanGroqKey(process.env.GROQ_API_KEY) || cleanEnv(process.env.OPENROUTER_API_KEY))
}

/** Ordered provider list: Groq first, OpenRouter as fallback. */
function providers(): Provider[] {
  const list: Provider[] = []
  const groqKey = cleanGroqKey(process.env.GROQ_API_KEY)
  const openRouterKey = cleanEnv(process.env.OPENROUTER_API_KEY)

  if (groqKey) {
    list.push({ name: "groq", url: GROQ_URL, key: groqKey, model: getGroqModel() })
  }
  if (openRouterKey) {
    list.push({
      name: "openrouter",
      url: OPENROUTER_URL,
      key: openRouterKey,
      model: getOpenRouterModel(),
      // Recommended attribution headers for OpenRouter.
      extraHeaders: {
        "HTTP-Referer": cleanEnv(process.env.SITE_URL) || "https://saltroutegroup.com",
        "X-Title": cleanEnv(process.env.SITE_NAME) || "Salt Route",
      },
    })
  }
  return list
}

async function callProvider(p: Provider, messages: ChatMessage[], opts: GroqOptions): Promise<string> {
  const signal = opts.signal || AbortSignal.timeout(10000)

  const res = await fetch(p.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${p.key}`,
      "Content-Type": "application/json",
      ...(p.extraHeaders ?? {}),
    },
    body: JSON.stringify({
      model: cleanEnv(opts.model) || p.model,
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 800,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
    signal,
    // AI responses must never be cached at the fetch layer.
    cache: "no-store",
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`${p.name} request failed (${res.status}): ${detail.slice(0, 300)}`)
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  const text = data.choices?.[0]?.message?.content?.trim() ?? ""
  if (!text) throw new Error(`${p.name} returned an empty response`)
  return text
}

/** Diagnostic helper to test a specific provider directly without fallback. */
export async function testProviderDirect(
  name: "groq" | "openrouter",
  prompt = "Reply with the single word OK"
): Promise<{ success: boolean; model: string; reply?: string; error?: string; latencyMs: number }> {
  const list = providers()
  const p = list.find((x) => x.name === name)
  if (!p) {
    return { success: false, model: "none", error: `Provider ${name} is not configured`, latencyMs: 0 }
  }
  const t0 = Date.now()
  try {
    const reply = await callProvider(p, [{ role: "user", content: prompt }], {
      maxTokens: 20,
      temperature: 0.1,
      signal: AbortSignal.timeout(8000),
    })
    return { success: true, model: p.model, reply, latencyMs: Date.now() - t0 }
  } catch (err) {
    return {
      success: false,
      model: p.model,
      error: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - t0,
    }
  }
}

/**
 * Chat completion with provider fallback. Tries Groq, then OpenRouter; returns
 * the first success and throws only if every configured provider fails.
 */
export async function groqChat(messages: ChatMessage[], opts: GroqOptions = {}): Promise<string> {
  const list = providers()
  if (list.length === 0) {
    throw new Error("No AI provider configured (set GROQ_API_KEY or OPENROUTER_API_KEY)")
  }

  let lastError: unknown
  for (const p of list) {
    try {
      console.log(`[AI] ${p.name}: model ${opts.model || p.model}, ${messages.length} messages`)
      return await callProvider(p, messages, opts)
    } catch (error) {
      lastError = error
      const msg = error instanceof Error ? error.message : String(error)
      console.error(`[AI] ${p.name} failed${list.length > 1 ? " — trying fallback" : ""}: ${msg}`)
    }
  }
  throw lastError instanceof Error ? lastError : new Error("All AI providers failed")
}

/** Call expecting a JSON object back; parses and returns it (or throws). */
export async function groqJson<T = unknown>(messages: ChatMessage[], opts: GroqOptions = {}): Promise<T> {
  const text = await groqChat(messages, { ...opts, json: true })
  // Be tolerant of stray prose around the JSON.
  const start = text.indexOf("{")
  const end = text.lastIndexOf("}")
  const slice = start >= 0 && end > start ? text.slice(start, end + 1) : text
  return JSON.parse(slice) as T
}
