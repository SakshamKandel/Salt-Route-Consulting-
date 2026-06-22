"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NumberInput } from "@/components/ui/number-input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { upsertPropertyAction } from "./actions"
import { PropertyStatus } from "@prisma/client"
import { Film, Image as ImageIcon, Sparkles, Trash2, Home, DoorOpen, Plus, PenLine, Clapperboard, Check } from "lucide-react"
import { isVideoUrl } from "@/lib/property-media"
import { ICON_REGISTRY } from "@/lib/feature-icons"
import { MediaUploader, type UploadedMedia } from "@/components/admin/media-uploader"
import { PropertyFormPreview } from "@/components/admin/property-form-preview"
import type { PropertyDetail } from "@/components/public/PropertyDetailClient"
import { PROPERTY_TYPE_SUGGESTIONS, roomTypeSuggestionsFor, inventoryHintFor } from "@/lib/room-type-suggestions"
import { PropertyAiAssistant } from "@/components/admin/property-ai-assistant"

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must use lowercase letters, numbers, and hyphens only"),
  propertyType: z.string().trim().min(2, "Property type is required").max(60),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(3, "Location is required"),
  address: z.string().optional(),
  bedrooms: z.number({ error: "Enter a number" }).int().min(0),
  bathrooms: z.number({ error: "Enter a number" }).int().min(0),
  maxGuests: z.number({ error: "Enter a number" }).int().min(1, "At least 1 guest"),
  pricePerNight: z.number({ error: "Enter a price" }).positive("Price must be greater than 0"),
  totalUnits: z.number({ error: "Enter a number" }).int().min(1, "At least 1 unit"),
  checkInTime: z.string().max(40).optional(),
  checkOutTime: z.string().max(40).optional(),
  highlightsText: z.string().max(4000, "Features list is too long").optional(),
  amenitiesText: z.string().max(8000, "Amenities list is too long").optional(),
  rulesText: z.string().max(4000, "House rules list is too long").optional(),
  servicesText: z.string().max(4000, "Services list is too long").optional(),
  whatToExpect: z.array(z.string().min(1).max(160)).max(20).default([]),
  highlightsTitle: z.string().max(80).optional(),
  amenitiesTitle: z.string().max(80).optional(),
  tagline: z.string().max(200, "Tagline is too long").optional(),
  story: z.string().max(5000, "Story is too long").optional(),
  neighborhood: z.string().max(3000, "Neighborhood description is too long").optional(),
  hostNote: z.string().max(2000, "Host note is too long").optional(),
  status: z.nativeEnum(PropertyStatus),
  ownerId: z.string().min(1, "Pick an owner"),
})

type PropertyFormValues = z.infer<typeof schema>

export type RoomTypeDraft = {
  id?: string
  classType: string
  name: string
  totalUnits: number
  pricePerNight: number
  maxGuests: number
  bedrooms: number
  bathrooms: number
  imageUrl?: string
  images?: string[]
}

export type StayDetailRow = { label: string; value: string }
export type GettingHereRow = { time: string; from: string; distance?: string }

type PropertyFormInitialData = Omit<
  Partial<PropertyFormValues>,
  "address" | "pricePerNight" | "tagline" | "story" | "neighborhood" | "hostNote" | "checkInTime" | "checkOutTime" | "highlightsTitle" | "amenitiesTitle"
> & {
  id?: string
  address?: string | null
  pricePerNight?: number | { toString(): string } | null
  highlights?: string[] | null
  amenities?: string[] | null
  rules?: string[] | null
  services?: string[] | null
  whatToExpect?: string[] | null
  tagline?: string | null
  story?: string | null
  neighborhood?: string | null
  hostNote?: string | null
  highlightsTitle?: string | null
  amenitiesTitle?: string | null
  stayDetails?: StayDetailRow[] | null
  gettingHere?: GettingHereRow[] | null
  checkInTime?: string | null
  checkOutTime?: string | null
  roomTypes?: RoomTypeDraft[]
  sections?: { id: string; title: string; subtitle?: string | null; body: string; imageUrl?: string | null }[] | null
}

type PropertyMediaDraft = UploadedMedia

function listToText(items?: string[] | null) {
  return (items ?? []).join("\n")
}

function parseBulkList(value?: string, maxItems = 80) {
  const seen = new Set<string>()
  const items: string[] = []

  for (const line of (value ?? "").split(/\r?\n/)) {
    const item = line.trim().replace(/\s+/g, " ")
    const key = item.toLowerCase()
    if (!item || seen.has(key)) continue
    seen.add(key)
    items.push(item)
    if (items.length >= maxItems) break
  }

  return items
}

