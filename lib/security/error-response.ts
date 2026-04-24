import { NextResponse } from "next/server"
import { ZodError } from "zod"

/**
 * 10.9 — Generic error responses.
 *
 * Client always sees "Something went wrong"; the real detail
 * is logged server-side only.  Also handles Zod validation errors
 * with a 400 containing safe field-level messages.
 */

export function safeErrorResponse(error: unknown, context?: string): NextResponse {
  // ─── Zod validation → 400 with field-level messages ──────
  if (error instanceof ZodError) {
    const fieldErrors = error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }))
    return NextResponse.json(
      { error: "Validation failed", details: fieldErrors },
      { status: 400 }
    )
  }

  // ─── Everything else → 500 with generic message ──────────
  const label = context ? `[${context}]` : "[API]"
  console.error(label, error)

  return NextResponse.json(
    { error: "Something went wrong. Please try again later." },
    { status: 500 }
  )
}
