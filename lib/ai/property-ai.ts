// AI helpers for the property admin: copywriting suggestions + icon assignment.
import "server-only"
import { groqChat, groqJson, isGroqConfigured } from "@/lib/ai/groq"
import { ICON_KEYS, iconKeyForText } from "@/lib/feature-icons"

export { isGroqConfigured }

export type PropertyContext = {
  title?: string
  propertyType?: string
  location?: string
  description?: string
}

const FIELD_BRIEFS: Record<string, { label: string; instruction: string }> = {
  description: { label: "description", instruction: "Write a warm, evocative 2–3 sentence property description for a luxury stay. Plain text, no markdown." },
  tagline: { label: "tagline", instruction: "Write ONE short, elegant tagline (max 12 words). Sentence case, no quotes." },
  story: { label: "story", instruction: "Write a 3–4 sentence editorial 'story' of this place — its character, design, and setting. Plain prose." },
  neighborhood: { label: "neighborhood", instruction: "Write 2–3 sentences about the surrounding area — walks, food, culture, views. Plain prose." },
  hostNote: { label: "host note", instruction: "Write a warm 2-sentence personal welcome note from the host. First person, plain prose." },
  highlights: { label: "highlights", instruction: "List 5–6 short standout selling points (2–4 words each), one per line. No numbering, no punctuation." },
  amenities: { label: "amenities", instruction: "List 6–8 common amenities for this kind of stay (1–3 words each), one per line. No numbering." },
  services: { label: "services & experiences", instruction: "List 5–6 concierge services / experiences (3–6 words each), one per line. No numbering." },
  whatToExpect: { label: "what to expect", instruction: "List 5 short 'what to expect' feature chips (2–3 words each), one per line. No numbering." },
}

export const SUGGESTABLE_FIELDS = Object.keys(FIELD_BRIEFS)

export async function suggestField(field: string, ctx: PropertyContext): Promise<string> {
  const brief = FIELD_BRIEFS[field]
  if (!brief) throw new Error("Unknown field")

  const ctxLines = [
    ctx.title && `Property name: ${ctx.title}`,
    ctx.propertyType && `Type: ${ctx.propertyType}`,
    ctx.location && `Location: ${ctx.location}`,
    ctx.description && `Existing description: ${ctx.description.slice(0, 500)}`,
  ].filter(Boolean).join("\n")

  return groqChat(
    [
      { role: "system", content: "You are a luxury hospitality copywriter for a Nepal-based boutique stays brand. Be concise, tasteful, specific, and never use emojis or markdown." },
      { role: "user", content: `${brief.instruction}\n\nContext:\n${ctxLines || "(no extra context provided)"}\n\nReturn only the ${brief.label} text.` },
    ],
    { temperature: 0.8, maxTokens: 400 }
  )
}

/**
 * Map each feature string to an icon key from the registry. Uses AI when
 * configured; always falls back to the keyword matcher so it never blocks a save.
 */
export async function assignFeatureIcons(features: string[]): Promise<Record<string, string>> {
  const unique = Array.from(new Set(features.map((f) => f.trim()).filter(Boolean)))
  if (unique.length === 0) return {}

  // Keyword baseline (guaranteed result).
  const result: Record<string, string> = {}
  for (const f of unique) result[f] = iconKeyForText(f)

  if (!isGroqConfigured()) return result

  try {
    const data = await groqJson<{ icons: { feature: string; icon: string }[] }>(
      [
        { role: "system", content: `You assign UI icons to property features. Choose the single best icon KEY for each feature from this exact list: ${ICON_KEYS.join(", ")}. Use "check" only if nothing fits.` },
        { role: "user", content: `Return JSON: {"icons":[{"feature":"<verbatim>","icon":"<key>"}]} for these features:\n${unique.map((f) => `- ${f}`).join("\n")}` },
      ],
      { temperature: 0.2, maxTokens: 600 }
    )
    for (const { feature, icon } of data.icons ?? []) {
      if (unique.includes(feature) && ICON_KEYS.includes(icon)) result[feature] = icon
    }
  } catch {
    // keep keyword baseline
  }
  return result
}
