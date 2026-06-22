"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MediaUploader, type UploadedMedia } from "@/components/admin/media-uploader"
import { upsertSectionAction, deleteSectionAction, moveSectionAction, type SectionInput } from "./actions"
import { Plus, Pencil, Trash2, X, ArrowUp, ArrowDown, LayoutList, ImageIcon } from "lucide-react"

export type SectionRow = {
  id: string
  title: string
  subtitle: string | null
  body: string
  imageUrl: string | null
  order: number
}

type FormState = {
  title: string
  subtitle: string
  body: string
  imageUrl: string
}

const emptyForm: FormState = { title: "", subtitle: "", body: "", imageUrl: "" }

export function SectionManager({
  propertyId,
  initial,
}: {
  propertyId: string
  initial: SectionRow[]
}) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [pending, setPending] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const startCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
    setMessage(null)
  }

  const startEdit = (s: SectionRow) => {
    setForm({ title: s.title, subtitle: s.subtitle ?? "", body: s.body, imageUrl: s.imageUrl ?? "" })
    setEditingId(s.id)
    setShowForm(true)
    setMessage(null)
  }

  const handleSave = async () => {
    setPending("save")
    setMessage(null)
    const payload: SectionInput = {
      title: form.title,
      subtitle: form.subtitle || undefined,
      body: form.body,
      imageUrl: form.imageUrl || "",
    }
    const res = await upsertSectionAction(propertyId, payload, editingId ?? undefined)
    if (res.error) {
      setMessage({ type: "error", text: res.error })
    } else {
      setMessage({ type: "success", text: editingId ? "Section updated." : "Section added." })
      setShowForm(false)
      setEditingId(null)
      router.refresh()
    }
    setPending(null)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete section "${title}"?`)) return
    setPending(id)
    const res = await deleteSectionAction(propertyId, id)
    if (res.error) setMessage({ type: "error", text: res.error })
    else router.refresh()
    setPending(null)
  }

  const handleMove = async (id: string, direction: "up" | "down") => {
    setPending(id)
    const res = await moveSectionAction(propertyId, id, direction)
    if (res.error) setMessage({ type: "error", text: res.error })
    else router.refresh()
    setPending(null)
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`rounded-lg p-3 text-sm ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
          {message.text}
        </div>
      )}

      {!showForm && (
        <Button onClick={startCreate} className="bg-navy text-cream">
          <Plus className="w-4 h-4 mr-2" /> Add Story Section
        </Button>
      )}

      {showForm && (
        <div className="bg-white border rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-navy text-lg">{editingId ? "Edit Section" : "New Section"}</h3>
            <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setEditingId(null) }}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="sec-title">Title</Label>
              <Input id="sec-title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. The Garden, Dining Experience, Our Story" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="sec-subtitle">Eyebrow / Subtitle (optional)</Label>
              <Input id="sec-subtitle" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="e.g. Curated Experiences" className="mt-1" />
            </div>
          </div>

          <div>
            <Label htmlFor="sec-body">Body</Label>
            <Textarea id="sec-body" value={form.body} onChange={(e) => set("body", e.target.value)} placeholder="Write the story for this section. Blank lines create new paragraphs." className="mt-1 min-h-[160px]" />
          </div>

          <div className="space-y-2">
            <Label>Section Image (optional)</Label>
            {form.imageUrl ? (
              <div className="flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imageUrl} alt="Section" className="h-28 w-44 object-cover rounded-lg border" />
                <Button variant="outline" size="sm" onClick={() => set("imageUrl", "")}>
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Remove
                </Button>
              </div>
            ) : (
              <MediaUploader onAdd={(item: UploadedMedia) => set("imageUrl", item.url)} kind="image" maxFiles={1} />
            )}
          </div>

          <Button onClick={handleSave} disabled={pending === "save" || !form.title.trim() || form.body.trim().length < 10} className="bg-navy text-cream w-full">
            {pending === "save" ? "Saving..." : editingId ? "Update Section" : "Add Section"}
          </Button>
        </div>
      )}

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2">
          <LayoutList size={18} className="text-navy" />
          <h3 className="font-semibold text-navy">{initial.length} Section{initial.length === 1 ? "" : "s"}</h3>
        </div>
        {initial.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-1">
            <p>No story sections yet.</p>
            <p className="text-xs">Add editorial sections (the view, dining, the host&apos;s story...) to make the public page feel richer.</p>
          </div>
        ) : (
          <div className="divide-y">
            {initial.map((s, idx) => (
              <div key={s.id} className="flex items-start gap-4 px-5 py-4">
                <div className="h-16 w-24 shrink-0 rounded-lg border bg-slate-50 overflow-hidden flex items-center justify-center">
                  {s.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.imageUrl} alt={s.title} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {s.subtitle && <p className="text-[11px] uppercase tracking-wide text-slate-400">{s.subtitle}</p>}
                  <p className="font-semibold text-navy truncate">{s.title}</p>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{s.body}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" disabled={idx === 0 || pending === s.id} onClick={() => handleMove(s.id, "up")} className="h-8 w-8 text-slate-500">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" disabled={idx === initial.length - 1 || pending === s.id} onClick={() => handleMove(s.id, "down")} className="h-8 w-8 text-slate-500">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => startEdit(s)} className="h-8 w-8 text-navy">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id, s.title)} disabled={pending === s.id} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
