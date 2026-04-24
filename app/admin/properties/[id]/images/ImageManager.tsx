"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CldUploadWidget, type CloudinaryUploadWidgetResults } from "next-cloudinary"
import Image from "next/image"
import { Trash2, Star, Upload, ArrowUp, ArrowDown } from "lucide-react"
import {
  addPropertyImageAction,
  deletePropertyImageAction,
  setPrimaryImageAction,
  reorderImagesAction,
} from "./actions"

type PropertyImage = {
  id: string
  url: string
  publicId: string
  alt: string | null
  order: number
  isPrimary: boolean
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

  const handleUpload = async (result: CloudinaryUploadWidgetResults) => {
    const info = typeof result.info === "object" ? result.info : undefined
    if (!info?.secure_url || !info?.public_id) return

    setPending("upload")
    await addPropertyImageAction(propertyId, info.secure_url, info.public_id, info.original_filename)

    setImages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        url: info.secure_url,
        publicId: info.public_id,
        alt: info.original_filename || null,
        order: prev.length,
        isPrimary: prev.length === 0,
      },
    ])
    setPending(null)
    showMsg("success", "Image uploaded successfully.")
  }

  const handleDelete = async (imageId: string) => {
    if (!confirm("Delete this image?")) return
    setPending(imageId)
    const res = await deletePropertyImageAction(imageId, propertyId)
    if (res?.error) {
      showMsg("error", res.error)
    } else {
      setImages((prev) => {
        const filtered = prev.filter((img) => img.id !== imageId)
        if (prev.find((img) => img.id === imageId)?.isPrimary && filtered.length > 0) {
          filtered[0] = { ...filtered[0], isPrimary: true }
        }
        return filtered
      })
      showMsg("success", "Image deleted.")
    }
    setPending(null)
  }

  const handleSetPrimary = async (imageId: string) => {
    setPending(imageId + "-primary")
    await setPrimaryImageAction(imageId, propertyId)
    setImages((prev) =>
      prev.map((img) => ({ ...img, isPrimary: img.id === imageId }))
    )
    setPending(null)
    showMsg("success", "Primary image updated.")
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

      <div className="bg-white border rounded-xl p-5">
        <h3 className="font-semibold text-navy mb-4">Upload New Image</h3>
        <CldUploadWidget
          signatureEndpoint="/api/upload/signature"
          onSuccess={handleUpload}
          options={{ multiple: false, resourceType: "image", maxFiles: 1 }}
        >
          {({ open }) => (
            <Button
              type="button"
              onClick={() => open()}
              disabled={pending === "upload"}
              className="bg-navy text-cream hover:bg-navy/90"
            >
              <Upload className="w-4 h-4 mr-2" />
              {pending === "upload" ? "Uploading..." : "Upload Image"}
            </Button>
          )}
        </CldUploadWidget>
      </div>

      {images.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center">
          <p className="text-slate-400">No images yet. Upload the first one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {images.map((img, index) => (
            <div
              key={img.id}
              className={`bg-white border rounded-xl overflow-hidden shadow-sm ${
                img.isPrimary ? "ring-2 ring-navy" : ""
              }`}
            >
              <div className="relative aspect-video">
                <Image
                  src={img.url}
                  alt={img.alt || "Property image"}
                  fill
                  className="object-cover"
                />
                {img.isPrimary && (
                  <span className="absolute top-2 left-2 bg-navy text-cream text-xs px-2 py-0.5 rounded-full font-medium">
                    Primary
                  </span>
                )}
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
                  {!img.isPrimary && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                      onClick={() => handleSetPrimary(img.id)}
                      disabled={pending === img.id + "-primary"}
                      title="Set as primary"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(img.id)}
                    disabled={pending === img.id}
                    title="Delete image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