function SectionCard({
  step,
  icon: Icon,
  title,
  description,
  children,
}: {
  step: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-navy shadow-sm">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h3 className="font-semibold text-navy">
            <span className="text-slate-400 mr-2">{step}.</span>
            {title}
          </h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function AiSuggestButton({ field, onSuggestion, context }: { field: string; onSuggestion: (text: string) => void; context?: { title?: string; propertyType?: string; location?: string; description?: string } }) {
  const [loading, setLoading] = useState(false)
  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, context }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      onSuggestion(data.text)
    } catch (e) {
      alert(e instanceof Error ? e.message : "AI suggestion failed")
    } finally {
      setLoading(false)
    }
  }
  return (
    <button type="button" onClick={handleClick} disabled={loading} className="inline-flex items-center gap-1 text-[10px] font-medium text-[#C9A96E] hover:text-[#1B3A5C] transition-colors disabled:opacity-50">
      <Sparkles className={`h-3 w-3 ${loading ? "animate-pulse" : ""}`} />
      {loading ? "Thinking…" : "AI suggest"}
    </button>
  )
}

function BulkListTextarea({
  label,
  description,
  value,
  onChange,
  placeholder,
  minHeight = "min-h-[120px]",
  maxItems = 80,
  aiField,
  aiContext,
}: {
  label: string
  description: string
  value?: string
  onChange: (value: string) => void
  placeholder: string
  minHeight?: string
  maxItems?: number
  aiField?: string
  aiContext?: { title?: string; propertyType?: string; location?: string; description?: string }
}) {
  const count = parseBulkList(value, maxItems).length

  return (
    <FormItem>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FormLabel>{label}</FormLabel>
            {aiField && <AiSuggestButton field={aiField} onSuggestion={onChange} context={aiContext} />}
          </div>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <span className="text-xs font-medium text-slate-400">{count} added</span>
      </div>
      <FormControl>
        <Textarea
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`${minHeight} resize-y leading-7`}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}

