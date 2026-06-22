export type ConciergeUserMessage = { role: "user"; content: string }

export const CONCIERGE_MAX_MESSAGES = 20
export const CONCIERGE_MAX_CONTENT = 1000
export const CONCIERGE_MAX_TOTAL = 6000

export function normalizeConciergeMessages(messages: unknown): ConciergeUserMessage[] | null {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > CONCIERGE_MAX_MESSAGES) {
    return null
  }

  const normalized: ConciergeUserMessage[] = []
  let totalLength = 0

  for (const message of messages) {
    if (typeof message !== "object" || message === null) return null

    const role = (message as { role?: unknown }).role
    const content = (message as { content?: unknown }).content
    if (role !== "user" || typeof content !== "string") return null

    const trimmed = content.trim()
    if (!trimmed || trimmed.length > CONCIERGE_MAX_CONTENT) return null

    totalLength += trimmed.length
    if (totalLength > CONCIERGE_MAX_TOTAL) return null

    normalized.push({ role: "user", content: trimmed })
  }

  return normalized
}
