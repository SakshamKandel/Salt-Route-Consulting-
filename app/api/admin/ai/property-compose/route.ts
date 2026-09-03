import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { groqJson, isGroqConfigured } from "@/lib/ai/groq"
import { safeErrorResponse } from "@/lib/security"

const MAX_ANSWER_CHARS = 120_000
const MAX_TOTAL_ANSWER_CHARS = 160_000
const MAX_PROMPT_CONTEXT_CHARS = 48_000

const requestSchema = z.object({
  answers: z.record(z.string().max(80), z.string().max(MAX_ANSWER_CHARS)),
  knownLocations: z.array(z.string().max(200)).max(200).optional(),
  featureNames: z.array(z.string().max(160)).max(200).optional(),
}).superRefine((value, ctx) => {
  const total = Object.values(value.answers).reduce((sum, answer) => sum + answer.length, 0)
  if (total > MAX_TOTAL_ANSWER_CHARS) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["answers"],
      message: "The combined property notes are too long. Keep them under 160,000 characters.",
    })
  }
})

type AiRoomType = {
  name?: unknown
  classType?: unknown
  pricePerNight?: unknown
  maxGuests?: unknown
  totalUnits?: unknown
  bedrooms?: unknown
  bathrooms?: unknown
}

type AiSection = {
  title?: unknown
  subtitle?: unknown
  body?: unknown
}

type AiComposeOutput = {
  title?: unknown
  slug?: unknown
  propertyType?: unknown
  description?: unknown
  tagline?: unknown
  story?: unknown
  neighborhood?: unknown
  hostNote?: unknown
  location?: unknown
  address?: unknown
  pricePerNight?: unknown
  totalUnits?: unknown
  bedrooms?: unknown
  bathrooms?: unknown
  maxGuests?: unknown
  checkInTime?: unknown
  checkOutTime?: unknown
  highlights?: unknown
  amenities?: unknown
  services?: unknown
  whatToExpect?: unknown
  rules?: unknown
  highlightsTitle?: unknown
  amenitiesTitle?: unknown
  roomTypes?: unknown
  sections?: unknown
}

function normalizeSource(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function compactSource(value: string, maxChars: number) {
  const normalized = normalizeSource(value)
  if (normalized.length <= maxChars) return normalized

  const marker = "\n\n[Middle of the source notes compacted for processing]\n\n"
  const available = Math.max(1, maxChars - marker.length)
  const headLength = Math.floor(available * 0.72)
  const tailLength = available - headLength
  return `${normalized.slice(0, headLength)}${marker}${normalized.slice(-tailLength)}`
}

function buildAnswerContext(answers: Record<string, string>, maxChars = MAX_PROMPT_CONTEXT_CHARS) {
  const entries = Object.entries(answers)
  if (!entries.length) return ""
  const labelBudget = entries.reduce((sum, [key]) => sum + key.length + 3, 0)
  const contentBudget = Math.max(1, maxChars - labelBudget)
  const totalLength = entries.reduce((sum, [, value]) => sum + normalizeSource(value).length, 0) || 1

  return entries
    .map(([key, value]) => {
      const proportional = Math.floor((normalizeSource(value).length / totalLength) * contentBudget)
      const budget = Math.max(600, Math.min(contentBudget, proportional))
      return `${key}: ${compactSource(value, budget)}`
    })
    .join("\n\n")
    .slice(0, maxChars)
}

function toStr(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, max)
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]/g, "")
    const parsed = Number(cleaned)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

function clampInt(value: number | undefined, min: number, max: number, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, Math.round(value)))
}

