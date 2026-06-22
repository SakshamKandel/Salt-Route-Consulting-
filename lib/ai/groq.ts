// Server-only LLM client with automatic provider fallback.
// Primary: Groq (fast). Fallback: OpenRouter (used when Groq errors or is unset).
// Both are OpenAI-compatible chat-completions APIs. Keys live in env only
// (GROQ_API_KEY / OPENROUTER_API_KEY) — never hardcoded or exposed to the client.
import "server-only"

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string }

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct"

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
  return Boolean(process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY)
}

/** Ordered provider list: Groq first, OpenRouter as fallback. */
function providers(): Provider[] {
  const list: Provider[] = []
  if (process.env.GROQ_API_KEY) {
    list.push({ name: "groq", url: GROQ_URL, key: process.env.GROQ_API_KEY, model: GROQ_MODEL })
  }
  if (process.env.OPENROUTER_API_KEY) {
    list.push({
      name: "openrouter",
      url: OPENROUTER_URL,
      key: process.env.OPENROUTER_API_KEY,
      model: OPENROUTER_MODEL,
      // Recommended attribution headers for OpenRouter.
      extraHeaders: {
        "HTTP-Referer": process.env.SITE_URL || "https://saltroutegroup.com",
        "X-Title": process.env.SITE_NAME || "Salt Route",
      },
    })
  }
  return list
}

async function callProvider(p: Provider, messages: ChatMessage[], opts: GroqOptions): Promise<string> {
  const res = await fetch(p.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${p.key}`,
      "Content-Type": "application/json",
      ...(p.extraHeaders ?? {}),
    },
    body: JSON.stringify({
      model: opts.model || p.model,
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 800,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
    signal: opts.signal,
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
