"use client"

import { useState } from "react"
import { Sparkles, Loader2 } from "lucide-react"

type Ctx = { title?: string; propertyType?: string; location?: string; description?: string }

export function AiSuggestButton({
  field,
  getContext,
  onResult,
  label = "Suggest",
}: {
  field: string
  getContext: () => Ctx
  onResult: (text: string) => void
  label?: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, context: getContext() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      if (data.text) onResult(data.text as string)
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={loading}
      title={error || "Generate with AI"}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
        error
          ? "border-red-200 text-red-500 bg-red-50"
          : "border-[#C9A96E]/40 text-[#1B3A5C] bg-[#C9A96E]/10 hover:bg-[#C9A96E]/20"
      } disabled:opacity-60`}
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 text-[#C9A96E]" />}
      {loading ? "Writing…" : error ? "Retry" : label}
    </button>
  )
}
