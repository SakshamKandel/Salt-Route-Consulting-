"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Trash2, Star, ArrowUp, ArrowDown, Film, Image as ImageIcon, Monitor } from "lucide-react"
import {
  addPropertyImageAction,
  deletePropertyImageAction,
  setPrimaryImageAction,
  setBannerImageAction,
  reorderImagesAction,
} from "./actions"
import { isVideoUrl } from "@/lib/property-media"
import { MediaUploader, type UploadedMedia } from "@/components/admin/media-uploader"

type PropertyImage = {
  id: string
  url: string
  publicId: string
  alt: string | null
  order: number
  isPrimary: boolean
  isBanner: boolean
}

export function ImageManager({
  propertyId,
  initial,
}: {
  propertyId: string
  initial: PropertyImage[]
}) {
  const [images, setImages] = useState<PropertyImage[]>(
    [...initial].sort((a, b) => a.order - b.order)
  )
  const [pending, setPending] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  const handleAddMedia = async (item: UploadedMedia) => {
    setPending("upload")
    await addPropertyImageAction(propertyId, item.url, item.publicId, item.alt ?? undefined)

    setImages((prev) => {
      const uploadedIsVideo = isVideoUrl(item.url)
      const hasImage = prev.some((img) => !isVideoUrl(img.url))

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          url: item.url,
          publicId: item.publicId,
          alt: item.alt || null,
          order: prev.length,
          isPrimary: !uploadedIsVideo && !hasImage,
          isBanner: false,
        },
      ]
    })
    setPending(null)
    showMsg("success", "Media added successfully.")
  }

  const handleDelete = async (imageId: string) => {
    if (!confirm("Delete this media item?")) return
    setPending(imageId)
    const res = await deletePropertyImageAction(imageId, propertyId)
    if (res?.error) {
      showMsg("error", res.error)
    } else {
      setImages((prev) => {
        const filtered = prev.filter((img) => img.id !== imageId)
        if (prev.find((img) => img.id === imageId)?.isPrimary && filtered.length > 0) {
          const nextPrimaryIndex = filtered.findIndex((img) => !isVideoUrl(img.url))
          if (nextPrimaryIndex >= 0) {
            filtered[nextPrimaryIndex] = { ...filtered[nextPrimaryIndex], isPrimary: true }
          }
        }
        return filtered
      })
      showMsg("success", "Media deleted.")
    }
    setPending(null)
  }

  const handleSetPrimary = async (imageId: string) => {
    setPending(imageId + "-primary")
    const res = await setPrimaryImageAction(imageId, propertyId)
    if (res?.error) {
      showMsg("error", res.error)
    } else {
      setImages((prev) =>
        prev.map((img) => ({ ...img, isPrimary: img.id === imageId }))
      )
      showMsg("success", "Thumbnail updated.")
    }
    setPending(null)
  }

  const handleSetBanner = async (imageId: string) => {
    setPending(imageId + "-banner")
    const res = await setBannerImageAction(imageId, propertyId)
    if (res?.error) {
      showMsg("error", res.error)
    } else {
      setImages((prev) =>
        prev.map((img) => ({ ...img, isBanner: img.id === imageId }))
      )
      showMsg("success", "Banner image updated.")
    }
    setPending(null)
  }

  const handleMove = async (index: number, direction: "up" | "down") => {
    const newImages = [...images]
    const swapIndex = direction === "up" ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= newImages.length) return

    ;[newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]]
    const reordered = newImages.map((img, i) => ({ ...img, order: i }))
    setImages(reordered)

    setPending("reorder")
    await reorderImagesAction(propertyId, reordered.map((img) => img.id))
    setPending(null)
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white border rounded-xl p-5 space-y-5">
        <div>
          <h3 className="font-semibold text-navy">Upload New Media{images.length > 0 ? ` · ${images.length} on file` : ""}</h3>
          <p className="text-sm text-slate-500">Photos and videos have separate uploaders. Click upload again to add more.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-200 p-4 space-y-2">
            <div>
              <h4 className="text-sm font-semibold text-navy">Photos</h4>
              <p className="text-xs text-slate-500">JPG, PNG, WEBP, AVIF. Up to 30 at once.</p>
            </div>
            <MediaUploader onAdd={handleAddMedia} multiple maxFiles={30} kind="image" />
          </div>

          <div className="rounded-lg border border-slate-200 p-4 space-y-2">
            <div>
              <h4 className="text-sm font-semibold text-navy">Videos</h4>
              <p className="text-xs text-slate-500">MP4, WEBM, MOV. Up to 200 MB per video.</p>
            </div>
            <MediaUploader onAdd={handleAddMedia} multiple maxFiles={10} kind="video" />
          </div>
        </div>

        {pending === "upload" && <p className="text-xs text-slate-500">Saving...</p>}
      </div>

      {images.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center">
          <p className="text-slate-400">No media yet. Upload the first photo or video above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {images.map((img, index) => (
            (() => {
              const isVideo = isVideoUrl(img.url)
              return (
            <div
              key={img.id}
              className={`bg-white border rounded-xl overflow-hidden shadow-sm ${
                img.isPrimary || img.isBanner ? "ring-2 ring-navy" : ""
              }`}
            >
              <div className="relative aspect-video">
                {isVideo ? (
                  <video
                    src={img.url}
                    className="h-full w-full object-cover"
                    controls
                    muted
                    playsInline
                  />
                ) : (
                  <Image
                    src={img.url}
                    alt={img.alt || "Property image"}
                    fill
                    className="object-cover"
                  />
                )}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  {img.isPrimary && (
                    <span className="bg-navy text-cream text-xs px-2 py-0.5 rounded-full font-medium">
                      Thumbnail
                    </span>
                  )}
                  {img.isBanner && (
                    <span className="bg-gold text-charcoal text-xs px-2 py-0.5 rounded-full font-medium">
                      Banner
                    </span>
                  )}
                </div>
                <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-navy">
                  {isVideo ? <Film className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                  {isVideo ? "Video" : "Image"}
                </span>
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0 || pending === "reorder"}
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleMove(index, "down")}
                    disabled={index === images.length - 1 || pending === "reorder"}
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-1">
                  {!img.isPrimary && !isVideo && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                      onClick={() => handleSetPrimary(img.id)}
                      disabled={pending === img.id + "-primary"}
                      title="Set as thumbnail (used on listing cards)"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  )}
                  {!img.isBanner && !isVideo && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => handleSetBanner(img.id)}
                      disabled={pending === img.id + "-banner"}
                      title="Set as banner (large hero image on detail page)"
                    >
                      <Monitor className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(img.id)}
                    disabled={pending === img.id}
                    title="Delete media"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
              )
            })()
          ))}
        </div>
      )}
    </div>
  )
}
