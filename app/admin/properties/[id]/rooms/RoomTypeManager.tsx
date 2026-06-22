"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { NumberInput } from "@/components/ui/number-input"
import { Badge } from "@/components/ui/badge"
import { MediaUploader, type UploadedMedia } from "@/components/admin/media-uploader"
import { upsertRoomTypeAction, deleteRoomTypeAction, type RoomTypeInput } from "./actions"
import { formatNpr } from "@/lib/currency"
import { BedDouble, Bath, Users, Plus, Pencil, Trash2, X, DoorOpen, ImageIcon } from "lucide-react"
import { roomTypeSuggestionsFor } from "@/lib/room-type-suggestions"

export type RoomTypeRow = {
  id: string
  name: string
  classType: string
  description: string | null
  totalUnits: number
  pricePerNight: number
  maxGuests: number
  bedrooms: number
  bathrooms: number
  sizeSqm: number | null
  bedType: string | null
  amenities: string[]
  imageUrl: string | null
  images: string[]
  active: boolean
}

type FormState = {
  name: string
  classType: string
  description: string
  totalUnits: number
  pricePerNight: number
  maxGuests: number
  bedrooms: number
  bathrooms: number
  sizeSqm: number
  bedType: string
  amenitiesText: string
  images: string[]
  active: boolean
}

const emptyForm: FormState = {
  name: "",
  classType: "",
  description: "",
  totalUnits: 1,
  pricePerNight: 100,
  maxGuests: 2,
  bedrooms: 1,
  bathrooms: 1,
  sizeSqm: 0,
  bedType: "",
  amenitiesText: "",
  images: [],
  active: true,
}

function toForm(rt: RoomTypeRow): FormState {
  return {
    name: rt.name,
    classType: rt.classType,
    description: rt.description ?? "",
    totalUnits: rt.totalUnits,
    pricePerNight: rt.pricePerNight,
    maxGuests: rt.maxGuests,
    bedrooms: rt.bedrooms,
    bathrooms: rt.bathrooms,
    sizeSqm: rt.sizeSqm ?? 0,
    bedType: rt.bedType ?? "",
    amenitiesText: rt.amenities.join("\n"),
    images: rt.images?.length ? rt.images : (rt.imageUrl ? [rt.imageUrl] : []),
    active: rt.active,
  }
}

function parseList(value: string) {
  const seen = new Set<string>()
  const items: string[] = []
  for (const line of value.split(/\r?\n/)) {
    const item = line.trim().replace(/\s+/g, " ")
    if (!item || seen.has(item.toLowerCase())) continue
    seen.add(item.toLowerCase())
    items.push(item)
    if (items.length >= 40) break
  }
  return items
}

