import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { groqChat, isGroqConfigured } from "@/lib/ai/groq"
import { safeErrorResponse } from "@/lib/security"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!isGroqConfigured()) {
    return NextResponse.json({ error: "AI not configured" }, { status: 503 })
  }

  try {
    const { history, currentQuestion, userAnswer, step, totalSteps } = await request.json()

    const ctx = history.map((m: { role: string; text: string }) => `${m.role}: ${m.text}`).join("\n")

    const systemPrompt = `You are Salt Route AI, a warm, witty, and helpful property creation assistant for a Nepal-based boutique stays brand. You are chatting with a property owner who is filling out a listing form.

Current question (${step + 1} of ${totalSteps}): "${currentQuestion}"
User just answered: "${userAnswer}"

Your job is to respond naturally like a human concierge:
1. Acknowledge their answer genuinely (use their actual words)
2. If their answer seems off-topic, too short, or unclear, gently guide them back — NEVER be robotic
3. If their answer is good, enthusiastically build on it and lead into the next question
4. Occasionally share what you're "imagining" for their property based on what they've told you so far
5. Keep it to 1-2 short paragraphs max
6. NEVER use markdown, bullet points, or emojis
7. End with the next question ONLY if this isn't the last step

Previous conversation context:
${ctx.slice(-800)}`

    const text = await groqChat(
      [{ role: "system", content: systemPrompt }, { role: "user", content: userAnswer }],
      { temperature: 0.85, maxTokens: 250 }
    )

    return NextResponse.json({ reply: text.trim() })
  } catch (error) {
    return safeErrorResponse(error, "POST /api/admin/ai/chat")
  }
}
