"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Trash2, Star, ArrowUp, ArrowDown, Film, Image as ImageIcon, Monitor, Loader2 } from "lucide-react"
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
  const router = useRouter()
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
    const res = await addPropertyImageAction(propertyId, item.url, item.publicId, item.alt ?? undefined)

    if (res?.error) {
      showMsg("error", res.error)
    } else if (res?.image) {
      setImages((prev) => [...prev, res.image])
      showMsg("success", "Media added successfully.")
      router.refresh()
    }
    setPending(null)
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
      router.refresh()
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
      router.refresh()
    }
    setPending(null)
  }

  const handleSetBanner = async (imageId: string) => {
    setPending(imageId + "-banner")
    const res = await setBannerImageAction(imageId, propertyId)
    if (res?.error) {
      showMsg("error", res.error)
    } else {
      const isNowBanner = res?.isBanner !== false
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          isBanner: img.id === imageId ? isNowBanner : false,
        }))
      )
      showMsg("success", isNowBanner ? "Banner image updated." : "Banner image cleared.")
      router.refresh()
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
    router.refresh()
    setPending(null)
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`rounded-xl p-3 text-[13px] ${
            message.type === "success"
              ? "bg-emerald-50 border border-emerald-200/60 text-emerald-700"
              : "bg-rose-50 border border-rose-200/60 text-[#B84040]"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl p-5 space-y-5">
        <div>
          <p className="text-[10px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.2em] mb-1">Upload</p>
          <h3 className="text-[15px] font-semibold text-[#1B3A5C]">New Media{images.length > 0 ? ` · ${images.length} on file` : ""}</h3>
          <p className="text-[12px] text-[#1B3A5C]/45 mt-0.5">Photos and videos have separate uploaders. Click upload again to add more.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-[#1B3A5C]/8 p-4 space-y-2">
            <div>
              <h4 className="text-sm font-semibold text-[#1B3A5C]">Photos</h4>
              <p className="text-xs text-[#1B3A5C]/45">JPG, PNG, WEBP, AVIF. Up to 30 at once.</p>
            </div>
            <MediaUploader onAdd={handleAddMedia} multiple maxFiles={30} kind="image" />
          </div>

          <div className="rounded-xl border border-[#1B3A5C]/8 p-4 space-y-2">
            <div>
              <h4 className="text-sm font-semibold text-[#1B3A5C]">Videos</h4>
              <p className="text-xs text-[#1B3A5C]/45">MP4, WEBM, MOV. Up to 200 MB per video.</p>
            </div>
            <MediaUploader onAdd={handleAddMedia} multiple maxFiles={10} kind="video" />
          </div>
        </div>

        {pending === "upload" && <p className="text-xs text-[#1B3A5C]/45">Saving...</p>}
      </div>

      {images.length === 0 ? (
        <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl p-12 text-center">
          <ImageIcon className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-3" />
          <p className="text-[13px] text-[#1B3A5C]/40">No media yet.</p>
          <p className="text-[11px] text-[#1B3A5C]/30 mt-1">Upload the first photo or video above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {images.map((img, index) => (
            (() => {
              const isVideo = isVideoUrl(img.url)
              return (
            <div
              key={img.id}
              className={`bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl overflow-hidden ${
                img.isPrimary || img.isBanner ? "ring-2 ring-[#C9A96E]/60" : ""
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
                    <span className="bg-[#1B3A5C] text-[#FFFAF3] text-[9px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-full font-semibold">
                      Thumbnail
                    </span>
                  )}
                  {img.isBanner && (
                    <span className="bg-[#C9A96E] text-[#1B3A5C] text-[9px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-full font-semibold">
                      Banner
                    </span>
                  )}
                </div>
                <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-[#1B3A5C]">
                  {isVideo ? <Film className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                  {isVideo ? "Video" : "Image"}
                </span>
              </div>
              <div className="p-3 space-y-2">
                {!isVideo && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={img.isPrimary ? "default" : "outline"}
                      size="sm"
                      className={`h-8 text-xs rounded-lg ${
                        img.isPrimary
                          ? "bg-[#1B3A5C] text-[#FFFAF3] hover:bg-[#2A4F7A]"
                          : "border-[#1B3A5C]/15 text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 hover:bg-transparent"
                      }`}
                      onClick={() => handleSetPrimary(img.id)}
                      disabled={pending === img.id + "-primary"}
                      title="Used on property listing cards"
                    >
                      {pending === img.id + "-primary" ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Star className={`w-3.5 h-3.5 mr-1.5 ${img.isPrimary ? "fill-current" : ""}`} />
                      )}
                      {img.isPrimary ? "Thumbnail" : "Make Thumbnail"}
                    </Button>
                    <Button
                      type="button"
                      variant={img.isBanner ? "default" : "outline"}
                      size="sm"
                      className={`h-8 text-xs rounded-lg transition-all ${
                        img.isBanner
                          ? "bg-[#C9A96E] text-[#1B3A5C] hover:bg-[#b89556] font-semibold"
                          : "border-[#C9A96E]/40 text-[#C9A96E] hover:bg-[#C9A96E]/10 hover:text-[#1B3A5C] hover:border-[#C9A96E]/60"
                      }`}
                      onClick={() => handleSetBanner(img.id)}
                      disabled={pending === img.id + "-banner"}
                      title={img.isBanner ? "Click to clear banner status" : "Set as large hero banner on the property detail page"}
                    >
                      {pending === img.id + "-banner" ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Monitor className={`w-3.5 h-3.5 mr-1.5 ${img.isBanner ? "fill-current" : ""}`} />
                      )}
                      {img.isBanner ? "Banner" : "Make Banner"}
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[#B84040] hover:text-[#B84040] hover:bg-rose-50"
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
