"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm, type Resolver, type FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NumberInput } from "@/components/ui/number-input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { upsertPropertyAction } from "./actions"
import { PropertyStatus } from "@prisma/client"
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bed,
  Check,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Compass,
  DoorOpen,
  Eye,
  EyeOff,
  Film,
  Home,
  Image as ImageIcon,
  ImagePlus,
  Layers,
  ListChecks,
  Loader2,
  Monitor,
  PenLine,
  Plus,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react"
import { isVideoUrl } from "@/lib/property-media"
import { ICON_REGISTRY } from "@/lib/feature-icons"
import { MediaUploader, type UploadedMedia } from "@/components/admin/media-uploader"
import { PropertyFormPreview } from "@/components/admin/property-form-preview"
import type { PropertyDetail } from "@/components/public/PropertyDetailClient"
import { PROPERTY_TYPE_SUGGESTIONS, roomTypeSuggestionsFor, inventoryHintFor } from "@/lib/room-type-suggestions"
import { PropertyAiAssistant } from "@/components/admin/property-ai-assistant"

const schema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(160),
  slug: z
    .string()
    .trim()
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
  hidePrice: z.boolean().default(false),
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
  ownerId: z.string().min(1, "Please assign an owner or manager"),
})

type PropertyFormValues = z.infer<typeof schema>

export type RoomTypeDraft = {
  id?: string
  classType: string
  name: string
  totalUnits: number
  pricePerNight: number
  hidePrice?: boolean
  maxGuests: number
  bedrooms: number
  bathrooms: number
  imageUrl?: string
  images?: string[]
}

export type ExperienceDraft = {
  id?: string
  title: string
  description: string
  imageUrl?: string | null
}

export type StayDetailRow = { label: string; value: string }
export type GettingHereRow = { time: string; from: string; distance?: string }
export type StorySectionDraft = {
  id?: string
  title: string
  subtitle?: string
  body: string
  imageUrl?: string
}

export type FormTabId = "basics" | "rooms" | "media" | "experiences" | "amenities"

export const FORM_TABS: {
  id: FormTabId
  label: string
  icon: React.ComponentType<{ className?: string }>
  summary: string
}[] = [
  { id: "basics", label: "Basics & Story", icon: Home, summary: "Name, type, location & editorial narrative" },
  { id: "rooms", label: "Rooms & Rates", icon: DoorOpen, summary: "Capacity, base pricing & room inventory" },
  { id: "media", label: "Media & Chapters", icon: Clapperboard, summary: "Photos, banner, thumbnail & brochure chapters" },
  { id: "experiences", label: "Curated Experiences", icon: Sparkles, summary: "Bespoke encounters (photo or typographic card)" },
  { id: "amenities", label: "Amenities & Logistics", icon: ListChecks, summary: "Features, house rules & arrival details" },
]

type PropertyFormInitialData = Omit<
  Partial<PropertyFormValues>,
  "address" | "pricePerNight" | "hidePrice" | "tagline" | "story" | "neighborhood" | "hostNote" | "checkInTime" | "checkOutTime" | "highlightsTitle" | "amenitiesTitle"
> & {
  id?: string
  address?: string | null
  pricePerNight?: number | { toString(): string } | null
  hidePrice?: boolean | null
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
  experiences?: ExperienceDraft[] | null
}