function toStrArray(value: unknown, maxItems: number, maxLen: number): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const items = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .map((item) => item.slice(0, maxLen))
  return items.length ? items.slice(0, maxItems) : undefined
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || !["ADMIN", "OWNER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!isGroqConfigured()) {
    return NextResponse.json({ error: "AI is not configured. Add GROQ_API_KEY." }, { status: 503 })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  try {
    const parsed = requestSchema.parse(payload)
    const answers = parsed.answers
    const knownLocations = parsed.knownLocations ?? []
    const featureNames = parsed.featureNames ?? []

    const ctx = buildAnswerContext(answers)

    const locationGuidance = knownLocations.length
      ? `Prefer one of these existing location values when it matches: ${knownLocations.slice(0, 80).join("; ")}. If none match, use the owner's location exactly.`
      : "Use the owner's location exactly."

    const featureGuidance = featureNames.length
      ? `For whatToExpect, choose up to 5 values from this exact list when possible: ${featureNames.slice(0, 100).join("; ")}. Do not invent new feature names if a close match exists.`
      : "For whatToExpect, return 5 short feature chips."

    const buildMessages = (answerContext: string) => [
        {
          role: "system" as const,
          content: `You are a luxury hospitality copywriter for Salt Route Group, a Nepal-based boutique stays brand. Based on the owner's answers, generate polished, accurate property content. Use simple sentences and a warm professional tone. Never use emojis or markdown. Do not use em dashes.

Return valid JSON only, with these keys:
title, slug, propertyType, description, tagline, story, neighborhood, hostNote, location, address, pricePerNight, totalUnits, bedrooms, bathrooms, maxGuests, checkInTime, checkOutTime, highlights, amenities, services, whatToExpect, rules, highlightsTitle, amenitiesTitle, roomTypes, sections.

Rules:
- title: concise property name.
- slug: kebab-case version of title.
- propertyType: short type such as Villa, Lodge, Hotel, Retreat, Apartment.
- description: 2 to 3 sentences.
- tagline: maximum 12 words.
- story: 3 to 4 sentences about the property character and setting.
- neighborhood: 2 to 3 sentences about the surrounding area.
- hostNote: 2 warm sentences written in first person from the host.
- location: factual place name. ${locationGuidance}
- address: full address if provided, otherwise omit.
- pricePerNight: base nightly price in NPR as a number.
- totalUnits, bedrooms, bathrooms, maxGuests: integers.
- checkInTime and checkOutTime: short human-readable times such as 2:00 PM and 11:00 AM.
- highlights: 5 to 6 short selling points.
- amenities: 6 to 8 items.
- services: 5 to 6 items.
- rules: 4 to 5 practical house rules.
- whatToExpect: 5 short items. ${featureGuidance}
- highlightsTitle and amenitiesTitle: short section titles.
- roomTypes: array of objects. Each object must contain name, classType, pricePerNight, maxGuests, totalUnits, bedrooms, bathrooms. Derive room types and pricing from the owner answers. Prices must be numbers in NPR. If room details are missing, create one sensible room type.
- sections: 2 to 4 editorial story chapters as objects with title, subtitle, and body. Each body should be 2 to 4 clear sentences about a distinct property theme. Do not invent facts.`,
        },
        {
          role: "user" as const,
          content: `Property owner answers:\n${answerContext}\n\nThe source may contain long, unstructured paragraphs. Organise and condense them, preserve factual details, remove repetition, and return JSON with all useful fields filled. Use null or omit a field only when it is truly unknown.`,
        },
      ]

    let data: AiComposeOutput
    try {
      data = await groqJson<AiComposeOutput>(buildMessages(ctx), { temperature: 0.65, maxTokens: 3600 })
    } catch (firstError) {
      console.warn("[PROPERTY_AI_COMPOSE_RETRY] Retrying with compact context", firstError)
      const retryContext = buildAnswerContext(answers, 18_000)
      data = await groqJson<AiComposeOutput>(buildMessages(retryContext), { temperature: 0.45, maxTokens: 3200 })
    }

    const title = toStr(data.title, 160)
    const slug = toStr(data.slug, 160) ?? (title ? slugify(title) : undefined)

    const rawRoomTypes = Array.isArray(data.roomTypes) ? (data.roomTypes as AiRoomType[]) : []
    const preliminaryRoomTypes = rawRoomTypes.slice(0, 50).map((rt) => {
      const name = toStr(rt?.name, 120) ?? toStr(rt?.classType, 120) ?? "Room"
      const classType = toStr(rt?.classType, 60) ?? "Room"
      return {
        name,
        classType,
        pricePerNight: clampInt(toNumber(rt?.pricePerNight), 0, 10_000_000, 0),
        maxGuests: clampInt(toNumber(rt?.maxGuests), 1, 50, 2),
        totalUnits: clampInt(toNumber(rt?.totalUnits), 1, 10000, 1),
        bedrooms: clampInt(toNumber(rt?.bedrooms), 0, 100, 1),
        bathrooms: clampInt(toNumber(rt?.bathrooms), 0, 100, 1),
      }
    })

    const validRoomPrices = preliminaryRoomTypes.map((rt) => rt.pricePerNight).filter((n) => n > 0)
    const minRoomPrice = validRoomPrices.length ? Math.min(...validRoomPrices) : 0
    const pricePerNight = clampInt(toNumber(data.pricePerNight), 0, 10_000_000, minRoomPrice)

    const roomTypes = preliminaryRoomTypes
      .map((rt) => ({
        ...rt,
        pricePerNight: rt.pricePerNight > 0 ? rt.pricePerNight : pricePerNight,
      }))
      .filter((rt) => rt.pricePerNight > 0)

    const sumUnits = roomTypes.reduce((sum, rt) => sum + rt.totalUnits, 0)
    const sumBedrooms = roomTypes.reduce((sum, rt) => sum + rt.bedrooms * rt.totalUnits, 0)
    const sumBathrooms = roomTypes.reduce((sum, rt) => sum + rt.bathrooms * rt.totalUnits, 0)
    const sumGuestCapacity = roomTypes.reduce((sum, rt) => sum + rt.maxGuests * rt.totalUnits, 0)

    const totalUnits = clampInt(toNumber(data.totalUnits), 1, 10000, sumUnits || 1)
    const bedrooms = clampInt(toNumber(data.bedrooms), 0, 500, sumBedrooms || 1)
    const bathrooms = clampInt(toNumber(data.bathrooms), 0, 500, sumBathrooms || 1)
    const maxGuests = clampInt(toNumber(data.maxGuests), 1, 1000, sumGuestCapacity || 2)

    let location = toStr(data.location, 200) ?? toStr(answers.location, 200)
    if (location && knownLocations.length) {
      const lower = location.toLowerCase()
      const tokens = new Set(lower.split(/[^a-z0-9]+/).filter((t) => t.length > 3))
      const exact = knownLocations.find((known) => known.toLowerCase() === lower)
      const fuzzy = knownLocations.find((known) => {
        const knownLower = known.toLowerCase()
        if (knownLower.includes(lower) || lower.includes(knownLower)) return true
        return knownLower
          .split(/[^a-z0-9]+/)
          .filter((t) => t.length > 3)
          .some((t) => tokens.has(t))
      })
      location = exact ?? fuzzy ?? location
    }

    let whatToExpect = toStrArray(data.whatToExpect, 20, 160)
    if (whatToExpect && featureNames.length) {
      const byLower = new Map(featureNames.map((name) => [name.toLowerCase(), name] as const))
      const matched = new Set<string>()

      for (const item of whatToExpect) {
        const exact = byLower.get(item.toLowerCase())
        if (exact) {
          matched.add(exact)
          continue
        }

        const lowerItem = item.toLowerCase()
        const fuzzy = featureNames.find((name) => {
          const lowerName = name.toLowerCase()
          return lowerName.includes(lowerItem) || lowerItem.includes(lowerName)
        })
        if (fuzzy) matched.add(fuzzy)
      }

      whatToExpect = Array.from(matched).slice(0, 20)
      if (!whatToExpect.length) whatToExpect = undefined
    }

    const fields: Record<string, unknown> = {
      title,
      slug,
      propertyType: toStr(data.propertyType, 60),
      description: toStr(data.description, 5000),
      tagline: toStr(data.tagline, 200),
      story: toStr(data.story, 5000),
      neighborhood: toStr(data.neighborhood, 3000),
      hostNote: toStr(data.hostNote, 2000),
      location,
      address: toStr(data.address, 300),
      pricePerNight: pricePerNight > 0 ? pricePerNight : undefined,
      totalUnits,
      bedrooms,
      bathrooms,
      maxGuests,
      checkInTime: toStr(data.checkInTime, 40),
      checkOutTime: toStr(data.checkOutTime, 40),
      highlights: toStrArray(data.highlights, 20, 160),
      amenities: toStrArray(data.amenities, 80, 160),
      services: toStrArray(data.services, 40, 160),
      whatToExpect,
      rules: toStrArray(data.rules, 40, 300),
      highlightsTitle: toStr(data.highlightsTitle, 80),
      amenitiesTitle: toStr(data.amenitiesTitle, 80),
      roomTypes: roomTypes.length ? roomTypes : undefined,
      sections: Array.isArray(data.sections)
        ? (data.sections as AiSection[])
            .slice(0, 6)
            .map((section) => ({
              title: toStr(section?.title, 160),
              subtitle: toStr(section?.subtitle, 160),
              body: toStr(section?.body, 5000),
            }))
            .filter((section): section is { title: string; subtitle: string | undefined; body: string } => Boolean(section.title && section.body))
        : undefined,
    }

    for (const key of Object.keys(fields)) {
      if (fields[key] === undefined) delete fields[key]
    }

    return NextResponse.json({ fields })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid property notes." }, { status: 400 })
    }
    return safeErrorResponse(error, "POST /api/admin/ai/property-compose")
  }
}
