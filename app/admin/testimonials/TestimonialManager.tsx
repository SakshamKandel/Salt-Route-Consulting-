"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import {
  Check,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Quote,
  Star,
  Trash2,
  X,
} from "lucide-react"
import {
  deleteTestimonialAction,
  toggleTestimonialPublishedAction,
  upsertTestimonialAction,
  type TestimonialInput,
} from "./actions"

export type TestimonialRow = {
  id: string
  quote: string
  name: string
  role: string | null
  source: string | null
  kind: "DIPLOMATIC" | "VERIFIED"
  rating: number
  location: string | null
  featured: boolean
  published: boolean
  order: number
}

const EMPTY: TestimonialInput = {
  quote: "",
  name: "",
  role: "",
  source: "",
  kind: "VERIFIED",
  rating: 5,
  location: "",
  featured: false,
  published: true,
  order: 0,
}

const inputClass =
  "mt-1.5 min-h-10 w-full rounded-lg border border-[#1B3A5C]/12 bg-white px-3 py-2 text-[13px] text-[#1B3A5C] outline-none transition-colors placeholder:text-[#1B3A5C]/30 focus:border-[#C9A96E]"

const labelClass = "block text-[10px] font-medium uppercase tracking-[0.18em] text-[#1B3A5C]/45"

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < rating ? "fill-[#C9A96E] text-[#C9A96E]" : "text-[#1B3A5C]/15"}`}
        />
      ))}
    </div>
  )
}

export default function TestimonialManager({ initial }: { initial: TestimonialRow[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<TestimonialRow | "new" | null>(null)
  const [form, setForm] = useState<TestimonialInput>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [saving, startSaving] = useTransition()

  function openNew() {
    setForm(EMPTY)
    setEditing("new")
    setError(null)
  }

  function openEdit(row: TestimonialRow) {
    setForm({
      quote: row.quote,
      name: row.name,
      role: row.role ?? "",
      source: row.source ?? "",
      kind: row.kind,
      rating: row.rating,
      location: row.location ?? "",
      featured: row.featured,
      published: row.published,
      order: row.order,
    })
    setEditing(row)
    setError(null)
  }

  function handleSave() {
    setError(null)
    startSaving(async () => {
      const result = await upsertTestimonialAction(form, editing === "new" ? undefined : editing?.id)
      if (!result.success) {
        setError(result.error)
        return
      }
      setEditing(null)
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    startSaving(async () => {
      await deleteTestimonialAction(id)
      if (editing !== "new" && editing?.id === id) setEditing(null)
      router.refresh()
    })
  }

  function handleToggle(id: string) {
    startSaving(async () => {
      await toggleTestimonialPublishedAction(id)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-[#1B3A5C] md:text-3xl">
            Guestbook
          </h1>
          <p className="mt-1.5 max-w-2xl text-[12.5px] text-[#1B3A5C]/45">
            Curated reflections shown on the homepage and the owner partnership page. Entries are
            deliberately word-only — no guest photography is stored or displayed.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#1B3A5C] px-4 py-2.5 text-[12px] font-medium text-[#FFFAF3] transition-colors hover:bg-[#2A4F7A]"
        >
          <Plus className="h-3.5 w-3.5" />
          New entry
        </button>
      </div>

      {/* ── EDITOR ── */}
      {editing && (
        <div className="rounded-2xl border border-[#C9A96E]/30 bg-[#FFFAF3] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-[#1B3A5C]">
              {editing === "new" ? "New guestbook entry" : `Edit · ${editing.name}`}
            </h2>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="text-[#1B3A5C]/35 transition-colors hover:text-[#1B3A5C]"
              aria-label="Close editor"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className={labelClass}>Quote *</span>
              <textarea
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
                rows={3}
                maxLength={1200}
                placeholder="What the guest said about their stay…"
                className={`${inputClass} resize-y leading-relaxed`}
              />
            </label>

            <label>
              <span className={labelClass}>Name *</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
                placeholder="e.g. Dr. Swarnim Wagle"
              />
            </label>

            <label>
              <span className={labelClass}>Role / title</span>
              <input
                value={form.role ?? ""}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className={inputClass}
                placeholder="e.g. Economist & Member of Parliament"
              />
            </label>

            <label>
              <span className={labelClass}>Kind</span>
              <select
                value={form.kind}
                onChange={(e) =>
                  setForm({ ...form, kind: e.target.value as TestimonialInput["kind"] })
                }
                className={inputClass}
              >
                <option value="DIPLOMATIC">Diplomatic guestbook</option>
                <option value="VERIFIED">Verified traveller review</option>
              </select>
            </label>

            <label>
              <span className={labelClass}>Source label</span>
              <input
                value={form.source ?? ""}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className={inputClass}
                placeholder="e.g. Verified Google Review"
              />
            </label>

            <label>
              <span className={labelClass}>Rating</span>
              <select
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className={inputClass}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} star{n === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className={labelClass}>Sort order</span>
              <input
                type="number"
                min={0}
                max={999}
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 0 })}
                className={inputClass}
              />
            </label>

            <label className="flex items-center gap-2.5 self-end pb-2.5 text-[12.5px] text-[#1B3A5C]/70">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="h-4 w-4 accent-[#C9A96E]"
              />
              Feature on the owner page
            </label>

            <label className="flex items-center gap-2.5 self-end pb-2.5 text-[12.5px] text-[#1B3A5C]/70">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="h-4 w-4 accent-[#C9A96E]"
              />
              Published
            </label>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#1B3A5C] px-6 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#FFFAF3] transition-colors hover:bg-[#2A4F7A] disabled:opacity-55"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editing === "new" ? "Create entry" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="inline-flex min-h-11 items-center rounded-lg border border-[#1B3A5C]/15 px-6 text-[12px] font-medium text-[#1B3A5C] transition-colors hover:border-[#1B3A5C]/30"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── LIST ── */}
      {initial.length === 0 ? (
        <div className="rounded-2xl border border-[#1B3A5C]/8 bg-[#FFFAF3] py-16 text-center">
          <Quote className="mx-auto mb-3 h-6 w-6 text-[#1B3A5C]/15" />
          <p className="text-[13px] text-[#1B3A5C]/35">No guestbook entries yet</p>
          <p className="mt-1 text-[11px] text-[#1B3A5C]/25">
            Run <code className="font-mono">npx tsx scripts/seed-testimonials.ts</code> to load the
            starting set
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {initial.map((row) => (
            <div
              key={row.id}
              className={`rounded-2xl border bg-[#FFFAF3] p-5 ${
                row.published ? "border-[#1B3A5C]/8" : "border-[#1B3A5C]/8 opacity-60"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] ring-1 ${
                        row.kind === "DIPLOMATIC"
                          ? "bg-[#C9A96E]/10 text-[#A8863F] ring-[#C9A96E]/30"
                          : "bg-emerald-50 text-emerald-600 ring-emerald-200/60"
                      }`}
                    >
                      {row.kind === "DIPLOMATIC" ? "Diplomatic" : "Verified"}
                    </span>
                    {row.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#1B3A5C]/5 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#1B3A5C]/50 ring-1 ring-[#1B3A5C]/10">
                        <Star className="h-2.5 w-2.5" />
                        Featured
                      </span>
                    )}
                    {!row.published && (
                      <span className="rounded-full bg-[#1B3A5C]/5 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#1B3A5C]/40">
                        Hidden
                      </span>
                    )}
                    <Stars rating={row.rating} />
                  </div>

                  <p className="font-display text-[15px] italic leading-relaxed text-[#1B3A5C]/75">
                    &ldquo;{row.quote}&rdquo;
                  </p>
                  <p className="mt-2.5 text-[12px] text-[#1B3A5C]/50">
                    <strong className="text-[#1B3A5C]/70">{row.name}</strong>
                    {row.role ? ` · ${row.role}` : ""}
                    {row.source ? ` · ${row.source}` : ""}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggle(row.id)}
                    disabled={saving}
                    title={row.published ? "Hide from site" : "Show on site"}
                    className="rounded-lg border border-[#1B3A5C]/12 p-2 text-[#1B3A5C]/45 transition-colors hover:border-[#C9A96E]/40 hover:text-[#1B3A5C] disabled:opacity-50"
                  >
                    {row.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    title="Edit"
                    className="rounded-lg border border-[#1B3A5C]/12 p-2 text-[#1B3A5C]/45 transition-colors hover:border-[#C9A96E]/40 hover:text-[#1B3A5C]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(row.id)}
                    disabled={saving}
                    title="Delete"
                    className="rounded-lg border border-[#1B3A5C]/12 p-2 text-[#1B3A5C]/45 transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {initial.length > 0 && (
        <p className="flex items-center gap-2 text-[11.5px] text-[#1B3A5C]/35">
          <Check className="h-3.5 w-3.5 text-emerald-600" />
          {initial.filter((r) => r.published).length} of {initial.length} entries are visible on the
          public site.
        </p>
      )}
    </div>
  )
}
