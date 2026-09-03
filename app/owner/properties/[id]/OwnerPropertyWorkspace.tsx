"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Bath,
  BedDouble,
  CalendarClock,
  Check,
  ChevronRight,
  Clock,
  Edit3,
  ExternalLink,
  Eye,
  Film,
  Home,
  ImageOff,
  LayoutGrid,
  ListChecks,
  MapPin,
  MessageSquareQuote,
  Star,
  Users,
} from "lucide-react"
import { PropertyFormPreview } from "@/components/admin/property-form-preview"
import type { PropertyDetail } from "@/components/public/property/types"
import { isVideoUrl } from "@/lib/property-media"
import { formatNpr } from "@/lib/currency"

const NAVY = "#1B3A5C"
const GOLD = "#C9A96E"

const STATUS_CHIP: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-600 ring-emerald-200/60",
  DRAFT: "bg-amber-50 text-amber-600 ring-amber-200/60",
  PENDING: "bg-sky-50 text-sky-600 ring-sky-200/60",
  ARCHIVED: "bg-[#1B3A5C]/5 text-[#1B3A5C]/50 ring-[#1B3A5C]/10",
}

const TABS = [
  { key: "overview", label: "Overview", icon: Home },
  { key: "gallery", label: "Gallery", icon: LayoutGrid },
  { key: "features", label: "Features", icon: ListChecks },
  { key: "reviews", label: "Reviews", icon: MessageSquareQuote },
  { key: "preview", label: "Live Preview", icon: Eye },
] as const

type TabKey = (typeof TABS)[number]["key"]

export type OwnerPropertyStats = {
  bookings: number
  revenue: string
  avgRating: string | null
  reviewCount: number
  nights: number
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-[#1B3A5C]/8 bg-[#FFFAF3] p-4 sm:p-5">
      <p className="text-xl font-semibold tabular-nums leading-tight text-[#1B3A5C] sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-[#1B3A5C]/35">
        {label}
      </p>
      {hint ? <p className="mt-1 text-[10.5px] text-[#1B3A5C]/30">{hint}</p> : null}
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1B3A5C]/8 bg-[#FFFAF3]">
      <div className="border-b border-[#1B3A5C]/5 px-5 py-3.5">
        <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#1B3A5C]/45">
          {title}
        </h2>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  )
}

