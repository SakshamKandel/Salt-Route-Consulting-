"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { upsertPropertyAction } from "./actions"
import { PropertyStatus } from "@prisma/client"
import { Film, Image as ImageIcon, Sparkles, Trash2 } from "lucide-react"
import { isVideoUrl } from "@/lib/property-media"
import { MediaUploader, type UploadedMedia } from "@/components/admin/media-uploader"

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must use lowercase letters, numbers, and hyphens only"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(3, "Location is required"),
  address: z.string().optional(),
  bedrooms: z.number({ error: "Enter a number" }).int().min(0),
  bathrooms: z.number({ error: "Enter a number" }).int().min(0),
  maxGuests: z.number({ error: "Enter a number" }).int().min(1, "At least 1 guest"),
  pricePerNight: z.number({ error: "Enter a price" }).positive("Price must be greater than 0"),
  highlightsText: z.string().max(4000, "Features list is too long").optional(),
  amenitiesText: z.string().max(8000, "Amenities list is too long").optional(),
  rulesText: z.string().max(4000, "House rules list is too long").optional(),

  status: z.nativeEnum(PropertyStatus),
  ownerId: z.string().min(1, "Pick an owner"),
})

type PropertyFormValues = z.infer<typeof schema>
type PropertyFormInitialData = Omit<Partial<PropertyFormValues>, "address" | "pricePerNight"> & {
  id?: string
  address?: string | null
  pricePerNight?: number | { toString(): string } | null
  highlights?: string[] | null
  amenities?: string[] | null
  rules?: string[] | null
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

function BulkListTextarea({
  label,
  description,
  value,
  onChange,
  placeholder,
  minHeight = "min-h-[120px]",
  maxItems = 80,
}: {
  label: string
  description: string
  value?: string
  onChange: (value: string) => void
  placeholder: string
  minHeight?: string
  maxItems?: number
}) {
  const count = parseBulkList(value, maxItems).length

  return (
    <FormItem>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <FormLabel>{label}</FormLabel>
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
}: {
  owners: { id: string, name: string | null, email: string }[];
  initialData?: PropertyFormInitialData;
  knownLocations?: string[];
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [media, setMedia] = useState<PropertyMediaDraft[]>([])

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      address: initialData?.address || "",
      bedrooms: initialData?.bedrooms ?? 1,
      bathrooms: initialData?.bathrooms ?? 1,
      maxGuests: initialData?.maxGuests ?? 2,
      pricePerNight: initialData?.pricePerNight ? Number(initialData.pricePerNight) : 100,
      highlightsText: listToText(initialData?.highlights),
      amenitiesText: listToText(initialData?.amenities),
      rulesText: listToText(initialData?.rules),

      status: initialData?.status || "DRAFT",
      ownerId: initialData?.ownerId || "",
    }
  })
  function slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  async function onSubmit(data: PropertyFormValues) {
    setIsPending(true)
    setError(null)
    const { highlightsText, amenitiesText, rulesText, ...propertyData } = data
    const res = await upsertPropertyAction(
      {
        ...propertyData,
        highlights: parseBulkList(highlightsText, 40),
        amenities: parseBulkList(amenitiesText, 80),
        rules: parseBulkList(rulesText, 40),
        media,
      },
      initialData?.id
    )
    if (res.error) {
      setError(res.error)
      setIsPending(false)
    } else {
      // Redirect to images page to complete setup
      router.push(`/admin/properties/${res.id}/images`)
    }
  }

  function handleAddMedia(item: UploadedMedia) {
    setMedia((prev) => [...prev, item])
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {error && <div className="text-red-500 bg-red-50 p-4 rounded-md">{error}</div>}

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

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea className="min-h-[150px]" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

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
            <FormControl><Input {...field} placeholder="Optional — exact street address" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField control={form.control} name="bedrooms" render={({ field }) => (
            <FormItem><FormLabel>Bedrooms</FormLabel><FormControl><Input type="number" {...field} onChange={e => {
                const v = e.target.valueAsNumber
                field.onChange(Number.isNaN(v) ? undefined : v)
              }} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="bathrooms" render={({ field }) => (
            <FormItem><FormLabel>Bathrooms</FormLabel><FormControl><Input type="number" {...field} onChange={e => {
                const v = e.target.valueAsNumber
                field.onChange(Number.isNaN(v) ? undefined : v)
              }} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="maxGuests" render={({ field }) => (
            <FormItem><FormLabel>Max Guests</FormLabel><FormControl><Input type="number" {...field} onChange={e => {
                const v = e.target.valueAsNumber
                field.onChange(Number.isNaN(v) ? undefined : v)
              }} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="pricePerNight" render={({ field }) => (
            <FormItem><FormLabel>Price Per Night (NPR)</FormLabel><FormControl><Input type="number" {...field} onChange={e => {
                const v = e.target.valueAsNumber
                field.onChange(Number.isNaN(v) ? undefined : v)
              }} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 space-y-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-navy shadow-sm">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-semibold text-navy">Client-Facing Property Features</h3>
              <p className="text-sm text-slate-500">
                These details appear on the public property page and help guests quickly understand what makes the stay valuable.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <FormField control={form.control} name="highlightsText" render={({ field }) => (
              <BulkListTextarea
                label="Additional Features"
                description="Standout selling points clients should notice first."
                value={field.value}
                onChange={field.onChange}
                placeholder={"Private pool\nMountain-view balcony\nDedicated workspace\nChef on request"}
                maxItems={40}
              />
            )} />

            <FormField control={form.control} name="amenitiesText" render={({ field }) => (
              <BulkListTextarea
                label="Amenities"
                description="Comforts, services, and facilities available at the property."
                value={field.value}
                onChange={field.onChange}
                placeholder={"High-speed WiFi\nParking\nAirport transfer\nFully equipped kitchen"}
              />
            )} />
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

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 space-y-6">
          <div>
            <h3 className="font-semibold text-navy">Property Media{media.length > 0 ? ` (${media.length})` : ""}</h3>
            <p className="text-sm text-slate-500">
              Upload photos and videos in their own sections. After saving you can add more, reorder them, and pick a primary cover image.
            </p>
          </div>

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
        </div>

        <Button type="submit" className="bg-navy text-cream w-full" disabled={isPending}>
          {isPending ? "Saving..." : initialData ? "Update Property" : "Create Property"}
        </Button>
      </form>
    </Form>
  )
}
