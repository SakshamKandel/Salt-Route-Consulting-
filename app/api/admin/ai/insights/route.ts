import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { generateInsights } from "@/lib/ai/insights"
import { safeErrorResponse } from "@/lib/security"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const result = await generateInsights()
    return NextResponse.json(result)
  } catch (error) {
    return safeErrorResponse(error, "GET /api/admin/ai/insights")
  }
}