export function PropertyForm({
  owners,
  initialData,
  knownLocations = [],
  availableFeatures = [],
}: {
  owners: { id: string, name: string | null, email: string }[];
  initialData?: PropertyFormInitialData;
  knownLocations?: string[];
  availableFeatures?: { id: string; name: string; iconKey: string }[];
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [media, setMedia] = useState<PropertyMediaDraft[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomTypeDraft[]>(initialData?.roomTypes ?? [])
  const [removedRoomTypeIds, setRemovedRoomTypeIds] = useState<string[]>([])
  const [stayDetails, setStayDetails] = useState<StayDetailRow[]>(initialData?.stayDetails ?? [])
  const [gettingHere, setGettingHere] = useState<GettingHereRow[]>(initialData?.gettingHere ?? [])

  const form = useForm<PropertyFormValues>({
    // zodResolver's transformed-output type (from `.default()` on whatToExpect)
    // diverges from PropertyFormValues under RHF's 3-generic Control; pin it so
    // form.control matches the shadcn FormField components. Runtime is unchanged.
    resolver: zodResolver(schema) as unknown as Resolver<PropertyFormValues>,
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      propertyType: initialData?.propertyType || "Hotel",
      description: initialData?.description || "",
      location: initialData?.location || "",
      address: initialData?.address || "",
      bedrooms: initialData?.bedrooms ?? 1,
      bathrooms: initialData?.bathrooms ?? 1,
      maxGuests: initialData?.maxGuests ?? 2,
      pricePerNight: initialData?.pricePerNight ? Number(initialData.pricePerNight) : 100,
      totalUnits: initialData?.totalUnits ?? 1,
      checkInTime: initialData?.checkInTime || "",
      checkOutTime: initialData?.checkOutTime || "",
      highlightsText: listToText(initialData?.highlights),
      amenitiesText: listToText(initialData?.amenities),
      rulesText: listToText(initialData?.rules),
      servicesText: listToText(initialData?.services),
      whatToExpect: initialData?.whatToExpect ?? [],
      tagline: initialData?.tagline || "",
      story: initialData?.story || "",
      neighborhood: initialData?.neighborhood || "",
      hostNote: initialData?.hostNote || "",
      highlightsTitle: initialData?.highlightsTitle || "",
      amenitiesTitle: initialData?.amenitiesTitle || "",
      status: initialData?.status || "DRAFT",
      ownerId: initialData?.ownerId || "",
    }
  })

  const addStayDetail = () => setStayDetails((prev) => [...prev, { label: "", value: "" }])
  const updateStayDetail = (i: number, patch: Partial<StayDetailRow>) =>
    setStayDetails((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  const removeStayDetail = (i: number) => setStayDetails((prev) => prev.filter((_, idx) => idx !== i))

  const addGettingHere = () => setGettingHere((prev) => [...prev, { time: "", from: "", distance: "" }])
  const updateGettingHere = (i: number, patch: Partial<GettingHereRow>) =>
    setGettingHere((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  const removeGettingHere = (i: number) => setGettingHere((prev) => prev.filter((_, idx) => idx !== i))
  function slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  const basePrice = form.watch("pricePerNight")
  const watchedPropertyType = form.watch("propertyType") || "Hotel"
  const roomSuggestions = roomTypeSuggestionsFor(watchedPropertyType)
  const roomTypeUnitsSum = roomTypes.reduce((sum, rt) => sum + (rt.totalUnits || 0), 0)

  // Build the live preview object from current form values (updates per keystroke).
  const watched = form.watch()

  // Shared context for AI suggestions (updates as the user types).
  const aiContext = {
    title: watched.title || undefined,
    propertyType: watched.propertyType || undefined,
    location: watched.location || undefined,
    description: watched.description || undefined,
  }

  const previewProperty: PropertyDetail = {
    id: initialData?.id ?? "preview",
    title: watched.title || "Your Property Name",
    slug: watched.slug || "preview",
    propertyType: watched.propertyType || "Hotel",
    description: watched.description || "Add a description to see it here.",
    tagline: watched.tagline || null,
    story: watched.story || null,
    neighborhood: watched.neighborhood || null,
    hostNote: watched.hostNote || null,
    location: watched.location || "Location",
    address: watched.address || null,
    maxGuests: watched.maxGuests || 1,
    bedrooms: watched.bedrooms || 0,
    bathrooms: watched.bathrooms || 0,
    pricePerNight: watched.pricePerNight || 0,
    totalUnits: watched.totalUnits || 1,
    checkInTime: watched.checkInTime || null,
    checkOutTime: watched.checkOutTime || null,
    highlightsTitle: watched.highlightsTitle || null,
    amenitiesTitle: watched.amenitiesTitle || null,
    stayDetails: stayDetails.filter((d) => d.label.trim() && d.value.trim()),
    gettingHere: gettingHere.filter((g) => g.time.trim() && g.from.trim()),
    highlights: parseBulkList(watched.highlightsText, 40),
    amenities: parseBulkList(watched.amenitiesText, 80),
    rules: parseBulkList(watched.rulesText, 40),
    services: parseBulkList(watched.servicesText, 40),
    whatToExpect: watched.whatToExpect || [],
    images: media
      .filter((m) => !isVideoUrl(m.url))
      .map((m, i) => ({ id: `m-${i}`, url: m.url, alt: m.alt ?? null, isPrimary: i === 0, isBanner: false, order: i })),
    owner: { name: owners.find((o) => o.id === watched.ownerId)?.name ?? null, image: null },
    roomTypes: roomTypes
      .filter((rt) => rt.classType.trim())
      .map((rt, i) => ({
        id: rt.id ?? `rt-${i}`,
        name: rt.name || rt.classType,
        classType: rt.classType,
        description: null,
        totalUnits: rt.totalUnits,
        pricePerNight: rt.pricePerNight,
        maxGuests: rt.maxGuests,
        bedrooms: rt.bedrooms,
        bathrooms: rt.bathrooms,
        sizeSqm: null,
        bedType: null,
        amenities: [],
        imageUrl: (rt.images && rt.images[0]) || rt.imageUrl || null,
        images: rt.images ?? (rt.imageUrl ? [rt.imageUrl] : []),
      })),
    sections: initialData?.sections ?? [],
    reviews: [],
    _count: { reviews: 0 },
  }

  function addRoomTypeRow() {
    setRoomTypes((prev) => [
      ...prev,
      {
        classType: "",
        name: "",
        totalUnits: 1,
        pricePerNight: Number(basePrice) || 100,
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 1,
        imageUrl: "",
        images: [],
      },
    ])
  }

  function updateRoomTypeRow(index: number, patch: Partial<RoomTypeDraft>) {
    setRoomTypes((prev) => prev.map((rt, i) => (i === index ? { ...rt, ...patch } : rt)))
  }

  function removeRoomTypeRow(index: number) {
    const row = roomTypes[index]
    if (row?.id) setRemovedRoomTypeIds((prev) => [...prev, row.id!])
    setRoomTypes((prev) => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(data: PropertyFormValues) {
    const invalidRow = roomTypes.find((rt) => rt.classType.trim().length < 2)
    if (invalidRow) {
      setError("Every room type row needs a type name (e.g. Normal Room, Deluxe Room). Remove empty rows or fill them in.")
      return
    }

    setIsPending(true)
    setError(null)
    const { highlightsText, amenitiesText, rulesText, servicesText, ...propertyData } = data
    const res = await upsertPropertyAction(
      {
        ...propertyData,
        highlights: parseBulkList(highlightsText, 40),
        amenities: parseBulkList(amenitiesText, 80),
        rules: parseBulkList(rulesText, 40),
        services: parseBulkList(servicesText, 40),
        stayDetails: stayDetails.filter((d) => d.label.trim() && d.value.trim()).map((d) => ({ label: d.label.trim(), value: d.value.trim() })),
        gettingHere: gettingHere.filter((g) => g.time.trim() && g.from.trim()).map((g) => ({ time: g.time.trim(), from: g.from.trim(), distance: g.distance?.trim() || undefined })),
        media,
        roomTypes: roomTypes.map((rt) => ({
          ...rt,
          classType: rt.classType.trim(),
          name: rt.name.trim() || rt.classType.trim(),
          images: rt.images ?? [],
        })),
        removedRoomTypeIds,
      },
      initialData?.id
    )
    if (res.error) {
      setError(res.error)
      setIsPending(false)
    } else {
      // Continue to the media page to finish setup.
      router.push(`/admin/properties/${res.id}/images`)
    }
  }

  function handleAddMedia(item: UploadedMedia) {
    setMedia((prev) => [...prev, item])
  }

  function handleAiApply(fields: {
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
  }) {
    if (fields.title) form.setValue("title", fields.title, { shouldValidate: true })
    if (fields.slug) form.setValue("slug", fields.slug, { shouldValidate: true })
    if (fields.propertyType) form.setValue("propertyType", fields.propertyType, { shouldValidate: true })
    if (fields.description) form.setValue("description", fields.description, { shouldValidate: true })
    if (fields.tagline) form.setValue("tagline", fields.tagline, { shouldValidate: true })
    if (fields.story) form.setValue("story", fields.story, { shouldValidate: true })
    if (fields.neighborhood) form.setValue("neighborhood", fields.neighborhood, { shouldValidate: true })
    if (fields.hostNote) form.setValue("hostNote", fields.hostNote, { shouldValidate: true })
    if (fields.highlights?.length) form.setValue("highlightsText", fields.highlights.join("\n"), { shouldValidate: true })
    if (fields.amenities?.length) form.setValue("amenitiesText", fields.amenities.join("\n"), { shouldValidate: true })
    if (fields.services?.length) form.setValue("servicesText", fields.services.join("\n"), { shouldValidate: true })
    if (fields.whatToExpect?.length) form.setValue("whatToExpect", fields.whatToExpect, { shouldValidate: true })
    if (fields.rules?.length) form.setValue("rulesText", fields.rules.join("\n"), { shouldValidate: true })
    if (fields.highlightsTitle) form.setValue("highlightsTitle", fields.highlightsTitle, { shouldValidate: true })
    if (fields.amenitiesTitle) form.setValue("amenitiesTitle", fields.amenitiesTitle, { shouldValidate: true })
    if (typeof fields.maxGuests === "number") form.setValue("maxGuests", fields.maxGuests, { shouldValidate: true })
    if (fields.roomTypes?.length) {
      setRoomTypes(fields.roomTypes.map((rt) => ({
        classType: rt.classType,
        name: rt.name || rt.classType,
        pricePerNight: rt.pricePerNight,
        maxGuests: rt.maxGuests,
        totalUnits: rt.totalUnits,
        bedrooms: rt.bedrooms,
        bathrooms: rt.bathrooms,
        images: [],
        imageUrl: "",
      })))
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] gap-8 items-start">
      <div className="space-y-6 md:space-y-8 min-w-0">
        {error && <div className="text-red-500 bg-red-50 p-4 rounded-md">{error}</div>}

        <PropertyAiAssistant onApply={handleAiApply} />

        {/* ─── 1. BASICS ─── */}
        <SectionCard
          step="1"
          icon={Home}
          title="Property Basics"
          description="Name, story summary, location, and who manages it."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value)
                      const currentSlug = form.getValues("slug")
                      if (!initialData?.id && (!currentSlug || currentSlug === slugify(field.value || ""))) {
                        form.setValue("slug", slugify(e.target.value), { shouldValidate: true })
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="slug" render={({ field }) => (
              <FormItem>
                <FormLabel>Slug (URL)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => field.onChange(slugify(e.target.value))}
                    placeholder="auto-from-title"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="propertyType" render={({ field }) => (
            <FormItem>
              <FormLabel>Property Type</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  list="property-type-suggestions"
                  placeholder="Hotel, Villa, Apartment, Resort, Lodge..."
                />
              </FormControl>
              <datalist id="property-type-suggestions">
                {PROPERTY_TYPE_SUGGESTIONS.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
              <p className="text-sm text-slate-500">
                Free text. The room categories below adapt to this — villas get villa categories, hotels get room categories, apartments get layouts.
              </p>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Description</FormLabel>
                <AiSuggestButton field="description" onSuggestion={(text) => form.setValue("description", text, { shouldValidate: true })} context={aiContext} />
              </div>
              <FormControl><Textarea className="min-h-[150px]" {...field} /></FormControl><FormMessage />
            </FormItem>
          )} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    list="known-property-locations"
                    placeholder="e.g. Lalitpur, Nepal"
                  />
                </FormControl>
                <datalist id="known-property-locations">
                  {knownLocations.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Address (street, building)</FormLabel>
                <FormControl><Input {...field} placeholder="Optional. Exact street address" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="ownerId" render={({ field }) => (
              <FormItem>
                <FormLabel>Assign Owner</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select an owner" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {owners.map(owner => (
                      <SelectItem key={owner.id} value={owner.id}>
                        {owner.name || owner.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </SectionCard>

        {/* ─── 2. CAPACITY, PRICING & TIMES ─── */}
        <SectionCard
          step="2"
          icon={Clapperboard}
          title="Capacity, Pricing & Times"
          description="Overall numbers for the whole property. If you add room types below, each type carries its own price and capacity."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField control={form.control} name="bedrooms" render={({ field }) => (
              <FormItem><FormLabel>Total Bedrooms</FormLabel><FormControl><NumberInput min={0} step={1} value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="bathrooms" render={({ field }) => (
              <FormItem><FormLabel>Total Bathrooms</FormLabel><FormControl><NumberInput min={0} step={1} value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="maxGuests" render={({ field }) => (
              <FormItem><FormLabel>Max Guests (whole property)</FormLabel><FormControl><NumberInput min={1} step={1} value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="pricePerNight" render={({ field }) => (
              <FormItem>
                <FormLabel>Base Price Per Night (NPR)</FormLabel>
                <FormControl><NumberInput min={1} step={1} value={field.value} onChange={field.onChange} /></FormControl>
                <p className="text-sm text-slate-500">Shown as &ldquo;starting from&rdquo; price. Room types below can have their own prices.</p>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="totalUnits" render={({ field }) => (
              <FormItem>
                <FormLabel>Total Bookable Units</FormLabel>
                <FormControl><NumberInput min={1} step={1} value={field.value} onChange={field.onChange} /></FormControl>
                <p className="text-sm text-slate-500">
                  {roomTypes.length > 0
                    ? `Ignored while room types exist — inventory is the ${roomTypeUnitsSum} unit(s) defined below.`
                    : "Used when you have identical rooms without separate types. A date only shows as booked once ALL units are taken."}
                </p>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="checkInTime" render={({ field }) => (
              <FormItem>
                <FormLabel>Check-in Time</FormLabel>
                <FormControl><Input {...field} placeholder="e.g. From 2:00 PM" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="checkOutTime" render={({ field }) => (
              <FormItem>
                <FormLabel>Check-out Time</FormLabel>
                <FormControl><Input {...field} placeholder="e.g. Until 11:00 AM" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </SectionCard>

        {/* ─── 3. ROOM TYPES & INVENTORY ─── */}
        <SectionCard
          step="3"
          icon={DoorOpen}
          title={`Room Types & Inventory${watchedPropertyType ? ` — ${watchedPropertyType}` : ""}`}
          description={`${inventoryHintFor(watchedPropertyType)} Names are free text — write anything. Optional: skip this and the property books as identical units. Availability is automatic: a date only closes when every unit of a category is taken.`}
        >
          {roomTypes.length === 0 ? (
            <p className="text-sm text-slate-500 bg-white border border-dashed border-slate-300 rounded-lg p-4">
              No room types yet — the property books as <strong>{form.watch("totalUnits") || 1} identical unit(s)</strong> at the base price.
              Add types if guests should choose between categories (e.g. {roomSuggestions.slice(0, 3).join(", ")}...).
            </p>
          ) : (
            <div className="space-y-3">
              <div className="hidden lg:grid grid-cols-[1fr_1fr_90px_120px_90px_80px_80px_36px] gap-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <span>Room Type</span>
                <span>Display Name (optional)</span>
                <span>Units</span>
                <span>Price/Night</span>
                <span>Guests</span>
                <span>Beds</span>
                <span>Baths</span>
                <span />
              </div>
              {roomTypes.map((rt, index) => (
                <div key={rt.id ?? `new-${index}`} className="bg-white border border-slate-200 rounded-lg p-3 space-y-3">
                <div className="grid grid-cols-2 lg:grid-cols-[1fr_1fr_90px_120px_90px_80px_80px_36px] gap-2 items-center">
                  <div className="col-span-2 lg:col-span-1">
                    <Label className="lg:hidden text-[11px] text-slate-400">Room Type</Label>
                    <Input
                      list="room-type-suggestions-form"
                      value={rt.classType}
                      onChange={(e) => updateRoomTypeRow(index, { classType: e.target.value })}
                      placeholder={`e.g. ${roomSuggestions.slice(0, 2).join(", ")}`}
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label className="lg:hidden text-[11px] text-slate-400">Display Name (optional)</Label>
                    <Input
                      value={rt.name}
                      onChange={(e) => updateRoomTypeRow(index, { name: e.target.value })}
                      placeholder={rt.classType || "Same as type"}
                    />
                  </div>
                  <div>
                    <Label className="lg:hidden text-[11px] text-slate-400">Units</Label>
                    <NumberInput min={1} step={1} value={rt.totalUnits} onChange={(v) => updateRoomTypeRow(index, { totalUnits: v })} />
                  </div>
                  <div>
                    <Label className="lg:hidden text-[11px] text-slate-400">Price/Night</Label>
                    <NumberInput min={1} step={1} value={rt.pricePerNight} onChange={(v) => updateRoomTypeRow(index, { pricePerNight: v })} />
                  </div>
                  <div>
                    <Label className="lg:hidden text-[11px] text-slate-400">Guests</Label>
                    <NumberInput min={1} step={1} value={rt.maxGuests} onChange={(v) => updateRoomTypeRow(index, { maxGuests: v })} />
                  </div>
                  <div>
                    <Label className="lg:hidden text-[11px] text-slate-400">Beds</Label>
                    <NumberInput min={0} step={1} value={rt.bedrooms} onChange={(v) => updateRoomTypeRow(index, { bedrooms: v })} />
                  </div>
                  <div>
                    <Label className="lg:hidden text-[11px] text-slate-400">Baths</Label>
                    <NumberInput min={0} step={1} value={rt.bathrooms} onChange={(v) => updateRoomTypeRow(index, { bathrooms: v })} />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-red-500 hover:bg-red-50 hover:text-red-700 justify-self-end"
                    onClick={() => removeRoomTypeRow(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Room photos — multiple, uploaded to Cloudinary, shown as a gallery on the public room card */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <p className="text-[11px] text-slate-500">Room photos (first is the cover; guests can view the whole gallery)</p>
                  {(rt.images?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {rt.images!.map((url, imgIdx) => (
                        <div key={url} className="relative group/photo">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="Room" className="h-16 w-24 object-cover rounded-md border" />
                          {imgIdx === 0 && (
                            <span className="absolute bottom-0 left-0 bg-navy/80 text-white text-[8px] px-1.5 py-0.5 rounded-tr">Cover</span>
                          )}
                          <button
                            type="button"
                            onClick={() => updateRoomTypeRow(index, { images: (rt.images ?? []).filter((u) => u !== url) })}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/photo:opacity-100 transition-opacity"
                            title="Remove"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <MediaUploader
                    kind="image"
                    multiple
                    maxFiles={20}
                    label="Add Room Photos"
                    folder="room-types"
                    onAdd={(m) => updateRoomTypeRow(index, { images: [...(rt.images ?? []), m.url] })}
                  />
                </div>
                </div>
              ))}
              <p className="text-xs text-slate-500">
                Total inventory: <strong>{roomTypeUnitsSum} unit(s)</strong> across {roomTypes.length} type(s).
                Photos, bed setup, size, and per-type amenities can be added later under <strong>Room Classes</strong> on the property page.
              </p>
            </div>
          )}

          <datalist id="room-type-suggestions-form">
            {roomSuggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>

          <Button type="button" variant="outline" onClick={addRoomTypeRow} className="text-navy border-navy/20">
            <Plus className="w-4 h-4 mr-2" /> Add Room Type
          </Button>
        </SectionCard>

        {/* ─── 4. CLIENT-FACING FEATURES ─── */}
        <SectionCard
          step="4"
          icon={Sparkles}
          title="Client-Facing Property Features"
          description="These details appear on the public property page and help guests quickly understand what makes the stay valuable."
        >
          <FormItem>
            <div className="flex items-center justify-between">
              <div>
                <FormLabel>What to Expect (icon strip)</FormLabel>
                <p className="text-sm text-slate-500">Select features to show as icons near the top of the public page.</p>
              </div>
              <span className="text-xs font-medium text-slate-400">{(form.watch("whatToExpect") || []).length} selected</span>
            </div>
            {availableFeatures.length === 0 ? (
              <p className="text-sm text-slate-400 bg-white border border-dashed border-slate-300 rounded-lg p-4">
                No features defined yet. <a href="/admin/settings/features" className="text-navy underline">Add features in Settings</a>.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {availableFeatures.map((feature) => {
                  const selected = (form.watch("whatToExpect") || []).includes(feature.name)
                  const Icon = ICON_REGISTRY[feature.iconKey] || ICON_REGISTRY.check
                  return (
                    <button
                      key={feature.id}
                      type="button"
                      onClick={() => {
                        const current = form.getValues("whatToExpect") || []
                        if (selected) {
                          form.setValue("whatToExpect", current.filter((n) => n !== feature.name), { shouldValidate: true })
                        } else {
                          form.setValue("whatToExpect", [...current, feature.name], { shouldValidate: true })
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                        selected
                          ? "bg-navy text-white border-navy"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${selected ? "text-gold" : "text-slate-400"}`} strokeWidth={1} />
                      <span className="truncate">{feature.name}</span>
                      {selected && <Check className="w-3 h-3 ml-auto shrink-0" />}
                    </button>
                  )
                })}
              </div>
            )}
            <FormMessage />
          </FormItem>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <FormField control={form.control} name="highlightsTitle" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Highlights — section heading</FormLabel>
                  <FormControl><Input {...field} placeholder="Property Highlights (e.g. History of Mustang)" /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="highlightsText" render={({ field }) => (
                <BulkListTextarea
                  label="Additional Features"
                  description="Standout selling points clients should notice first. For prose blocks (e.g. a history), prefer Story Sections after saving."
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={"Private pool\nMountain-view balcony\nDedicated workspace\nChef on request"}
                  maxItems={40}
                  aiField="highlights"
                  aiContext={aiContext}
                />
              )} />
            </div>

            <div className="space-y-2">
              <FormField control={form.control} name="amenitiesTitle" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Amenities — section heading</FormLabel>
                  <FormControl><Input {...field} placeholder="Lifestyle Amenities (e.g. History of the Hotel)" /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="amenitiesText" render={({ field }) => (
                <BulkListTextarea
                  label="Amenities"
                  description="Comforts, services, and facilities available at the property."
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={"High-speed WiFi\nParking\nAirport transfer\nFully equipped kitchen"}
                  aiField="amenities"
                  aiContext={aiContext}
                />
              )} />
            </div>
          </div>

          {/* Stay Details — custom label/value rows */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-navy">Stay Details rows</p>
                <p className="text-[11px] text-slate-500">Custom label/value facts (e.g. Guest Rooms · 8, Setting · Eastern Hills). Leave empty to show bedrooms/bathrooms/capacity automatically.</p>
              </div>
              <Button type="button" variant="outline" size="sm" className="text-navy border-navy/20" onClick={addStayDetail}>
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add row
              </Button>
            </div>
            {stayDetails.length > 0 && (
              <div className="space-y-2">
                {stayDetails.map((row, i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Input value={row.label} onChange={(e) => updateStayDetail(i, { label: e.target.value })} placeholder="Label (e.g. Guest Rooms)" className="flex-1 w-full" />
                    <Input value={row.value} onChange={(e) => updateStayDetail(i, { value: e.target.value })} placeholder="Value (e.g. 8 rooms)" className="flex-1 w-full" />
                    <Button type="button" variant="ghost" size="icon-sm" className="text-red-500 hover:bg-red-50 self-end sm:self-auto" onClick={() => removeStayDetail(i)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Getting Here — travel times */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-navy">Getting Here (travel times)</p>
                <p className="text-[11px] text-slate-500">Shown as a &ldquo;Getting Here&rdquo; section, e.g. <strong>2hr 30 mins</strong> · From Donyi Polo Airport, Itanagar · 128 km.</p>
              </div>
              <Button type="button" variant="outline" size="sm" className="text-navy border-navy/20" onClick={addGettingHere}>
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add leg
              </Button>
            </div>
            {gettingHere.length > 0 && (
              <div className="space-y-2">
                {gettingHere.map((row, i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Input value={row.time} onChange={(e) => updateGettingHere(i, { time: e.target.value })} placeholder="Time (e.g. 2hr 30 mins)" className="w-full sm:w-40" />
                    <Input value={row.from} onChange={(e) => updateGettingHere(i, { from: e.target.value })} placeholder="From (e.g. Donyi Polo Airport, Itanagar)" className="w-full sm:flex-1" />
                    <Input value={row.distance ?? ""} onChange={(e) => updateGettingHere(i, { distance: e.target.value })} placeholder="Distance (e.g. 128 km)" className="w-full sm:w-32" />
                    <Button type="button" variant="ghost" size="icon-sm" className="text-red-500 hover:bg-red-50 self-end sm:self-auto" onClick={() => removeGettingHere(i)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <FormField control={form.control} name="rulesText" render={({ field }) => (
            <BulkListTextarea
              label="House Rules"
              description="Important stay conditions guests should know before booking."
              value={field.value}
              onChange={field.onChange}
              placeholder={"Check-in after 2 PM\nNo smoking indoors\nQuiet hours after 10 PM"}
              minHeight="min-h-[96px]"
              maxItems={40}
            />
          )} />

          <FormField control={form.control} name="servicesText" render={({ field }) => (
            <BulkListTextarea
              label="Services & Experiences"
              description="Concierge services, experiences, and extras shown in their own section on the public page."
              value={field.value}
              onChange={field.onChange}
              placeholder={"24/7 concierge desk\nPrivate chef on request\nGuided village walks\nAirport pick-up & drop"}
              minHeight="min-h-[96px]"
              maxItems={40}
              aiField="services"
              aiContext={aiContext}
            />
          )} />
        </SectionCard>

        {/* ─── 5. PREMIUM PAGE CONTENT ─── */}
        <SectionCard
          step="5"
          icon={PenLine}
          title="Premium Page Content"
          description="Optional editorial content that makes the public page feel rich and personal. For full custom sections with images, use Story Sections after saving."
        >
          <FormField control={form.control} name="tagline" render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Tagline</FormLabel>
                <AiSuggestButton field="tagline" onSuggestion={(text) => form.setValue("tagline", text, { shouldValidate: true })} context={aiContext} />
              </div>
              <p className="text-sm text-slate-500">A short signature line shown under the property title.</p>
              <FormControl><Input {...field} placeholder="e.g. A lakeside retreat where the mountains meet stillness" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <FormField control={form.control} name="story" render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>The Story</FormLabel>
                  <AiSuggestButton field="story" onSuggestion={(text) => form.setValue("story", text, { shouldValidate: true })} context={aiContext} />
                </div>
                <p className="text-sm text-slate-500">The deeper story of this place — its history, design, philosophy.</p>
                <FormControl><Textarea className="min-h-[140px]" {...field} placeholder="Built in 1972 by..." /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="neighborhood" render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>The Neighborhood</FormLabel>
                  <AiSuggestButton field="neighborhood" onSuggestion={(text) => form.setValue("neighborhood", text, { shouldValidate: true })} context={aiContext} />
                </div>
                <p className="text-sm text-slate-500">What surrounds the stay — walks, food, culture, views.</p>
                <FormControl><Textarea className="min-h-[140px]" {...field} placeholder="Five minutes from the old bazaar..." /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="hostNote" render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>A Note From The Host</FormLabel>
                <AiSuggestButton field="hostNote" onSuggestion={(text) => form.setValue("hostNote", text, { shouldValidate: true })} context={aiContext} />
              </div>
              <p className="text-sm text-slate-500">A personal welcome message from the owner, shown with their name.</p>
              <FormControl><Textarea className="min-h-[100px]" {...field} placeholder="We look forward to welcoming you..." /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </SectionCard>

        {/* ─── 6. MEDIA ─── */}
        <SectionCard
          step="6"
          icon={ImageIcon}
          title={`Property Media${media.length > 0 ? ` (${media.length})` : ""}`}
          description="Upload photos and videos. After saving you can add more, reorder them, and pick a primary cover image."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
              <div>
                <h4 className="text-sm font-semibold text-navy">Photos</h4>
                <p className="text-xs text-slate-500">JPG, PNG, WEBP, AVIF. Up to 30 at once.</p>
              </div>
              <MediaUploader onAdd={handleAddMedia} multiple maxFiles={30} kind="image" />
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
              <div>
                <h4 className="text-sm font-semibold text-navy">Videos</h4>
                <p className="text-xs text-slate-500">MP4, WEBM, MOV. Up to 200 MB per video.</p>
              </div>
              <MediaUploader onAdd={handleAddMedia} multiple maxFiles={10} kind="video" />
            </div>
          </div>

          {media.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {media.map((item) => {
                const video = isVideoUrl(item.url)
                return (
                  <div key={item.publicId} className="overflow-hidden rounded-lg border bg-white">
                    <div className="relative aspect-video bg-slate-100">
                      {video ? (
                        <video src={item.url} className="h-full w-full object-cover" controls muted playsInline />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.url} alt={item.alt || "Property media"} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 p-2">
                      <span className="flex min-w-0 items-center gap-1.5 text-xs text-slate-600">
                        {video ? <Film className="h-3.5 w-3.5 shrink-0" /> : <ImageIcon className="h-3.5 w-3.5 shrink-0" />}
                        <span className="truncate">{item.alt || item.publicId}</span>
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-red-500 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setMedia((prev) => prev.filter((mediaItem) => mediaItem.publicId !== item.publicId))}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </SectionCard>

        <Button type="submit" className="bg-navy text-cream w-full" disabled={isPending}>
          {isPending ? "Saving..." : initialData ? "Update Property" : "Create Property"}
        </Button>
      </div>

      {/* Side-by-side live preview of the real public page (desktop) */}
      <div className="hidden xl:block sticky top-6">
        <PropertyFormPreview property={previewProperty} />
      </div>
      </div>
      </form>
    </Form>
  )
}
