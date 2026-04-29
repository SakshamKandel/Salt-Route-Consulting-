"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Link as LinkIcon, Film, Image as ImageIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"

export type UploadedMedia = {
  url: string
  publicId: string
  alt?: string | null
}

export type MediaKind = "image" | "video" | "auto"

const ACCEPT_BY_KIND: Record<MediaKind, string> = {
  image: "image/jpeg,image/jpg,image/png,image/webp,image/avif",
  video: "video/mp4,video/webm,video/quicktime",
  auto: "image/jpeg,image/jpg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime",
}

const LABEL_BY_KIND: Record<MediaKind, string> = {
  image: "Upload Photos",
  video: "Upload Videos",
  auto: "Upload Media",
}

const MAX_BYTES = 10 * 1024 * 1024

export function MediaUploader({
  onAdd,
  multiple = true,
  className = "",
  kind = "auto",
  label,
  folder,
}: {
  onAdd: (media: UploadedMedia) => void
  multiple?: boolean
  maxFiles?: number
  className?: string
  kind?: MediaKind
  label?: string
  folder?: string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pasteUrl, setPasteUrl] = useState("")
  const [pasteError, setPasteError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  const buttonLabel = label ?? LABEL_BY_KIND[kind]
  const Icon = kind === "video" ? Film : kind === "image" ? ImageIcon : Upload

  async function uploadOne(file: File): Promise<UploadedMedia | null> {
    if (file.size > MAX_BYTES) {
      toast.error(`${file.name} is too large. Max 10MB.`)
      return null
    }
    const formData = new FormData()
    formData.append("file", file)
    if (folder) formData.append("folder", folder)

    const res = await fetch("/api/upload/direct", {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(`${file.name}: ${data.error || `Upload failed (${res.status})`}`)
      return null
    }

    const data = await res.json()
    return {
      url: data.url,
      publicId: data.publicId,
      alt: file.name.replace(/\.[^.]+$/, ""),
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return

    setUploading(true)
    const arr = Array.from(files)
    setProgress({ done: 0, total: arr.length })

    let succeeded = 0
    for (let i = 0; i < arr.length; i++) {
      const result = await uploadOne(arr[i])
      if (result) {
        onAdd(result)
        succeeded++
      }
      setProgress({ done: i + 1, total: arr.length })
    }

    setUploading(false)
    setProgress(null)

    if (succeeded > 0) {
      toast.success(`Uploaded ${succeeded} ${succeeded === 1 ? "file" : "files"}.`)
    }

    if (fileInputRef.current) fileInputRef.current.value = ""
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
    const filename = trimmed.split("/").pop()?.split("?")[0] || "external-media"
    onAdd({
      url: trimmed,
      publicId: `external:${filename}-${Date.now()}`,
      alt: filename.replace(/\.[^.]+$/, ""),
    })
    setPasteUrl("")
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_BY_KIND[kind]}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          variant="outline"
          className="border-navy/20 text-navy"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {progress ? `Uploading ${progress.done} / ${progress.total}` : "Uploading..."}
            </>
          ) : (
            <>
              <Icon className="w-4 h-4 mr-2" />
              {buttonLabel}
            </>
          )}
        </Button>

        <div className="flex flex-1 gap-2">
          <Input
            value={pasteUrl}
            onChange={(e) => setPasteUrl(e.target.value)}
            placeholder="or paste an image URL"
            disabled={uploading}
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
            disabled={uploading}
            variant="outline"
            className="border-navy/20 text-navy shrink-0"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            Add URL
          </Button>
        </div>
      </div>

      {pasteError && <p className="text-xs text-red-600">{pasteError}</p>}
      <p className="text-[10px] text-charcoal/40">
        Max 10MB per file. JPG, PNG, WebP, AVIF for images. MP4, WebM, MOV for video.
      </p>
    </div>
  )
}