type PropertyMediaDraft = UploadedMedia & {
  isPrimary?: boolean
  isBanner?: boolean
}

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
    <div className="rounded-2xl border border-[#1B3A5C]/8 bg-[#FBF9F4]/70 p-4 sm:p-5 space-y-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFFAF3] border border-[#1B3A5C]/8 text-[#C9A96E]">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.25em] mb-0.5">Step {step}</p>
          <h3 className="text-[15px] font-semibold text-[#1B3A5C]">{title}</h3>
          <p className="text-[12px] text-[#1B3A5C]/45 mt-0.5">{description}</p>
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
          <p className="mt-1 text-[12px] text-[#1B3A5C]/45">{description}</p>
        </div>
        <span className="text-xs font-medium text-[#1B3A5C]/35 tabular-nums">{count} added</span>
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
  defaultOwnerId,
  initialData,
  knownLocations = [],
  availableFeatures = [],
}: {
  owners: { id: string, name: string | null, email: string, role?: string }[];
  defaultOwnerId?: string;
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
  const [storySections, setStorySections] = useState<StorySectionDraft[]>(
    (initialData?.sections ?? []).map((section) => ({
      id: section.id,
      title: section.title,
      subtitle: section.subtitle ?? "",
      body: section.body,
      imageUrl: section.imageUrl ?? "",
    })),
  )
  const [experiences, setExperiences] = useState<ExperienceDraft[]>(
    (initialData?.experiences ?? []).map((exp) => ({
      id: exp.id,
      title: exp.title,
      description: exp.description,
      imageUrl: exp.imageUrl ?? "",
    })),
  )
  const [activeTab, setActiveTab] = useState<FormTabId>("basics")
  const [viewMode, setViewMode] = useState<"step" | "all">("step")
  const [showPreview, setShowPreview] = useState(false)

  const addExperience = () =>
    setExperiences((prev) => [
      ...prev,
      {
        id: `exp-${Date.now()}`,
        title: "",
        description: "",
        imageUrl: "",
      },
    ])
  const updateExperience = (i: number, patch: Partial<ExperienceDraft>) =>
    setExperiences((prev) => prev.map((item, idx) => (idx === i ? { ...item, ...patch } : item)))
  const removeExperience = (i: number) =>
    setExperiences((prev) => prev.filter((_, idx) => idx !== i))

  const currentTabIndex = FORM_TABS.findIndex((t) => t.id === activeTab)

  const fallbackOwnerId = initialData?.ownerId || defaultOwnerId || owners[0]?.id || ""

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
      hidePrice: initialData?.hidePrice ?? false,
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
      ownerId: initialData?.ownerId || fallbackOwnerId,
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
    hidePrice: watched.hidePrice,
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
      .map((m, i) => ({
        id: `m-${i}`,
        url: m.url,
        alt: m.alt ?? null,
        isPrimary: m.isPrimary ?? (i === 0),
        isBanner: m.isBanner ?? (i === 0),
        order: i,
      })),
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
    sections: storySections
      .filter((section) => section.title.trim() && section.body.trim())
      .map((section, index) => ({
        id: section.id ?? `section-preview-${index}`,
        title: section.title.trim(),
        subtitle: section.subtitle?.trim() || null,
        body: section.body.trim(),
        imageUrl: section.imageUrl || null,
      })),
    experiences: experiences
      .filter((exp) => exp.title.trim())
      .map((exp, i) => ({
        id: exp.id || `exp-preview-${i}`,
        title: exp.title.trim(),
        description: exp.description.trim() || "Curated encounter arranged for your stay.",
        imageUrl: exp.imageUrl || null,
      })),
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

  function addStorySection() {
    setStorySections((current) => [
      ...current,
      { title: "", subtitle: "", body: "", imageUrl: "" },
    ])
  }

  function updateStorySection(index: number, patch: Partial<StorySectionDraft>) {
    setStorySections((current) => current.map((section, position) => (
      position === index ? { ...section, ...patch } : section
    )))
  }

  function removeStorySection(index: number) {
    setStorySections((current) => current.filter((_, position) => position !== index))
  }

  function onInvalid(errors: FieldErrors<PropertyFormValues>) {
    console.warn("[PropertyForm] Validation failed:", errors)
    const errorList: string[] = []

    if (errors.title?.message) errorList.push(`Title: ${errors.title.message}`)
    if (errors.slug?.message) errorList.push(`Slug (URL): ${errors.slug.message}`)
    if (errors.propertyType?.message) errorList.push(`Property Type: ${errors.propertyType.message}`)
    if (errors.description?.message) errorList.push(`Description: ${errors.description.message}`)
    if (errors.location?.message) errorList.push(`Location: ${errors.location.message}`)
    if (errors.ownerId?.message) errorList.push(`Owner / Manager: ${errors.ownerId.message}`)
    if (errors.pricePerNight?.message) errorList.push(`Base Price: ${errors.pricePerNight.message}`)
    if (errors.maxGuests?.message) errorList.push(`Max Guests: ${errors.maxGuests.message}`)
    if (errors.bedrooms?.message) errorList.push(`Bedrooms: ${errors.bedrooms.message}`)
    if (errors.bathrooms?.message) errorList.push(`Bathrooms: ${errors.bathrooms.message}`)
    if (errors.totalUnits?.message) errorList.push(`Units: ${errors.totalUnits.message}`)

    const knownKeys = new Set(["title", "slug", "propertyType", "description", "location", "ownerId", "pricePerNight", "maxGuests", "bedrooms", "bathrooms", "totalUnits"])
    for (const key of Object.keys(errors)) {
      if (!knownKeys.has(key)) {
        const err = errors[key as keyof PropertyFormValues]
        if (err?.message) errorList.push(`${key}: ${err.message}`)
      }
    }

    const message = errorList.length > 0
      ? `Please resolve the following required fields before saving:\n• ${errorList.join("\n• ")}`
      : "Some required fields are missing or invalid. Please check the highlighted fields above."

    setError(message)

    // Scroll to the first invalid field and switch to that tab
    const firstKey = Object.keys(errors)[0]
    if (firstKey) {
      if (["title", "slug", "propertyType", "description", "location", "address", "status", "ownerId", "tagline", "story", "neighborhood", "hostNote"].includes(firstKey)) {
        setActiveTab("basics")
      } else if (["bedrooms", "bathrooms", "maxGuests", "pricePerNight", "totalUnits", "checkInTime", "checkOutTime"].includes(firstKey)) {
        setActiveTab("rooms")
      } else if (["highlightsText", "amenitiesText", "rulesText", "servicesText", "whatToExpect", "highlightsTitle", "amenitiesTitle"].includes(firstKey)) {
        setActiveTab("amenities")
      }
      setTimeout(() => {
        const el = document.querySelector(`[name="${firstKey}"]`) || document.querySelector(`.text-destructive`)
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" })
          if (el instanceof HTMLElement) el.focus()
        }
      }, 50)
      return
    }
    const banner = document.getElementById("property-form-error-banner")
    if (banner) banner.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  async function onSubmit(data: PropertyFormValues) {
    const invalidRow = roomTypes.find((rt) => rt.classType.trim().length < 2)
    if (invalidRow) {
      setError("Every room type row needs a type name (e.g. Normal Room, Deluxe Room). Remove empty rows or fill them in.")
      setActiveTab("rooms")
      const banner = document.getElementById("property-form-error-banner")
      if (banner) banner.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }

    const incompleteSection = storySections.find((section) => !section.title.trim() || !section.body.trim())
    if (incompleteSection) {
      setError("Every story section needs a title and body. Complete it or remove the empty section.")
      setActiveTab("media")
      const banner = document.getElementById("property-form-error-banner")
      if (banner) banner.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }

    const invalidExp = experiences.find((exp) => (exp.title.trim() && !exp.description.trim()) || (!exp.title.trim() && exp.description.trim()))
    if (invalidExp) {
      setError("Every curated experience needs both a Title and a Narrative Description. Please complete it or remove the empty experience.")
      setActiveTab("experiences")
      const banner = document.getElementById("property-form-error-banner")
      if (banner) banner.scrollIntoView({ behavior: "smooth", block: "center" })
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
        sections: storySections.map((section) => ({
          id: section.id,
          title: section.title.trim(),
          subtitle: section.subtitle?.trim() || undefined,
          body: section.body.trim(),
          imageUrl: section.imageUrl || undefined,
        })),
        experiences: experiences
          .filter((exp) => exp.title.trim() && exp.description.trim())
          .map((exp) => ({
            id: exp.id,
            title: exp.title.trim(),
            description: exp.description.trim(),
            imageUrl: exp.imageUrl?.trim() || undefined,
          })),
      },
      initialData?.id
    )
    if (res.error) {
      setError(res.error)
      setIsPending(false)
      const banner = document.getElementById("property-form-error-banner")
      if (banner) banner.scrollIntoView({ behavior: "smooth", block: "center" })
    } else {
      // Continue to the media page to finish setup.
      router.push(`/admin/properties/${res.id}/images`)
    }
  }

  function handleAddMedia(item: UploadedMedia) {
    setMedia((prev) => {
      const isVideo = isVideoUrl(item.url)
      const hasImage = prev.some((m) => !isVideoUrl(m.url))
      return [
        ...prev,
        {
          ...item,
          isPrimary: !isVideo && !hasImage,
          isBanner: !isVideo && !hasImage,
        },
      ]
    })
  }

  function handleSetMediaPrimary(publicId: string) {
    setMedia((prev) =>
      prev.map((m) => ({
        ...m,
        isPrimary: m.publicId === publicId,
      }))
    )
  }

  function handleSetMediaBanner(publicId: string) {
    setMedia((prev) =>
      prev.map((m) => ({
        ...m,
        isBanner: m.publicId === publicId ? !m.isBanner : false,
      }))
    )
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
    location?: string
    address?: string
    pricePerNight?: number
    totalUnits?: number
    bedrooms?: number
    bathrooms?: number
    checkInTime?: string
    checkOutTime?: string
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
    sections?: {
      title: string
      subtitle?: string
      body: string
    }[]
  }) {
    if (fields.title) form.setValue("title", fields.title, { shouldValidate: true })
    if (fields.slug) form.setValue("slug", fields.slug, { shouldValidate: true })
    if (fields.propertyType) form.setValue("propertyType", fields.propertyType, { shouldValidate: true })
    if (fields.description) form.setValue("description", fields.description, { shouldValidate: true })
    if (fields.location) form.setValue("location", fields.location, { shouldValidate: true })
    if (fields.address) form.setValue("address", fields.address, { shouldValidate: true })
    if (fields.tagline) form.setValue("tagline", fields.tagline, { shouldValidate: true })
    if (fields.story) form.setValue("story", fields.story, { shouldValidate: true })
    if (fields.neighborhood) form.setValue("neighborhood", fields.neighborhood, { shouldValidate: true })
    if (fields.hostNote) form.setValue("hostNote", fields.hostNote, { shouldValidate: true })
    if (fields.highlights?.length) form.setValue("highlightsText", fields.highlights.join("\n"), { shouldValidate: true })
    if (fields.amenities?.length) form.setValue("amenitiesText", fields.amenities.join("\n"), { shouldValidate: true })
    if (fields.services?.length) form.setValue("servicesText", fields.services.join("\n"), { shouldValidate: true })
    if (fields.rules?.length) form.setValue("rulesText", fields.rules.join("\n"), { shouldValidate: true })
    if (fields.highlightsTitle) form.setValue("highlightsTitle", fields.highlightsTitle, { shouldValidate: true })
    if (fields.amenitiesTitle) form.setValue("amenitiesTitle", fields.amenitiesTitle, { shouldValidate: true })
    if (typeof fields.maxGuests === "number" && fields.maxGuests >= 1) form.setValue("maxGuests", fields.maxGuests, { shouldValidate: true })
    if (typeof fields.pricePerNight === "number" && fields.pricePerNight > 0) form.setValue("pricePerNight", fields.pricePerNight, { shouldValidate: true })
    if (typeof fields.totalUnits === "number" && fields.totalUnits >= 1) form.setValue("totalUnits", fields.totalUnits, { shouldValidate: true })
    if (typeof fields.bedrooms === "number" && fields.bedrooms >= 0) form.setValue("bedrooms", fields.bedrooms, { shouldValidate: true })
    if (typeof fields.bathrooms === "number" && fields.bathrooms >= 0) form.setValue("bathrooms", fields.bathrooms, { shouldValidate: true })
    if (fields.checkInTime) form.setValue("checkInTime", fields.checkInTime, { shouldValidate: true })
    if (fields.checkOutTime) form.setValue("checkOutTime", fields.checkOutTime, { shouldValidate: true })
    if (fields.whatToExpect?.length) {
      // Only keep chips that match a real feature, so the UI highlights them.
      const allowed = availableFeatures.length
        ? new Set(availableFeatures.map((f) => f.name.toLowerCase()))
        : null
      const mapped = allowed
        ? fields.whatToExpect.filter((v) => allowed.has(v.toLowerCase()))
        : fields.whatToExpect
      if (mapped.length) form.setValue("whatToExpect", mapped, { shouldValidate: true })
    }
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
    if (fields.sections?.length) {
      setStorySections(fields.sections.map((section) => ({
        title: section.title,
        subtitle: section.subtitle ?? "",
        body: section.body,
        imageUrl: "",
      })))
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        {/* ─── CATEGORY NAVIGATION BAR (STICKY) ─── */}
        <div className="sticky top-2 z-20 rounded-2xl border border-[#1B3A5C]/12 bg-[#FFFAF3]/95 backdrop-blur-md p-2 shadow-sm mb-6">
          <div className="flex items-center justify-between gap-3 pb-2 mb-2 border-b border-[#1B3A5C]/8 px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1B3A5C]">
                Editing Sections
              </span>
              <span className="hidden sm:inline-block text-[11px] text-[#1B3A5C]/50">
                — {FORM_TABS.find((t) => t.id === activeTab)?.summary}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Mode Toggle: Step vs All */}
              <button
                type="button"
                onClick={() => setViewMode((m) => (m === "step" ? "all" : "step"))}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-[#1B3A5C]/15 text-[#1B3A5C]/75 hover:bg-white hover:text-[#1B3A5C] transition-colors"
                title="Switch between focused tab view and all-sections continuous view"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{viewMode === "step" ? "Show All Sections" : "Focused Step View"}</span>
              </button>

              {/* Live Preview Toggle */}
              <button
                type="button"
                onClick={() => setShowPreview((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  showPreview
                    ? "bg-[#1B3A5C] text-[#FFFAF3] shadow-xs"
                    : "border border-[#C9A96E]/40 text-[#1B3A5C] hover:bg-[#C9A96E]/15"
                }`}
                title="Toggle live property brochure preview"
              >
                {showPreview ? <EyeOff className="w-3.5 h-3.5 text-[#C9A96E]" /> : <Eye className="w-3.5 h-3.5 text-[#C9A96E]" />}
                <span>{showPreview ? "Hide Preview" : "Live Preview"}</span>
              </button>
            </div>
          </div>

          {/* Tab Buttons (Horizontal scrollable on mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FORM_TABS.map((tab, idx) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id)
                    if (viewMode === "all") {
                      const el = document.getElementById(`tab-section-${tab.id}`)
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-[#1B3A5C] text-[#FFFAF3] shadow-xs font-semibold"
                      : "text-[#1B3A5C]/70 hover:text-[#1B3A5C] hover:bg-white/60"
                  }`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold ${
                    isActive ? "bg-[#C9A96E] text-[#1B3A5C]" : "bg-[#1B3A5C]/10 text-[#1B3A5C]"
                  }`}>
                    {idx + 1}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#C9A96E]" : "text-[#1B3A5C]/60"}`} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className={`grid grid-cols-1 ${showPreview ? "xl:grid-cols-[minmax(0,1fr)_390px] gap-8" : "max-w-5xl mx-auto"} items-start transition-all`}>
        <div className="space-y-6 md:space-y-8 min-w-0">
          {error && (
            <div
              id="property-form-error-banner"
              className="rounded-2xl border border-red-200 bg-red-50 p-5 text-[13px] text-red-950 shadow-sm transition-all"
            >
              <div className="flex items-start gap-3.5">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <p className="font-semibold text-red-900 text-sm">Action Required to Save Property</p>
                  <div className="whitespace-pre-line text-red-800 font-sans text-xs leading-relaxed">
                    {error}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-700 p-1 rounded-lg hover:bg-red-100/50 transition-colors"
                  aria-label="Dismiss error"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <PropertyAiAssistant
            onApply={handleAiApply}
            knownLocations={knownLocations}
            availableFeatures={availableFeatures}
          />

          {/* ─── TAB 1: BASICS & STORY ─── */}
          {(viewMode === "all" || activeTab === "basics") && (
            <div id="tab-section-basics" className="space-y-6 md:space-y-8">
              <SectionCard
                step="1"
                icon={Home}
                title="Property Basics"
                description="Name, property type, location, address, and who manages it."
              >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Title <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. Sunshine Villa & Tea Estate"
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
                <FormLabel>Slug (URL) <span className="text-red-500">*</span></FormLabel>
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
              <FormLabel>Property Type <span className="text-red-500">*</span></FormLabel>
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
              <p className="text-[12px] text-[#1B3A5C]/45">
                Free text. The room categories below adapt to this — villas get villa categories, hotels get room categories, apartments get layouts.
              </p>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                <AiSuggestButton field="description" onSuggestion={(text) => form.setValue("description", text, { shouldValidate: true })} context={aiContext} />
              </div>
              <FormControl><Textarea className="min-h-[150px]" {...field} placeholder="Describe the atmosphere, landscape, architecture, and guest experience..." /></FormControl><FormMessage />
            </FormItem>
          )} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem>
                <FormLabel>Location <span className="text-red-500">*</span></FormLabel>
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
                <FormLabel>Status <span className="text-red-500">*</span></FormLabel>
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
                <FormLabel>Assign Owner / Manager <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value || fallbackOwnerId}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select an owner" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {owners.length === 0 ? (
                      <SelectItem value={defaultOwnerId || "admin-owner"} disabled={!defaultOwnerId}>
                        {defaultOwnerId ? "Current Admin Account" : "No users available"}
                      </SelectItem>
                    ) : (
                      owners.map(owner => (
                        <SelectItem key={owner.id} value={owner.id}>
                          {owner.name || owner.email} {owner.role ? `(${owner.role})` : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {owners.length === 0 && (
                  <p className="text-[11.5px] text-amber-700 mt-1">
                    No separate owner accounts found. Assigned to your admin account.
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </SectionCard>

        {/* ─── 2. EDITORIAL STORY & NARRATIVE ─── */}
        <SectionCard
          step="2"
          icon={PenLine}
          title="Editorial Story & Narrative"
          description="Signature tagline, rich historical background, neighborhood context, and host note."
        >
          <FormField control={form.control} name="tagline" render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Tagline</FormLabel>
                <AiSuggestButton field="tagline" onSuggestion={(text) => form.setValue("tagline", text, { shouldValidate: true })} context={aiContext} />
              </div>
              <p className="text-[12px] text-[#1B3A5C]/45">A short signature line shown under the property title.</p>
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
                <p className="text-[12px] text-[#1B3A5C]/45">The deeper story of this place — its history, design, philosophy.</p>
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
                <p className="text-[12px] text-[#1B3A5C]/45">What surrounds the stay — walks, food, culture, views.</p>
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
              <p className="text-[12px] text-[#1B3A5C]/45">A personal welcome message from the owner, shown with their name.</p>
              <FormControl><Textarea className="min-h-[100px]" {...field} placeholder="We look forward to welcoming you..." /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </SectionCard>
      </div>
    )}

    {/* ─── TAB 2: ROOMS & RATES ─── */}
    {(viewMode === "all" || activeTab === "rooms") && (
      <div id="tab-section-rooms" className="space-y-6 md:space-y-8">
        <SectionCard
          step="1"
          icon={Bed}
          title="Capacity, Pricing & Times"
          description="Overall numbers for the whole property. If you add room types below, each type carries its own price and capacity."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField control={form.control} name="bedrooms" render={({ field }) => (
              <FormItem><FormLabel>Total Bedrooms <span className="text-red-500">*</span></FormLabel><FormControl><NumberInput min={0} step={1} value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="bathrooms" render={({ field }) => (
              <FormItem><FormLabel>Total Bathrooms <span className="text-red-500">*</span></FormLabel><FormControl><NumberInput min={0} step={1} value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="maxGuests" render={({ field }) => (
              <FormItem><FormLabel>Max Guests (whole property) <span className="text-red-500">*</span></FormLabel><FormControl><NumberInput min={1} step={1} value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="pricePerNight" render={({ field }) => (
              <FormItem>
                <FormLabel>Base Price Per Night (NPR) <span className="text-red-500">*</span></FormLabel>
                <FormControl><NumberInput min={1} step={1} value={field.value} onChange={field.onChange} /></FormControl>
                <p className="text-[12px] text-[#1B3A5C]/45">Shown as &ldquo;starting from&rdquo; price. Room types below can have their own prices.</p>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="totalUnits" render={({ field }) => (
              <FormItem>
                <FormLabel>Total Bookable Units <span className="text-red-500">*</span></FormLabel>
                <FormControl><NumberInput min={1} step={1} value={field.value} onChange={field.onChange} /></FormControl>
                <p className="text-[12px] text-[#1B3A5C]/45">
                  {roomTypes.length > 0
                    ? `Ignored while room types exist — inventory is the ${roomTypeUnitsSum} unit(s) defined below.`
                    : "Used when you have identical rooms without separate types. A date only shows as booked once ALL units are taken."}
                </p>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="rounded-xl border border-[#1B3A5C]/10 bg-[#FFFAF3] p-4.5">
            <FormField control={form.control} name="hidePrice" render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3.5 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="cursor-pointer text-sm font-semibold text-[#1B3A5C]">
                    Hide pricing & show &ldquo;Request a Quote&rdquo;
                  </FormLabel>
                  <p className="text-[12px] text-[#1B3A5C]/55 leading-relaxed">
                    When checked, the exact amount will be hidden across public listings, brochures, search cards, and booking steps. Guests will see &ldquo;Request a Quote&rdquo; instead.
                  </p>
                </div>
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
            <p className="text-[12px] text-[#1B3A5C]/50 bg-[#FFFAF3] border border-dashed border-[#1B3A5C]/15 rounded-xl p-4">
              No room types yet — the property books as <strong>{form.watch("totalUnits") || 1} identical unit(s)</strong> at the base price.
              Add types if guests should choose between categories (e.g. {roomSuggestions.slice(0, 3).join(", ")}...).
            </p>
          ) : (
            <div className="space-y-4">
              {roomTypes.map((rt, index) => (
                <div key={rt.id ?? `new-${index}`} className="bg-white border border-[#1B3A5C]/12 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
                  {/* Card Header: Badge, Title & Remove Action */}
                  <div className="flex items-center justify-between border-b border-[#1B3A5C]/8 pb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="inline-flex items-center justify-center h-6 w-6 shrink-0 rounded-full bg-[#1B3A5C]/8 text-[11px] font-bold text-[#1B3A5C]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1B3A5C] truncate">
                          {rt.name || rt.classType || `Room Category ${index + 1}`}
                        </p>
                        {rt.classType && rt.name && rt.name !== rt.classType && (
                          <p className="text-[11px] text-[#1B3A5C]/45 truncate">Class: {rt.classType}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50 hover:text-red-700 gap-1.5 h-8 px-2.5 text-xs font-medium shrink-0"
                      onClick={() => removeRoomTypeRow(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Remove</span>
                    </Button>
                  </div>

                  {/* Category & Display Name inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-[#1B3A5C]">
                        Room Type Category <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        list="room-type-suggestions-form"
                        value={rt.classType}
                        onChange={(e) => updateRoomTypeRow(index, { classType: e.target.value })}
                        placeholder={`e.g. ${roomSuggestions.slice(0, 2).join(", ")}`}
                        className="h-10 bg-[#FFFAF3]/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-[#1B3A5C]">
                        Display Name <span className="text-[#1B3A5C]/40 font-normal">(optional)</span>
                      </Label>
                      <Input
                        value={rt.name}
                        onChange={(e) => updateRoomTypeRow(index, { name: e.target.value })}
                        placeholder={rt.classType || "Same as type"}
                        className="h-10 bg-[#FFFAF3]/40"
                      />
                    </div>
                  </div>

                  {/* Room numbers / capacity stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#1B3A5C]/60">Units</Label>
                      <NumberInput min={1} step={1} value={rt.totalUnits} onChange={(v) => updateRoomTypeRow(index, { totalUnits: v })} className="h-10" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#1B3A5C]/60">Price/Night (NPR)</Label>
                      <NumberInput min={1} step={100} value={rt.pricePerNight} onChange={(v) => updateRoomTypeRow(index, { pricePerNight: v })} className="h-10" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#1B3A5C]/60">Max Guests</Label>
                      <NumberInput min={1} step={1} value={rt.maxGuests} onChange={(v) => updateRoomTypeRow(index, { maxGuests: v })} className="h-10" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#1B3A5C]/60">Bedrooms</Label>
                      <NumberInput min={0} step={1} value={rt.bedrooms} onChange={(v) => updateRoomTypeRow(index, { bedrooms: v })} className="h-10" />
                    </div>
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <Label className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#1B3A5C]/60">Bathrooms</Label>
                      <NumberInput min={0} step={1} value={rt.bathrooms} onChange={(v) => updateRoomTypeRow(index, { bathrooms: v })} className="h-10" />
                    </div>
                  </div>

                  {/* Room Photos */}
                  <div className="pt-3 border-t border-[#1B3A5C]/8 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#1B3A5C]">
                        Room Photos <span className="text-[#1B3A5C]/40 font-normal">({rt.images?.length ?? 0} uploaded)</span>
                      </span>
                      <span className="text-[11px] text-[#1B3A5C]/45">First photo is cover image</span>
                    </div>

                    {(rt.images?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-2.5">
                        {rt.images!.map((url, imgIdx) => (
                          <div key={url} className="relative group/photo rounded-lg overflow-hidden border border-[#1B3A5C]/12 bg-[#1B3A5C]/5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt="Room" className="h-20 w-28 object-cover" />
                            {imgIdx === 0 && (
                              <span className="absolute bottom-0 left-0 bg-[#1B3A5C]/90 text-white text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-tr tracking-wider">Cover</span>
                            )}
                            <button
                              type="button"
                              onClick={() => updateRoomTypeRow(index, { images: (rt.images ?? []).filter((u) => u !== url) })}
                              className="absolute top-1 right-1 bg-red-600/90 text-white rounded-full p-1 opacity-0 group-hover/photo:opacity-100 transition-opacity hover:bg-red-700"
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
              <p className="text-xs text-[#1B3A5C]/45">
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

          <Button type="button" variant="outline" onClick={addRoomTypeRow} className="rounded-lg border-[#1B3A5C]/15 text-[#1B3A5C]/60 text-[12px] font-medium hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 bg-transparent">
            <Plus className="w-3.5 h-3.5 mr-2" /> Add Room Type
          </Button>
        </SectionCard>
      </div>
    )}

    {/* ─── TAB 3: MEDIA & CHAPTERS ─── */}
    {(viewMode === "all" || activeTab === "media") && (
      <div id="tab-section-media" className="space-y-6 md:space-y-8">
        <SectionCard
          step="1"
          icon={ImageIcon}
          title={`Property Media${media.length > 0 ? ` (${media.length})` : ""}`}
          description="Upload photos and videos. Choose which photo serves as the primary listing thumbnail and which serves as the full-width hero banner."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#1B3A5C]/8 bg-[#FFFAF3] p-4 space-y-2">
              <div>
                <h4 className="text-sm font-semibold text-[#1B3A5C]">Photos</h4>
                <p className="text-xs text-[#1B3A5C]/45">JPG, PNG, WEBP, AVIF. Up to 30 at once.</p>
              </div>
              <MediaUploader onAdd={handleAddMedia} multiple maxFiles={30} kind="image" />
            </div>

            <div className="rounded-xl border border-[#1B3A5C]/8 bg-[#FFFAF3] p-4 space-y-2">
              <div>
                <h4 className="text-sm font-semibold text-[#1B3A5C]">Videos</h4>
                <p className="text-xs text-[#1B3A5C]/45">MP4, WEBM, MOV. Up to 200 MB per video.</p>
              </div>
              <MediaUploader onAdd={handleAddMedia} multiple maxFiles={10} kind="video" />
            </div>
          </div>

          {media.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {media.map((item) => {
                const video = isVideoUrl(item.url)
                return (
                  <div
                    key={item.publicId}
                    className={`overflow-hidden rounded-xl border bg-[#FFFAF3] transition-all ${
                      item.isPrimary || item.isBanner
                        ? "border-[#C9A96E]/60 ring-2 ring-[#C9A96E]/25"
                        : "border-[#1B3A5C]/8"
                    }`}
                  >
                    <div className="relative aspect-video bg-[#1B3A5C]/5">
                      {video ? (
                        <video src={item.url} className="h-full w-full object-cover" controls muted playsInline />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.url} alt={item.alt || "Property media"} className="h-full w-full object-cover" />
                      )}
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        {item.isPrimary && (
                          <span className="bg-[#1B3A5C] text-[#FFFAF3] text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full font-semibold">
                            Thumbnail
                          </span>
                        )}
                        {item.isBanner && (
                          <span className="bg-[#C9A96E] text-[#1B3A5C] text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full font-semibold">
                            Banner
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-2.5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5 text-xs text-[#1B3A5C]/60">
                          {video ? <Film className="h-3.5 w-3.5 shrink-0" /> : <ImageIcon className="h-3.5 w-3.5 shrink-0" />}
                          <span className="truncate">{item.alt || item.publicId}</span>
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-red-500 hover:bg-red-50 hover:text-red-700 shrink-0"
                          onClick={() => setMedia((prev) => prev.filter((mediaItem) => mediaItem.publicId !== item.publicId))}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {!video && (
                        <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-[#1B3A5C]/8">
                          <Button
                            type="button"
                            variant={item.isPrimary ? "default" : "outline"}
                            size="sm"
                            className={`h-7 text-[11px] rounded-lg ${
                              item.isPrimary
                                ? "bg-[#1B3A5C] text-[#FFFAF3] hover:bg-[#2A4F7A]"
                                : "border-[#1B3A5C]/15 text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 hover:bg-transparent"
                            }`}
                            onClick={() => handleSetMediaPrimary(item.publicId)}
                            title="Used on property listing cards"
                          >
                            <Star className={`w-3 h-3 mr-1 ${item.isPrimary ? "fill-current" : ""}`} />
                            {item.isPrimary ? "Thumbnail" : "Make Thumbnail"}
                          </Button>
                          <Button
                            type="button"
                            variant={item.isBanner ? "default" : "outline"}
                            size="sm"
                            className={`h-7 text-[11px] rounded-lg transition-all ${
                              item.isBanner
                                ? "bg-[#C9A96E] text-[#1B3A5C] hover:bg-[#b89556] font-semibold"
                                : "border-[#C9A96E]/40 text-[#C9A96E] hover:bg-[#C9A96E]/10 hover:text-[#1B3A5C] hover:border-[#C9A96E]/60"
                            }`}
                            onClick={() => handleSetMediaBanner(item.publicId)}
                            title={item.isBanner ? "Click to clear banner status" : "Set as large hero banner on the property detail page"}
                          >
                            <Monitor className={`w-3 h-3 mr-1 ${item.isBanner ? "fill-current" : ""}`} />
                            {item.isBanner ? "Banner" : "Make Banner"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard
          step="2"
          icon={Clapperboard}
          title={`Story Sections (Brochure Chapters)${storySections.length ? ` (${storySections.length})` : ""}`}
          description="Build editorial image-and-text chapters that narrate the design, craftsmanship, and soul of the stay."
        >
          <div className="space-y-4">
            {storySections.map((section, index) => (
              <div key={section.id ?? `new-section-${index}`} className="rounded-xl border border-[#1B3A5C]/10 bg-white p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#C9A96E]">Chapter {String(index + 1).padStart(2, "0")}</p>
                    <p className="mt-1 text-xs text-[#1B3A5C]/45">Simple image and text layout on the live page.</p>
                  </div>
                  <Button type="button" variant="ghost" size="icon-sm" className="text-red-500 hover:bg-red-50 hover:text-red-700" onClick={() => removeStorySection(index)} aria-label={`Remove story section ${index + 1}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label>
                        <span className="mb-1.5 block text-xs font-medium text-[#1B3A5C]">Section title *</span>
                        <Input value={section.title} onChange={(event) => updateStorySection(index, { title: event.target.value })} maxLength={160} placeholder="A home shaped by the valley" />
                      </label>
                      <label>
                        <span className="mb-1.5 block text-xs font-medium text-[#1B3A5C]">Small label</span>
                        <Input value={section.subtitle ?? ""} onChange={(event) => updateStorySection(index, { subtitle: event.target.value })} maxLength={160} placeholder="Architecture & place" />
                      </label>
                    </div>
                    <label>
                      <span className="mb-1.5 block text-xs font-medium text-[#1B3A5C]">Section text *</span>
                      <Textarea value={section.body} onChange={(event) => updateStorySection(index, { body: event.target.value })} maxLength={5000} className="min-h-[130px] resize-y leading-6" placeholder="Tell guests what makes this part of the stay special..." />
                    </label>
                  </div>

                  <div className="space-y-3">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#1B3A5C]/5">
                      {section.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={section.imageUrl} alt={section.title || `Story section ${index + 1}`} className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full place-items-center px-5 text-center text-xs text-[#1B3A5C]/35">
                          <ImageIcon className="mb-2 h-6 w-6 text-[#C9A96E]" />
                          Add a chapter image
                        </div>
                      )}
                    </div>
                    <MediaUploader
                      onAdd={(item) => updateStorySection(index, { imageUrl: item.url })}
                      multiple={false}
                      maxFiles={1}
                      kind="image"
                      label={section.imageUrl ? "Replace image" : "Upload image"}
                      folder={`properties/${initialData?.id ?? "draft"}/sections`}
                    />
                    {section.imageUrl ? (
                      <button type="button" onClick={() => updateStorySection(index, { imageUrl: "" })} className="text-[11px] font-medium text-red-600 hover:text-red-700">
                        Remove image
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addStorySection} className="w-full border-dashed border-[#C9A96E]/60 bg-[#C9A96E]/5 text-[#1B3A5C] hover:bg-[#C9A96E]/10">
              <Plus className="mr-2 h-4 w-4 text-[#C9A96E]" /> Add image & text section
            </Button>
          </div>
        </SectionCard>
      </div>
    )}

    {/* ─── TAB 4: CURATED EXPERIENCES ─── */}
    {(viewMode === "all" || activeTab === "experiences") && (
      <div id="tab-section-experiences" className="space-y-6 md:space-y-8">
        <SectionCard
          step="1"
          icon={Sparkles}
          title="Curated Experiences at the Property"
          description="Author bespoke encounters, rituals, guided walks, and tastings. Add a photo to display a full-bleed luxury visual card, or leave without a photo to portray as an architectural luxury typographic editorial card."
        >
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-[#FAF8F5] to-[#F5EFE6] border border-[#C9A96E]/30">
              <div>
                <p className="text-sm font-semibold text-[#1B3A5C] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C9A96E]" />
                  Curated Encounters Collection
                </p>
                <p className="text-xs text-[#1B3A5C]/60 mt-0.5">
                  {experiences.length === 0
                    ? "No custom experiences yet. Add an experience to showcase private activities to guests."
                    : `${experiences.length} curated experience${experiences.length === 1 ? "" : "s"} authored.`}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addExperience}
                className="bg-white border-[#C9A96E]/50 text-[#1B3A5C] hover:bg-[#C9A96E]/10 hover:border-[#C9A96E] font-medium text-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5 text-[#C9A96E]" />
                Add Experience
              </Button>
            </div>

            {experiences.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#1B3A5C]/15 p-8 text-center bg-[#FAF8F5]/50">
                <Compass className="w-8 h-8 text-[#C9A96E]/50 mx-auto mb-3" />
                <p className="text-sm font-medium text-[#1B3A5C]">No custom experiences added yet</p>
                <p className="text-xs text-[#1B3A5C]/50 mt-1 max-w-md mx-auto">
                  Curated experiences give your listing an elevated hotel-grade editorial feel. When a photo is provided, guests see a high-res photo card; without a photo, guests see a warm typographic card.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExperience}
                  className="mt-4 border-[#C9A96E]/50 text-[#1B3A5C] hover:bg-[#C9A96E]/15 text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1 text-[#C9A96E]" />
                  Add First Experience
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {experiences.map((exp, index) => {
                  const hasPhoto = Boolean(exp.imageUrl)
                  const numStr = String(index + 1).padStart(2, "0")
                  return (
                    <div
                      key={exp.id || index}
                      className="relative rounded-2xl border border-[#1B3A5C]/12 bg-white p-5 sm:p-6 shadow-xs transition-all hover:border-[#C9A96E]/50 hover:shadow-md"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1B3A5C]/8 pb-4 mb-5">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1B3A5C] text-[11px] font-bold text-[#FFFAF3]">
                            {numStr}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C9A96E]">
                            Experience {numStr}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide ${
                              hasPhoto
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {hasPhoto ? "📸 Photo Card Mode" : "🖋️ Typographic Luxury Card"}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExperience(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2.5 text-xs self-end sm:self-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Remove
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6 items-start">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-xs font-medium text-[#1B3A5C]">
                              Experience Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              value={exp.title}
                              onChange={(e) => updateExperience(index, { title: e.target.value })}
                              placeholder="e.g. Sunrise Over Sarangkot, Sunset Tibetan Tea Tasting"
                              className="mt-1.5"
                            />
                          </div>

                          <div>
                            <Label className="text-xs font-medium text-[#1B3A5C]">
                              Narrative Description <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                              value={exp.description}
                              onChange={(e) => updateExperience(index, { description: e.target.value })}
                              placeholder="Describe the atmosphere, timing, guided details, and what makes this encounter memorable..."
                              className="mt-1.5 min-h-[95px] resize-y"
                            />
                          </div>
                        </div>

                        {/* Photo Uploader / Preview Column */}
                        <div className="rounded-xl border border-[#1B3A5C]/10 bg-[#FAF8F5] p-3.5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-[#1B3A5C]">
                              Experience Photo
                            </span>
                            <span className="text-[10px] text-[#1B3A5C]/50">
                              {hasPhoto ? "Attached" : "Optional"}
                            </span>
                          </div>

                          {hasPhoto ? (
                            <div className="space-y-2">
                              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-[#1B3A5C]/10 bg-black/5">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={exp.imageUrl!}
                                  alt={exp.title || "Experience preview"}
                                  className="h-full w-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateExperience(index, { imageUrl: "" })}
                                  className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
                                  title="Remove photo (will switch to typographic card)"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <p className="text-[10px] text-emerald-700 font-medium text-center">
                                ✓ Photo active
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="aspect-[4/3] w-full rounded-lg border border-dashed border-[#C9A96E]/40 bg-gradient-to-b from-white to-[#F5EFE6] p-3 flex flex-col items-center justify-center text-center">
                                <Sparkles className="w-5 h-5 text-[#C9A96E] mb-1.5" />
                                <p className="text-[11px] font-semibold text-[#1B3A5C]">Typographic Mode</p>
                                <p className="text-[9px] text-[#1B3A5C]/55 mt-0.5 max-w-[170px]">
                                  Will portray with gold monogram & watermark numeral
                                </p>
                              </div>
                              <MediaUploader
                                onAdd={(item) => updateExperience(index, { imageUrl: item.url })}
                                multiple={false}
                                maxFiles={1}
                                kind="image"
                                folder={`properties/${initialData?.id ?? "draft"}/experiences`}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExperience}
                  className="w-full border-dashed border-[#C9A96E]/50 text-[#1B3A5C] hover:bg-[#C9A96E]/10 py-5 text-xs font-medium"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5 text-[#C9A96E]" />
                  Add Another Experience
                </Button>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    )}

    {/* ─── TAB 5: AMENITIES & LOGISTICS ─── */}
    {(viewMode === "all" || activeTab === "amenities") && (
      <div id="tab-section-amenities" className="space-y-6 md:space-y-8">
        <SectionCard
          step="1"
          icon={ListChecks}
          title="Client-Facing Property Features & Logistics"
          description="These details appear on the public property page and help guests quickly understand what makes the stay valuable."
        >
          <FormItem>
            <div className="flex items-center justify-between">
              <div>
                <FormLabel>What to Expect (icon strip)</FormLabel>
                <p className="text-[12px] text-[#1B3A5C]/45">Select features to show as icons near the top of the public page.</p>
              </div>
              <span className="text-xs font-medium text-[#1B3A5C]/35 tabular-nums">{(form.watch("whatToExpect") || []).length} selected</span>
            </div>
            {availableFeatures.length === 0 ? (
              <p className="text-[12px] text-[#1B3A5C]/40 bg-[#FFFAF3] border border-dashed border-[#1B3A5C]/15 rounded-xl p-4">
                No features defined yet. <a href="/admin/settings/features" className="text-[#C9A96E] underline">Add features in Settings</a>.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
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
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[13px] transition-colors ${
                        selected
                          ? "bg-[#1B3A5C] text-[#FFFAF3] border-[#1B3A5C]"
                          : "bg-[#FFFAF3] text-[#1B3A5C]/60 border-[#1B3A5C]/10 hover:border-[#1B3A5C]/25"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${selected ? "text-[#C9A96E]" : "text-[#1B3A5C]/35"}`} strokeWidth={1} />
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
          <div className="rounded-xl border border-[#1B3A5C]/8 bg-[#FFFAF3] p-4 space-y-3">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1B3A5C]">Stay Details rows</p>
                <p className="text-[11px] text-[#1B3A5C]/45">Custom label/value facts (e.g. Guest Rooms · 8, Setting · Eastern Hills). Leave empty to show bedrooms/bathrooms/capacity automatically.</p>
              </div>
              <Button type="button" variant="outline" size="sm" className="shrink-0 rounded-lg border-[#1B3A5C]/15 text-[#1B3A5C]/60 text-[12px] font-medium hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 bg-transparent" onClick={addStayDetail}>
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add row
              </Button>
            </div>
            {stayDetails.length > 0 && (
              <div className="space-y-2">
                {stayDetails.map((row, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2">
                    <Input value={row.label} onChange={(e) => updateStayDetail(i, { label: e.target.value })} placeholder="Label (e.g. Guest Rooms)" className="min-w-[10rem] flex-1" />
                    <Input value={row.value} onChange={(e) => updateStayDetail(i, { value: e.target.value })} placeholder="Value (e.g. 8 rooms)" className="min-w-[10rem] flex-1" />
                    <Button type="button" variant="ghost" size="icon-sm" className="shrink-0 text-red-500 hover:bg-red-50" onClick={() => removeStayDetail(i)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Getting Here — travel times */}
          <div className="rounded-xl border border-[#1B3A5C]/8 bg-[#FFFAF3] p-4 space-y-3">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1B3A5C]">Getting Here (travel times)</p>
                <p className="text-[11px] text-[#1B3A5C]/45">Shown as a &ldquo;Getting Here&rdquo; section, e.g. <strong>2hr 30 mins</strong> · From Donyi Polo Airport, Itanagar · 128 km.</p>
              </div>
              <Button type="button" variant="outline" size="sm" className="shrink-0 rounded-lg border-[#1B3A5C]/15 text-[#1B3A5C]/60 text-[12px] font-medium hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 bg-transparent" onClick={addGettingHere}>
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add leg
              </Button>
            </div>
            {gettingHere.length > 0 && (
              <div className="space-y-2">
                {gettingHere.map((row, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2">
                    <Input value={row.time} onChange={(e) => updateGettingHere(i, { time: e.target.value })} placeholder="Time (e.g. 2hr 30 mins)" className="min-w-[9rem] flex-1" />
                    <Input value={row.from} onChange={(e) => updateGettingHere(i, { from: e.target.value })} placeholder="From (e.g. Donyi Polo Airport, Itanagar)" className="min-w-[12rem] flex-[2]" />
                    <Input value={row.distance ?? ""} onChange={(e) => updateGettingHere(i, { distance: e.target.value })} placeholder="Distance (e.g. 128 km)" className="min-w-[9rem] flex-1" />
                    <Button type="button" variant="ghost" size="icon-sm" className="shrink-0 text-red-500 hover:bg-red-50" onClick={() => removeGettingHere(i)}>
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
      </div>
    )}

    {/* ─── STEP PAGINATION (WHEN IN STEP MODE) ─── */}
    {viewMode === "step" && (
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#1B3A5C]/10">
        {currentTabIndex > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const prev = FORM_TABS[currentTabIndex - 1]
              if (prev) {
                setActiveTab(prev.id)
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
            }}
            className="border-[#1B3A5C]/15 text-[#1B3A5C] hover:bg-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous: {FORM_TABS[currentTabIndex - 1]?.label}
          </Button>
        ) : <div />}

        {currentTabIndex < FORM_TABS.length - 1 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const next = FORM_TABS[currentTabIndex + 1]
              if (next) {
                setActiveTab(next.id)
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
            }}
            className="border-[#C9A96E] text-[#1B3A5C] hover:bg-[#C9A96E]/15 font-semibold"
          >
            Next: {FORM_TABS[currentTabIndex + 1]?.label}
            <ChevronRight className="w-4 h-4 ml-1 text-[#C9A96E]" />
          </Button>
        )}
      </div>
    )}

    {/* Bottom submit row with status */}
    <div className="pt-4 space-y-4">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-[13px] text-red-950 shadow-sm transition-all">
          <div className="flex items-start gap-3.5">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <p className="font-semibold text-red-900 text-sm">Cannot Save Property Yet</p>
              <div className="whitespace-pre-line text-red-800 font-sans text-xs leading-relaxed">
                {error}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-700 p-1 rounded-lg hover:bg-red-100/50 transition-colors"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#FFFAF3] border border-[#1B3A5C]/12 shadow-sm">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[#1B3A5C]">
              {initialData ? "Update Property Listing" : "Create New Property Listing"}
            </p>
            <span className="px-2.5 py-0.5 rounded-full bg-[#C9A96E]/20 text-[#1B3A5C] text-[10px] font-bold uppercase tracking-wider">
              {form.watch("status") || "DRAFT"}
            </span>
          </div>
          <p className="text-xs text-[#1B3A5C]/55 mt-1">
            {form.watch("title") ? `Listing: ${form.watch("title")}` : "Complete required fields marked with * to publish"}
          </p>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full sm:w-auto rounded-xl bg-[#1B3A5C] text-[#FFFAF3] text-[13px] font-semibold tracking-wide hover:bg-[#2A4F7A] px-8 min-h-[46px] shadow-sm disabled:opacity-50 transition-all"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving Property...
            </>
          ) : initialData ? (
            "Update Property"
          ) : (
            "Create Property"
          )}
        </Button>
      </div>
    </div>
  </div>

  {/* Side-by-side live preview of the real public page (desktop) */}
  {showPreview && (
    <div className="hidden xl:block sticky top-6">
      <PropertyFormPreview property={previewProperty} />
    </div>
  )}
  </div>
  </form>
</Form>
  )
}
