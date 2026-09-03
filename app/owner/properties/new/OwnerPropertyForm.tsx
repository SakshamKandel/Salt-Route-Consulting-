"use client"

import { useMemo, useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  ExternalLink,
  ImageOff,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react"
import { MediaUploader, type UploadedMedia } from "@/components/admin/media-uploader"
import { PropertyFormPreview } from "@/components/admin/property-form-preview"
import { PropertyAiAssistant, type GeneratedFields } from "@/components/admin/property-ai-assistant"
import type { PropertyDetail } from "@/components/public/PropertyDetailClient"
import { isVideoUrl } from "@/lib/property-media"
import { createOwnerPropertyAction } from "./actions"

type Media = UploadedMedia

const PROPERTY_TYPES = [
  "Hotel",
  "Villa",
  "Boutique Hotel",
  "Private Residence",
  "Lodge",
  "Apartment",
  "Retreat",
  "Homestay",
]

const SUGGESTED_HIGHLIGHTS = [
  "Panoramic Himalayan views",
  "Private chef on request",
  "Sunrise tea ceremony",
  "Heritage architecture",
  "Organic kitchen garden",
]

const SUGGESTED_AMENITIES = [
  "High-speed Wi-Fi",
  "Private balcony",
  "Ensuite bathroom",
  "Mountain-view terrace",
  "Daily housekeeping",
  "Airport transfer",
  "Heating",
  "Free parking",
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

const fieldClass =
  "mt-1.5 min-h-11 w-full rounded-lg border border-[#1B3A5C]/12 bg-white px-3.5 py-2.5 text-[13px] text-[#1B3A5C] outline-none transition-colors placeholder:text-[#1B3A5C]/30 focus:border-[#C9A96E]"

const labelClass =
  "block text-[10px] font-medium uppercase tracking-[0.2em] text-[#1B3A5C]/45"

function SectionCard({
  step,
  title,
  hint,
  children,
}: {
  step: string
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-[#1B3A5C]/8 bg-[#FFFAF3] p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="mt-0.5 font-sans text-[11px] font-bold tracking-[0.2em] text-[#C9A96E]">
          {step}
        </span>
        <div>
          <h2 className="text-[14px] font-semibold text-[#1B3A5C]">{title}</h2>
          {hint ? <p className="mt-0.5 text-[11.5px] text-[#1B3A5C]/45">{hint}</p> : null}
        </div>
      </div>
      {children}
    </section>
  )
}

/** Small chip-list editor used for highlights and amenities. */
function ListEditor({
  items,
  onChange,
  placeholder,
  suggestions,
}: {
  items: string[]
  onChange: (next: string[]) => void
  placeholder: string
  suggestions: string[]
}) {
  const [draft, setDraft] = useState("")

  function add(value: string) {
    const clean = value.trim()
    if (!clean || items.includes(clean)) return
    onChange([...items, clean])
    setDraft("")
  }

  const remaining = suggestions.filter((s) => !items.includes(s))

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A96E]/35 bg-[#C9A96E]/8 px-3 py-1.5 text-[11.5px] text-[#1B3A5C]"
          >
            {item}
            <button
              type="button"
              onClick={() => onChange(items.filter((i) => i !== item))}
              className="text-[#1B3A5C]/35 transition-colors hover:text-red-600"
              aria-label={`Remove ${item}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              add(draft)
            }
          }}
          placeholder={placeholder}
          className="min-h-10 flex-1 rounded-lg border border-[#1B3A5C]/12 bg-white px-3 text-[12.5px] text-[#1B3A5C] outline-none placeholder:text-[#1B3A5C]/30 focus:border-[#C9A96E]"
        />
        <button
          type="button"
          onClick={() => add(draft)}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-[#1B3A5C] px-4 text-[11.5px] font-medium text-[#FFFAF3] transition-colors hover:bg-[#2A4F7A]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      {remaining.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.16em] text-[#1B3A5C]/30">
            Suggested
          </span>
          {remaining.slice(0, 5).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="rounded-full border border-dashed border-[#1B3A5C]/18 px-2.5 py-1 text-[11px] text-[#1B3A5C]/55 transition-colors hover:border-[#C9A96E]/50 hover:text-[#1B3A5C]"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function OwnerPropertyForm() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [tagline, setTagline] = useState("")
  const [propertyType, setPropertyType] = useState("Hotel")
  const [location, setLocation] = useState("")
  const [address, setAddress] = useState("")
  const [description, setDescription] = useState("")
  const [bedrooms, setBedrooms] = useState(1)
  const [bathrooms, setBathrooms] = useState(1)
  const [maxGuests, setMaxGuests] = useState(2)
  const [pricePerNight, setPricePerNight] = useState(10000)
  const [hidePrice, setHidePrice] = useState(false)
  const [checkInTime, setCheckInTime] = useState("2:00 PM")
  const [checkOutTime, setCheckOutTime] = useState("11:00 AM")
  const [highlights, setHighlights] = useState<string[]>([])
  const [amenities, setAmenities] = useState<string[]>([])
  const [media, setMedia] = useState<Media[]>([])

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<{ id: string; slug: string } | null>(null)

  const slug = slugify(title)

  const previewProperty = useMemo<PropertyDetail>(
    () => ({
      id: "owner-draft-preview",
      status: "DRAFT",
      title: title || "Your property name",
      slug: slug || "your-property",
      propertyType,
      description:
        description ||
        "Your property story will unfold here as you describe its setting, architecture, atmosphere, and guest experience.",
      tagline: tagline || "A distinctive stay, thoughtfully represented by Salt Route.",
      story: description || undefined,
      location: location || "Location, Nepal",
      address: address || undefined,
      maxGuests,
      bedrooms,
      bathrooms,
      pricePerNight,
      hidePrice,
      totalUnits: 1,
      checkInTime: checkInTime || undefined,
      checkOutTime: checkOutTime || undefined,
      highlights,
      amenities,
      rules: [],
      services: [],
      whatToExpect: [],
      images: media.map((item, index) => ({
        id: item.publicId || `owner-preview-${index}`,
        url: item.url,
        alt: item.alt ?? (title || "Property preview"),
        order: index,
        isPrimary: index === 0 && !isVideoUrl(item.url),
        isBanner: false,
      })),
      owner: { name: "You (Property Owner)", image: null },
      roomTypes: [],
      sections: [],
      reviews: [],
      _count: { reviews: 0 },
    }),
    [
      address,
      amenities,
      bathrooms,
      bedrooms,
      checkInTime,
      checkOutTime,
      description,
      highlights,
      location,
      maxGuests,
      media,
      pricePerNight,
      hidePrice,
      propertyType,
      slug,
      tagline,
      title,
    ],
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const result = await createOwnerPropertyAction({
      title,
      slug: slug || undefined,
      propertyType,
      description,
      tagline: tagline || undefined,
      location,
      address: address || undefined,
      bedrooms,
      bathrooms,
      maxGuests,
      pricePerNight,
      hidePrice,
      checkInTime: checkInTime || undefined,
      checkOutTime: checkOutTime || undefined,
      highlights,
      amenities,
      media: media.map((m) => ({ url: m.url, publicId: m.publicId, alt: m.alt ?? null })),
    })

    setSubmitting(false)

    if (!result.success) {
      setError(result.error)
      return
    }
    setCreated({ id: result.id, slug: result.slug })
    router.refresh()
  }

  function handleAiApply(fields: GeneratedFields) {
    if (fields.title) setTitle(fields.title)
    if (fields.tagline) setTagline(fields.tagline)
    if (fields.propertyType) setPropertyType(fields.propertyType)
    if (fields.location) setLocation(fields.location)
    if (fields.address) setAddress(fields.address)
    if (fields.description) setDescription(fields.description)
    if (typeof fields.bedrooms === "number") setBedrooms(fields.bedrooms)
    if (typeof fields.bathrooms === "number") setBathrooms(fields.bathrooms)
    if (typeof fields.maxGuests === "number") setMaxGuests(fields.maxGuests)
    if (typeof fields.pricePerNight === "number" && fields.pricePerNight > 0) setPricePerNight(fields.pricePerNight)
    if (fields.checkInTime) setCheckInTime(fields.checkInTime)
    if (fields.checkOutTime) setCheckOutTime(fields.checkOutTime)
    if (fields.highlights?.length) setHighlights(fields.highlights)
    if (fields.amenities?.length) setAmenities(fields.amenities)
  }

  if (created) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <div className="rounded-2xl border border-[#1B3A5C]/8 bg-[#FFFAF3] p-10">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-600" />
          <h1 className="font-display text-3xl text-[#1B3A5C]">Property submitted.</h1>
          <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-[#1B3A5C]/55">
            Your property is now saved as a <strong className="text-[#1B3A5C]/75">draft</strong>. The
            Salt Route team will review the details, enhance the photography where needed, and
            publish it to the collection.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/properties/${created.slug}?preview=1`}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#1B3A5C] px-6 text-[12px] font-medium text-[#FFFAF3] transition-colors hover:bg-[#2A4F7A]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Preview live page
            </Link>
            <Link
              href={`/owner/properties/${created.id}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#1B3A5C]/15 px-6 text-[12px] font-medium text-[#1B3A5C] transition-colors hover:border-[#C9A96E]/50"
            >
              Open in portfolio
            </Link>
            <Link
              href="/owner/properties"
              className="inline-flex min-h-11 items-center rounded-lg px-6 text-[12px] font-medium text-[#1B3A5C]/55 transition-colors hover:text-[#1B3A5C]"
            >
              Back to properties
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-12 lg:gap-7">
      {/* ─────────── FORM ─────────── */}
      <div className="space-y-5 lg:col-span-7">
        <PropertyAiAssistant onApply={handleAiApply} guided={false} />

        <SectionCard step="01" title="The essentials" hint="How your property is named and presented.">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className={labelClass}>Property name *</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={3}
                maxLength={160}
                placeholder="e.g. Sunshine Villa"
                className={fieldClass}
              />
              {slug && (
                <span className="mt-1 block font-mono text-[10.5px] text-[#1B3A5C]/35">
                  /properties/{slug}
                </span>
              )}
            </label>

            <label className="sm:col-span-2">
              <span className={labelClass}>Tagline</span>
              <input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                maxLength={200}
                placeholder="A quiet tea-garden retreat above the clouds"
                className={fieldClass}
              />
            </label>

            <label>
              <span className={labelClass}>Property type</span>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className={fieldClass}
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className={labelClass}>Nightly rate (NPR) *</span>
              <input
                type="number"
                min={0}
                value={pricePerNight}
                onChange={(e) => setPricePerNight(Number(e.target.value) || 0)}
                className={fieldClass}
              />
            </label>

            <label className="sm:col-span-2 flex items-start gap-3 p-3.5 rounded-xl border border-[#1B3A5C]/10 bg-[#1B3A5C]/[0.02] cursor-pointer">
              <input
                type="checkbox"
                checked={hidePrice}
                onChange={(e) => setHidePrice(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#1B3A5C]/20 text-[#1B3A5C] focus:ring-[#C9A96E]"
              />
              <div className="space-y-0.5">
                <span className="text-[13px] font-semibold text-[#1B3A5C]">Hide amount & show &ldquo;Request a Quote&rdquo;</span>
                <p className="text-[11.5px] text-[#1B3A5C]/55 leading-relaxed">Keep your pricing unrevealed on the public website and invite prospective guests to request a bespoke quote.</p>
              </div>
            </label>
          </div>
        </SectionCard>

        <SectionCard step="02" title="Location" hint="Where guests will find you.">
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={labelClass}>Location *</span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                minLength={3}
                maxLength={160}
                placeholder="e.g. Fikkal, Ilam"
                className={fieldClass}
              />
            </label>
            <label>
              <span className={labelClass}>Street address</span>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                maxLength={240}
                placeholder="Optional"
                className={fieldClass}
              />
            </label>
          </div>
        </SectionCard>

        <SectionCard step="03" title="Capacity &amp; timings" hint="Helps guests self-qualify before enquiring.">
          <div className="grid gap-4 sm:grid-cols-4">
            <label>
              <span className={labelClass}>Bedrooms</span>
              <input
                type="number"
                min={0}
                max={100}
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value) || 0)}
                className={fieldClass}
              />
            </label>
            <label>
              <span className={labelClass}>Bathrooms</span>
              <input
                type="number"
                min={0}
                max={100}
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value) || 0)}
                className={fieldClass}
              />
            </label>
            <label>
              <span className={labelClass}>Max guests</span>
              <input
                type="number"
                min={1}
                max={200}
                value={maxGuests}
                onChange={(e) => setMaxGuests(Number(e.target.value) || 1)}
                className={fieldClass}
              />
            </label>
            <label>
              <span className={labelClass}>Check in</span>
              <input
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                maxLength={40}
                className={fieldClass}
              />
            </label>
            <label>
              <span className={labelClass}>Check out</span>
              <input
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                maxLength={40}
                className={fieldClass}
              />
            </label>
          </div>
        </SectionCard>

        <SectionCard step="04" title="The story" hint="Write as you would describe it to a guest.">
          <label className="block">
            <span className={labelClass}>Description *</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={20}
              maxLength={4000}
              rows={6}
              placeholder="Describe the setting, the architecture, the light, and what a stay here feels like…"
              className={`${fieldClass} resize-y leading-relaxed`}
            />
            <span className="mt-1 block text-right text-[10.5px] text-[#1B3A5C]/30">
              {description.length} / 4000
            </span>
          </label>
        </SectionCard>

        <SectionCard step="05" title="Highlights" hint="The three or four things guests remember.">
          <ListEditor
            items={highlights}
            onChange={setHighlights}
            placeholder="e.g. Sunrise views over Kanchenjunga"
            suggestions={SUGGESTED_HIGHLIGHTS}
          />
        </SectionCard>

        <SectionCard step="06" title="Amenities" hint="Everything a guest can count on.">
          <ListEditor
            items={amenities}
            onChange={setAmenities}
            placeholder="e.g. Wood-fired hot shower"
            suggestions={SUGGESTED_AMENITIES}
          />
        </SectionCard>

        <SectionCard step="07" title="Photography" hint="The first photo becomes the cover image.">
          <MediaUploader
            kind="auto"
            multiple
            folder="salt-route/properties"
            onAdd={(item) => setMedia((prev) => [...prev, item])}
          />

          {media.length > 0 ? (
            <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {media.map((item, index) => (
                <div
                  key={`${item.publicId}-${index}`}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-[#1B3A5C]/8 bg-[#1B3A5C]/5"
                >
                  {isVideoUrl(item.url) ? (
                    <video src={item.url} muted className="h-full w-full object-cover" />
                  ) : (
                    <Image src={item.url} alt={item.alt ?? ""} fill className="object-cover" sizes="120px" />
                  )}
                  {index === 0 && !isVideoUrl(item.url) && (
                    <span className="absolute left-1.5 top-1.5 rounded bg-[#1B3A5C]/85 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.14em] text-[#FFFAF3]">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setMedia((prev) => prev.filter((_, i) => i !== index))}
                    className="absolute right-1.5 top-1.5 rounded bg-white/90 p-1 text-[#1B3A5C] opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                    aria-label="Remove media"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 flex flex-col items-center justify-center rounded-lg border border-dashed border-[#1B3A5C]/15 py-10">
              <ImageOff className="mb-2 h-5 w-5 text-[#1B3A5C]/15" />
              <p className="text-[12px] text-[#1B3A5C]/35">No media yet</p>
            </div>
          )}
        </SectionCard>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1B3A5C] px-8 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#FFFAF3] transition-colors hover:bg-[#2A4F7A] disabled:opacity-55"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            "Submit property for review"
          )}
        </button>
      </div>

      {/* ─────────── LIVE PREVIEW ─────────── */}
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#C9A96E]">
              <Sparkles className="h-3 w-3" />
              Live preview
            </p>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-amber-600 ring-1 ring-amber-200/60">
              Draft
            </span>
          </div>

          <PropertyFormPreview property={previewProperty} />

          <p className="mt-3 text-[11px] leading-relaxed text-[#1B3A5C]/35">
            This is the real public brochure layout, rendered from the form above. Owners submit a
            draft; the Salt Route team reviews, enriches, and publishes it.
          </p>
        </div>
      </div>
    </form>
  )
}