function ChipList({ items, tone = "gold" }: { items: string[]; tone?: "gold" | "plain" }) {
  if (!items.length) {
    return <p className="text-[12px] text-[#1B3A5C]/30">Nothing listed yet.</p>
  }
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-[12.5px] text-[#1B3A5C]/60">
          {tone === "gold" ? (
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C9A96E]" />
          ) : (
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#C9A96E]/60" />
          )}
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function OwnerPropertyWorkspace({
  property,
  stats,
}: {
  property: PropertyDetail
  stats: OwnerPropertyStats
}) {
  const [tab, setTab] = useState<TabKey>("overview")

  const chip = STATUS_CHIP[property.status ?? "DRAFT"] ?? STATUS_CHIP.ARCHIVED
  const images = property.images ?? []
  const videoCount = images.filter((i) => isVideoUrl(i.url)).length
  const photoCount = images.length - videoCount

  return (
    <div className="space-y-7 pb-12">
      {/* ── BREADCRUMB ── */}
      <div className="flex items-center gap-1.5 text-[11px] font-medium">
        <Link
          href="/owner/properties"
          className="text-[#1B3A5C]/40 transition-colors hover:text-[#1B3A5C]"
        >
          Properties
        </Link>
        <ChevronRight className="h-3 w-3 text-[#1B3A5C]/25" />
        <span className="truncate text-[#1B3A5C]/70">{property.title}</span>
      </div>

      {/* ── HERO HEADER ── */}
      <div className="overflow-hidden rounded-2xl border border-[#1B3A5C]/8 bg-[#FFFAF3]">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_1fr]">
          <div className="relative aspect-[16/10] overflow-hidden bg-[#1B3A5C]/5 lg:aspect-auto lg:min-h-[280px]">
            {images[0] ? (
              isVideoUrl(images[0].url) ? (
                <video
                  src={images[0].url}
                  muted
                  className="h-full w-full object-cover"
                  poster={images.find((i) => !isVideoUrl(i.url))?.url}
                />
              ) : (
                <Image
                  src={images[0].url}
                  alt={property.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              )
            ) : (
              <div className="flex h-full flex-col items-center justify-center">
                <ImageOff className="mb-2 h-6 w-6 text-[#1B3A5C]/15" />
                <p className="text-[12px] text-[#1B3A5C]/30">No cover photo yet</p>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-4">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] ring-1 ${chip}`}
                >
                  {property.status}
                </span>
                {property.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FFFAF3]/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#A8863F] ring-1 ring-[#C9A96E]/40">
                    <Star className="h-2.5 w-2.5" />
                    Featured
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5 p-6 sm:p-7">
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#C9A96E]">
                <MapPin className="h-3 w-3" />
                {property.location}
              </p>
              <h1 className="mt-2 font-display text-2xl tracking-wide text-[#1B3A5C] md:text-3xl">
                {property.title}
              </h1>
              {property.tagline && (
                <p className="mt-1.5 font-display text-[13px] italic text-[#1B3A5C]/45">
                  {property.tagline}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-[#1B3A5C]/45">
                <span className="inline-flex items-center gap-1.5">
                  <BedDouble className="h-3.5 w-3.5 text-[#1B3A5C]/25" />
                  {property.bedrooms} bed
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Bath className="h-3.5 w-3.5 text-[#1B3A5C]/25" />
                  {property.bathrooms} bath
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-[#1B3A5C]/25" />
                  Sleeps {property.maxGuests}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5 text-[#1B3A5C]/25" />
                  {property.hidePrice ? (
                    <span className="text-[#C9A96E] font-medium">Request a Quote</span>
                  ) : (
                    `${formatNpr(property.pricePerNight)} / night`
                  )}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link
                href={`/properties/${property.slug}?preview=1`}
                className="inline-flex items-center gap-2 rounded-lg bg-[#1B3A5C] px-4 py-2.5 text-[12px] font-medium text-[#FFFAF3] transition-colors hover:bg-[#2A4F7A]"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open public preview
              </Link>
              <Link
                href={`/owner/request-edit?propertyId=${property.id}`}
                className="inline-flex items-center gap-2 rounded-lg border border-[#1B3A5C]/15 px-4 py-2.5 text-[12px] font-medium text-[#1B3A5C] transition-colors hover:border-[#C9A96E]/50"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Request update
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── PERFORMANCE METRICS ── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard label="Confirmed stays" value={String(stats.bookings)} />
        <StatCard label="Nights hosted" value={String(stats.nights)} />
        <StatCard
          label="Guest rating"
          value={stats.avgRating ? `${stats.avgRating} / 5` : "—"}
          hint={`${stats.reviewCount} review${stats.reviewCount === 1 ? "" : "s"}`}
        />
        <StatCard label="Lifetime revenue" value={stats.revenue} />
        <StatCard
          label="Media"
          value={String(photoCount)}
          hint={videoCount ? `${videoCount} video${videoCount === 1 ? "" : "s"}` : "photos only"}
        />
      </div>

      {/* ── TAB NAV ── */}
      <div className="flex gap-1 overflow-x-auto border-b border-[#1B3A5C]/8">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = tab === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-[12px] font-medium transition-colors ${
                active
                  ? "border-[#C9A96E] text-[#1B3A5C]"
                  : "border-transparent text-[#1B3A5C]/40 hover:text-[#1B3A5C]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          )
        })}
      </div>

      {/* ── TAB: OVERVIEW ── */}
      {tab === "overview" && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <Panel title="Property story">
              <p className="text-[13px] leading-relaxed text-[#1B3A5C]/60">
                {property.description}
              </p>
              {property.story && (
                <p className="mt-4 border-t border-[#1B3A5C]/5 pt-4 text-[13px] leading-relaxed text-[#1B3A5C]/50">
                  {property.story}
                </p>
              )}
            </Panel>

            {property.highlights.length > 0 && (
              <Panel title="Highlights">
                <ChipList items={property.highlights} />
              </Panel>
            )}
          </div>

          <div className="space-y-5">
            <Panel title="Stay details">
              <dl className="space-y-3 text-[12.5px]">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#1B3A5C]/45">Property type</dt>
                  <dd className="font-medium text-[#1B3A5C]">{property.propertyType ?? "—"}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#1B3A5C]/45">Units</dt>
                  <dd className="font-medium text-[#1B3A5C]">{property.totalUnits ?? 1}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#1B3A5C]/45">Check in</dt>
                  <dd className="inline-flex items-center gap-1.5 font-medium text-[#1B3A5C]">
                    <Clock className="h-3 w-3 text-[#1B3A5C]/30" />
                    {property.checkInTime ?? "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#1B3A5C]/45">Check out</dt>
                  <dd className="inline-flex items-center gap-1.5 font-medium text-[#1B3A5C]">
                    <Clock className="h-3 w-3 text-[#1B3A5C]/30" />
                    {property.checkOutTime ?? "—"}
                  </dd>
                </div>
              </dl>
              {property.address && (
                <p className="mt-4 flex items-start gap-2 border-t border-[#1B3A5C]/5 pt-4 text-[12px] text-[#1B3A5C]/50">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-[#C9A96E]" />
                  {property.address}
                </p>
              )}
            </Panel>

            {property.rules.length > 0 && (
              <Panel title="House rules">
                <ChipList items={property.rules} tone="plain" />
              </Panel>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: GALLERY ── */}
      {tab === "gallery" && (
        <Panel title={`Media · ${images.length}`}>
          {images.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((img) => {
                const isVid = isVideoUrl(img.url)
                return (
                  <div
                    key={img.id}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-[#1B3A5C]/8 bg-[#1B3A5C]/5"
                  >
                    {isVid ? (
                      <video src={img.url} muted className="h-full w-full object-cover" />
                    ) : (
                      <Image
                        src={img.url}
                        alt={img.alt ?? property.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    {isVid && (
                      <span className="absolute left-2 top-2 rounded bg-[#1B3A5C]/85 p-1 text-[#FFFAF3]">
                        <Film className="h-3 w-3" />
                      </span>
                    )}
                    {img.isPrimary && !isVid && (
                      <span className="absolute left-2 top-2 rounded bg-[#1B3A5C]/85 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.14em] text-[#FFFAF3]">
                        Cover
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <ImageOff className="mb-3 h-6 w-6 text-[#1B3A5C]/15" />
              <p className="text-[13px] text-[#1B3A5C]/35">No media uploaded yet</p>
              <p className="mt-1 text-[11px] text-[#1B3A5C]/25">
                Request an update to have photography added
              </p>
            </div>
          )}
        </Panel>
      )}

      {/* ── TAB: FEATURES ── */}
      {tab === "features" && (
        <div className="grid gap-5 lg:grid-cols-3">
          <Panel title="Amenities">
            <ChipList items={property.amenities} />
          </Panel>
          <Panel title="Services">
            <ChipList items={property.services ?? []} />
          </Panel>
          <Panel title="What to expect">
            <ChipList items={property.whatToExpect ?? []} />
          </Panel>
        </div>
      )}

      {/* ── TAB: REVIEWS ── */}
      {tab === "reviews" && (
        <Panel title={`Published reviews · ${stats.reviewCount}`}>
          {property.reviews?.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {property.reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-xl border border-[#1B3A5C]/8 bg-white p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-[12px] font-semibold text-[#1B3A5C]">
                      {review.guest.name ?? "Anonymous Guest"}
                    </p>
                    <div className="flex shrink-0 items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating ? "fill-[#C9A96E] text-[#C9A96E]" : "text-[#1B3A5C]/15"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-[12.5px] leading-relaxed text-[#1B3A5C]/55">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                  <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-[#1B3A5C]/30">
                    {new Date(review.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <MessageSquareQuote className="mb-3 h-6 w-6 text-[#1B3A5C]/15" />
              <p className="text-[13px] text-[#1B3A5C]/35">No published reviews yet</p>
            </div>
          )}
        </Panel>
      )}

      {/* ── TAB: LIVE PREVIEW ── */}
      {tab === "preview" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#C9A96E]/25 bg-[#C9A96E]/6 px-4 py-3">
            <p className="text-[11.5px] text-[#1B3A5C]/60">
              This is the <strong className="text-[#1B3A5C]">live public brochure</strong> for this
              property, rendered from the current saved data.
            </p>
            <Link
              href={`/properties/${property.slug}?preview=1`}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#A8863F] hover:underline"
            >
              Open full size
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <PropertyFormPreview property={property} />
        </div>
      )}

      {/* ── FOOTER CTA ── */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#1B3A5C]/8 bg-[#FFFAF3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[13px] font-semibold text-[#1B3A5C]">Need to update this property?</p>
          <p className="mt-0.5 text-[12px] text-[#1B3A5C]/45">
            Send calendar, feature, amenity, pricing, or photo updates to the Salt Route team.
          </p>
        </div>
        <Link
          href={`/owner/request-edit?propertyId=${property.id}`}
          className="inline-flex shrink-0 items-center rounded-lg bg-[#1B3A5C] px-4 py-2 text-[12px] font-medium text-[#FFFAF3] transition-colors hover:bg-[#2A4F7A] sm:self-auto"
        >
          Request update
        </Link>
      </div>
    </div>
  )
}
