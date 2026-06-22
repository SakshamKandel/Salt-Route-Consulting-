import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { suggestField, SUGGESTABLE_FIELDS, isGroqConfigured } from "@/lib/ai/property-ai"
import { safeErrorResponse } from "@/lib/security"

const schema = z.object({
  field: z.enum(SUGGESTABLE_FIELDS as [string, ...string[]]),
  context: z.object({
    title: z.string().max(200).optional(),
    propertyType: z.string().max(60).optional(),
    location: z.string().max(200).optional(),
    description: z.string().max(2000).optional(),
  }).default({}),
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
    const { field, context } = schema.parse(await request.json())
    const text = await suggestField(field, context)
    return NextResponse.json({ text })
  } catch (error) {
    return safeErrorResponse(error, "POST /api/admin/ai/suggest")
  }
}