export function RoomTypeManager({
  propertyId,
  initial,
  propertyType,
}: {
  propertyId: string
  initial: RoomTypeRow[]
  propertyType?: string | null
}) {
  const suggestions = roomTypeSuggestionsFor(propertyType)
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

  const startEdit = (rt: RoomTypeRow) => {
    setForm(toForm(rt))
    setEditingId(rt.id)
    setShowForm(true)
    setMessage(null)
  }

  const handleSave = async () => {
    setPending("save")
    setMessage(null)
    const payload: RoomTypeInput = {
      name: form.name.trim() || form.classType.trim(),
      classType: form.classType.trim(),
      description: form.description || undefined,
      totalUnits: form.totalUnits,
      pricePerNight: form.pricePerNight,
      maxGuests: form.maxGuests,
      bedrooms: form.bedrooms,
      bathrooms: form.bathrooms,
      sizeSqm: form.sizeSqm > 0 ? form.sizeSqm : null,
      bedType: form.bedType || undefined,
      amenities: parseList(form.amenitiesText),
      images: form.images,
      imageUrl: form.images[0] || "",
      active: form.active,
    }
    const res = await upsertRoomTypeAction(propertyId, payload, editingId ?? undefined)
    if (res.error) {
      setMessage({ type: "error", text: res.error })
    } else {
      const reassignedNote = res.reassigned
        ? ` ${res.reassigned} existing booking(s) without a class were automatically assigned to it.`
        : ""
      setMessage({ type: "success", text: (editingId ? "Room class updated." : "Room class created.") + reassignedNote })
      setShowForm(false)
      setEditingId(null)
      router.refresh()
    }
    setPending(null)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete room class "${name}"? This cannot be undone.`)) return
    setPending(id)
    const res = await deleteRoomTypeAction(propertyId, id)
    if (res.error) {
      setMessage({ type: "error", text: res.error })
    } else {
      setMessage({ type: "success", text: "Room class deleted." })
      router.refresh()
    }
    setPending(null)
  }

  const handleImageUpload = (item: UploadedMedia) => setForm((prev) => ({ ...prev, images: [...prev.images, item.url] }))
  const removeImage = (url: string) => setForm((prev) => ({ ...prev, images: prev.images.filter((u) => u !== url) }))

  return (
    <div className="space-y-6">
      {message && (
        <div className={`rounded-lg p-3 text-sm ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
          {message.text}
        </div>
      )}

      {!showForm && (
        <Button onClick={startCreate} className="bg-navy text-cream">
          <Plus className="w-4 h-4 mr-2" /> Add Room Class
        </Button>
      )}

      {showForm && (
        <div className="bg-white border rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-navy text-lg">{editingId ? "Edit Room Class" : "New Room Class"}</h3>
            <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setEditingId(null) }}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="rt-class">Room Type</Label>
              <Input
                id="rt-class"
                list="room-type-suggestions"
                value={form.classType}
                onChange={(e) => set("classType", e.target.value)}
                placeholder="Type anything: Normal Room, Deluxe Room, Junior Suite..."
                className="mt-1"
              />
              <datalist id="room-type-suggestions">
                {suggestions.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              <p className="text-[11px] text-slate-400 mt-1">Free text — not a fixed list. Suggestions appear as you type.</p>
            </div>
            <div>
              <Label htmlFor="rt-name">Display Name</Label>
              <Input id="rt-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Deluxe Room — Lake Wing, Garden Villa" className="mt-1" />
              <p className="text-[11px] text-slate-400 mt-1">What guests see. Can be the same as the room type.</p>
            </div>
          </div>

          <div>
            <Label htmlFor="rt-desc">Description</Label>
            <Textarea id="rt-desc" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What makes this room class special..." className="mt-1 min-h-[80px]" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <Label>Units Available</Label>
              <NumberInput min={1} step={1} value={form.totalUnits} onChange={(v) => set("totalUnits", v)} />
              <p className="text-[11px] text-slate-400 mt-1">How many identical rooms/villas of this class exist.</p>
            </div>
            <div>
              <Label>Price / Night (NPR)</Label>
              <NumberInput min={1} step={1} value={form.pricePerNight} onChange={(v) => set("pricePerNight", v)} />
            </div>
            <div>
              <Label>Max Guests</Label>
              <NumberInput min={1} step={1} value={form.maxGuests} onChange={(v) => set("maxGuests", v)} />
            </div>
            <div>
              <Label>Bedrooms</Label>
              <NumberInput min={0} step={1} value={form.bedrooms} onChange={(v) => set("bedrooms", v)} />
            </div>
            <div>
              <Label>Bathrooms</Label>
              <NumberInput min={0} step={1} value={form.bathrooms} onChange={(v) => set("bathrooms", v)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="rt-bed">Bed Setup (optional)</Label>
              <Input id="rt-bed" value={form.bedType} onChange={(e) => set("bedType", e.target.value)} placeholder="e.g. 1 King Bed, 2 Queen Beds + Sofa Bed" className="mt-1" />
            </div>
            <div>
              <Label>Size in m² (optional, 0 = not shown)</Label>
              <NumberInput min={0} step={1} value={form.sizeSqm} onChange={(v) => set("sizeSqm", v)} />
            </div>
          </div>

          <div>
            <Label htmlFor="rt-amenities">Class Amenities (one per line)</Label>
            <Textarea id="rt-amenities" value={form.amenitiesText} onChange={(e) => set("amenitiesText", e.target.value)} placeholder={"King bed\nPrivate balcony\nBathtub"} className="mt-1 min-h-[80px]" />
          </div>

          <div className="space-y-2">
            <Label>Class Photos</Label>
            <p className="text-[11px] text-slate-400">First photo is the cover; guests can view the whole gallery on the public page.</p>
            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.images.map((url, i) => (
                  <div key={url} className="relative group/photo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="Room class" className="h-24 w-36 object-cover rounded-lg border" />
                    {i === 0 && <span className="absolute bottom-0 left-0 bg-navy/80 text-white text-[8px] px-1.5 py-0.5 rounded-tr">Cover</span>}
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/photo:opacity-100 transition-opacity"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <MediaUploader onAdd={handleImageUpload} kind="image" multiple maxFiles={20} label="Add Photos" />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="rt-active"
              type="checkbox"
              checked={form.active}
              onChange={(e) => set("active", e.target.checked)}
              className="h-4 w-4 accent-[#1a2b4a]"
            />
            <Label htmlFor="rt-active" className="cursor-pointer">Active (bookable by guests)</Label>
          </div>

          <Button onClick={handleSave} disabled={pending === "save" || !form.classType.trim()} className="bg-navy text-cream w-full">
            {pending === "save" ? "Saving..." : editingId ? "Update Room Class" : "Create Room Class"}
          </Button>
        </div>
      )}

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2">
          <DoorOpen size={18} className="text-navy" />
          <h3 className="font-semibold text-navy">{initial.length} Room Class{initial.length === 1 ? "" : "es"}</h3>
        </div>
        {initial.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-1">
            <p>No room classes yet. The property books as a single unit.</p>
            <p className="text-xs">Add classes (Suite, Deluxe, Villa...) when this property has multiple bookable rooms or units.</p>
          </div>
        ) : (
          <div className="divide-y">
            {initial.map((rt) => (
              <div key={rt.id} className="flex items-center gap-4 px-5 py-4">
                <div className="h-16 w-24 shrink-0 rounded-lg border bg-slate-50 overflow-hidden flex items-center justify-center">
                  {rt.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={rt.imageUrl} alt={rt.name} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-navy truncate">{rt.name}</p>
                    <Badge variant="secondary">{rt.classType}</Badge>
                    {!rt.active && <Badge variant="outline" className="text-red-500 border-red-200">Inactive</Badge>}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 flex-wrap">
                    <span className="font-medium text-navy">{formatNpr(rt.pricePerNight)}/night</span>
                    <span className="flex items-center gap-1"><DoorOpen className="w-3 h-3" /> {rt.totalUnits} unit{rt.totalUnits === 1 ? "" : "s"}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {rt.maxGuests}</span>
                    <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" /> {rt.bedrooms}</span>
                    <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {rt.bathrooms}</span>
                    {rt.sizeSqm ? <span>{rt.sizeSqm} m²</span> : null}
                    {rt.bedType ? <span className="truncate max-w-[160px]">{rt.bedType}</span> : null}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(rt)} className="h-8 w-8 text-navy">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(rt.id, rt.name)}
                    disabled={pending === rt.id}
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
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
