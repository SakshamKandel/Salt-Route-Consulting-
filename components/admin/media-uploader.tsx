"use client"

import { useState } from "react"
import { CldUploadWidget, type CloudinaryUploadWidgetResults } from "next-cloudinary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Link as LinkIcon, AlertTriangle, Film, Image as ImageIcon } from "lucide-react"

export type UploadedMedia = {
  url: string
  publicId: string
  alt?: string | null
}

export type MediaKind = "image" | "video" | "auto"

const isCloudinaryConfigured = () => {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
  if (!cloud || cloud === "xxx" || cloud === "your-cloud") return false
  if (!apiKey || apiKey === "xxx" || apiKey === "your-key") return false
  return true
}

const FORMATS_BY_KIND: Record<MediaKind, string[]> = {
  image: ["jpg", "jpeg", "png", "webp", "avif"],
  video: ["mp4", "webm", "mov"],
  auto: ["jpg", "jpeg", "png", "webp", "avif", "mp4", "webm", "mov"],
}

const LABEL_BY_KIND: Record<MediaKind, string> = {
  image: "Upload Photos",
  video: "Upload Videos",
  auto: "Upload Media",
}

export function MediaUploader({
  onAdd,
  multiple = true,
  maxFiles = 30,
  className = "",
  kind = "auto",
  label,
}: {
  onAdd: (media: UploadedMedia) => void
  multiple?: boolean
  maxFiles?: number
  className?: string
  kind?: MediaKind
  label?: string
}) {
  const [pasteUrl, setPasteUrl] = useState("")
  const [pasteError, setPasteError] = useState<string | null>(null)

  const configured = isCloudinaryConfigured()
  const buttonLabel = label ?? LABEL_BY_KIND[kind]
  const Icon = kind === "video" ? Film : kind === "image" ? ImageIcon : Upload

  // Cloudinary's resourceType for the upload widget: image/video/raw/auto.
  // For "image" kind we explicitly set "image" so the widget rejects videos at the picker.
  const resourceType: "image" | "video" | "auto" = kind === "image" ? "image" : kind === "video" ? "video" : "auto"

  function handleCloudinarySuccess(result: CloudinaryUploadWidgetResults) {
    const info = typeof result.info === "object" ? result.info : undefined
    if (!info?.secure_url || !info?.public_id) return
    onAdd({
      url: info.secure_url,
      publicId: info.public_id,
      alt: info.original_filename || null,
    })
  }

  function handlePasteAdd() {
    setPasteError(null)
    const trimmed = pasteUrl.trim()
    if (!trimmed) return
    try {
      const parsed = new URL(trimmed)
      if (!/^https?:$/.test(parsed.protocol)) {
        setPasteError("URL must start with http:// or https://")
        return
      }
    } catch {
      setPasteError("That doesn't look like a valid URL.")
      return
    }
    const filename = pasteUrl.split("/").pop()?.split("?")[0] || "external-media"
    onAdd({
      url: pasteUrl.trim(),
      publicId: `external:${filename}-${Date.now()}`,
      alt: filename,
    })
    setPasteUrl("")
  }

  if (configured) {
    return (
      <div className={className}>
        <CldUploadWidget
          signatureEndpoint="/api/upload/signature"
          onSuccess={handleCloudinarySuccess}
          options={{
            multiple,
            maxFiles,
            resourceType,
            clientAllowedFormats: FORMATS_BY_KIND[kind],
            maxFileSize: kind === "video" ? 200 * 1024 * 1024 : 100 * 1024 * 1024,
            sources: ["local", "url", "camera"],
          }}
        >
          {({ open }) => (
            <Button
              type="button"
              onClick={() => open()}
              variant="outline"
              className="border-navy/20 text-navy"
            >
              <Icon className="w-4 h-4 mr-2" />
              {buttonLabel}
            </Button>
          )}
        </CldUploadWidget>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <p className="font-medium">Cloudinary not configured.</p>
          <p>
            To enable drag-and-drop uploads, set <code className="font-mono">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> and{" "}
            <code className="font-mono">NEXT_PUBLIC_CLOUDINARY_API_KEY</code> in <code className="font-mono">.env.local</code>. For
            now, paste an image or video URL below.
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          value={pasteUrl}
          onChange={(e) => setPasteUrl(e.target.value)}
          placeholder="https://example.com/photo.jpg"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handlePasteAdd()
            }
          }}
        />
        <Button
          type="button"
          onClick={handlePasteAdd}
          variant="outline"
          className="border-navy/20 text-navy shrink-0"
        >
          <LinkIcon className="w-4 h-4 mr-2" />
          Add URL
        </Button>
      </div>
      {pasteError && <p className="text-xs text-red-600">{pasteError}</p>}
    </div>
  )
}
