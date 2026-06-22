import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { groqJson, isGroqConfigured } from "@/lib/ai/groq"
import { safeErrorResponse } from "@/lib/security"

const schema = z.object({
  answers: z.record(z.string(), z.string().max(2000)),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!isGroqConfigured()) {
    return NextResponse.json({ error: "AI is not configured. Add GROQ_API_KEY." }, { status: 503 })
  }

  try {
    const { answers } = schema.parse(await request.json())

    const ctx = Object.entries(answers)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n")

    const data = await groqJson<{
      title?: string
      slug?: string
      propertyType?: string
      description?: string
      tagline?: string
      story?: string
      neighborhood?: string
      hostNote?: string
      highlights?: string[]
      amenities?: string[]
      services?: string[]
      whatToExpect?: string[]
      rules?: string[]
      highlightsTitle?: string
      amenitiesTitle?: string
      maxGuests?: number
      roomTypes?: {
        name: string
        classType: string
        pricePerNight: number
        maxGuests: number
        totalUnits: number
        bedrooms: number
        bathrooms: number
      }[]
    }>(
      [
        {
          role: "system",
          content:
            "You are a luxury hospitality copywriter for Salt Route Group, a Nepal-based boutique stays brand. Based on the owner's simple answers, generate polished, tasteful property content. Use easy, natural language. Never use emojis or markdown. Return valid JSON with these exact keys: title, slug (kebab-case), propertyType, description (2-3 sentences), tagline (max 12 words), story (3-4 sentences), neighborhood (2-3 sentences), hostNote (2 sentences, warm), highlights (array of 5-6 short phrases), amenities (array of 6-8 items), services (array of 5-6 items), whatToExpect (array of 5 short feature chips), rules (array of 4-5 house rules), highlightsTitle, amenitiesTitle, maxGuests (total guest capacity number). Also include roomTypes (array of objects, each with: name, classType, pricePerNight in NPR as number, maxGuests as number, totalUnits as number, bedrooms as number, bathrooms as number). Derive room types and pricing from the owner's roomTypes and capacity answers. Use English.",
        },
        {
          role: "user",
          content: `Property owner answers:\n${ctx}\n\nReturn JSON with all fields filled including roomTypes and maxGuests.`,
        },
      ],
      { temperature: 0.75, maxTokens: 1600 }
    )

    return NextResponse.json({ fields: data })
  } catch (error) {
    return safeErrorResponse(error, "POST /api/admin/ai/property-compose")
  }
}
