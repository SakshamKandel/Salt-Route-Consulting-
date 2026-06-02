"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Link as LinkIcon, Film, Image as ImageIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { compressVideo, canCompressVideo } from "@/lib/video-compress"

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

const MAX_BYTES = 4 * 1024 * 1024
const COMPRESS_TARGET_BYTES = 3.5 * 1024 * 1024
const MAX_DIMENSION = 2400

// Videos upload directly browser -> Cloudinary (not through our API route), so the
// Vercel 4.5MB serverless body limit does not apply. Cloudinary requires chunked
// uploads above 100MB; we always chunk. Cap is generous — actual ceiling is your
// Cloudinary plan's max video size.
const MAX_VIDEO_BYTES = 2 * 1024 * 1024 * 1024 // 2 GB
const VIDEO_CHUNK_BYTES = 20 * 1024 * 1024 // 20 MB per chunk
const VIDEO_COMPRESS_THRESHOLD = 40 * 1024 * 1024 // compress videos larger than 40 MB

type CloudinaryUploadResult = {
  secure_url?: string
  public_id?: string
  error?: { message: string }
}

type SignatureResponse = {
  signature: string
  timestamp: number
  apiKey: string
  cloudName: string
  error?: string
}

// Upload a (large) video straight to Cloudinary in chunks via a server-signed
// request. The api_key, timestamp, and signature are all returned together by
// the server (runtime env) so they can never drift out of sync — the build-time
// NEXT_PUBLIC api_key is intentionally NOT used (it goes stale across deploys).
async function uploadVideoDirect(
  file: File,
  folder: string | undefined,
  onProgress?: (fraction: number) => void
): Promise<UploadedMedia> {
  const sigRes = await fetch("/api/upload/signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  })
  if (!sigRes.ok) {
    const data = await sigRes.json().catch(() => ({}))
    throw new Error(data.error || `Could not sign upload (${sigRes.status})`)
  }
  const sig = (await sigRes.json()) as SignatureResponse

  const cloudName = sig.cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloudName) {
    throw new Error("Cloudinary is not configured (cloud name missing).")
  }

  const baseFields: Array<[string, string]> = [
    ["api_key", sig.apiKey],
    ["timestamp", String(sig.timestamp)],
    ["signature", sig.signature],
  ]
  if (folder) baseFields.push(["folder", folder])

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`
  const uniqueUploadId = `srg-${Date.now()}-${Math.round((file.size % 100000))}-${file.name.length}`
  const total = file.size

  let lastResult: CloudinaryUploadResult | null = null

  for (let start = 0; start < total; start += VIDEO_CHUNK_BYTES) {
    const end = Math.min(start + VIDEO_CHUNK_BYTES, total)
    const chunk = file.slice(start, end)

    const form = new FormData()
    form.append("file", chunk, file.name)
    for (const [k, v] of baseFields) form.append(k, v)

    lastResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", url, true)
      xhr.setRequestHeader("X-Unique-Upload-Id", uniqueUploadId)
      xhr.setRequestHeader("Content-Range", `bytes ${start}-${end - 1}/${total}`)
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.min(1, (start + e.loaded) / total))
        }
      }
      xhr.onload = () => {
        try {
          resolve(JSON.parse(xhr.responseText) as CloudinaryUploadResult)
        } catch {
          reject(new Error(`Cloudinary returned ${xhr.status}`))
        }
      }
      xhr.onerror = () => reject(new Error("Network error during upload"))
      xhr.send(form)
    })

    if (lastResult?.error) throw new Error(lastResult.error.message)
  }

  if (!lastResult?.secure_url || !lastResult?.public_id) {
    throw new Error("Upload did not complete.")
  }
  onProgress?.(1)
  return {
    url: lastResult.secure_url,
    publicId: lastResult.public_id,
    alt: file.name.replace(/\.[^.]+$/, ""),
  }
}

async function compressImage(file: File): Promise<Blob> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = dataUrl
  })

  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas not supported")
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  // Try decreasing quality steps until under the size budget
  for (const quality of [0.88, 0.8, 0.72, 0.64, 0.56, 0.48]) {
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality))
    if (!blob) continue
    if (blob.size <= COMPRESS_TARGET_BYTES) return blob
  }
  // Last resort: return whatever the lowest quality produced
  const finalBlob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.4))
  if (!finalBlob) throw new Error("Could not compress image")
  return finalBlob
}

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
  const [videoProgress, setVideoProgress] = useState<{ name: string; pct: number; phase: "compress" | "upload" } | null>(null)

  const buttonLabel = label ?? LABEL_BY_KIND[kind]
  const Icon = kind === "video" ? Film : kind === "image" ? ImageIcon : Upload

  async function uploadOne(file: File): Promise<UploadedMedia | null> {
    // Videos go directly to Cloudinary (chunked), bypassing the 4.5MB serverless limit.
    if (file.type.startsWith("video/")) {
      if (file.size > MAX_VIDEO_BYTES) {
        toast.error(`${file.name} is too large. Max ${Math.round(MAX_VIDEO_BYTES / 1024 / 1024 / 1024)}GB.`)
        return null
      }

      let toUpload = file

      // Compress large videos in the browser (when supported) to shrink them
      // before upload — helps fit Cloudinary plan limits and speeds delivery.
      if (file.size > VIDEO_COMPRESS_THRESHOLD && canCompressVideo()) {
        try {
          const before = file.size
          toUpload = await compressVideo(file, (frac) =>
            setVideoProgress({ name: file.name, pct: Math.round(frac * 100), phase: "compress" })
          )
          if (toUpload !== file) {
            const pct = Math.round((1 - toUpload.size / before) * 100)
            toast.success(`Compressed ${file.name} by ${pct}% (${(toUpload.size / 1024 / 1024).toFixed(0)}MB).`)
          }
        } catch (err) {
          // not-supported / failure → fall back to uploading the original.
          console.warn("[uploader] video compression skipped:", err)
        }
      }

      try {
        return await uploadVideoDirect(toUpload, folder, (frac) =>
          setVideoProgress({ name: file.name, pct: Math.round(frac * 100), phase: "upload" })
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed"
        console.error("[uploader] video upload failed", err)
        toast.error(`${file.name}: ${message}`)
        return null
      } finally {
        setVideoProgress(null)
      }
    }

    let payload: Blob = file
    let payloadName = file.name

    if (file.type.startsWith("image/") && file.size > COMPRESS_TARGET_BYTES) {
      try {
        payload = await compressImage(file)
        payloadName = file.name.replace(/\.[^.]+$/, "") + ".jpg"
      } catch (err) {
        console.error("[uploader] compress failed", err)
        // fall through with original file; the server will reject if too large
      }
    }

    if (payload.size > MAX_BYTES) {
      toast.error(`${file.name} is too large even after compression. Max 4MB.`)
      return null
    }

    const formData = new FormData()
    formData.append("file", payload, payloadName)
    if (folder) formData.append("folder", folder)

    const res = await fetch("/api/upload/direct", {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      console.error("[uploader] upload failed", { status: res.status, body: data })
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
              {videoProgress
                ? `${videoProgress.phase === "compress" ? "Compressing" : "Uploading"} video ${videoProgress.pct}%`
                : progress
                  ? `Uploading ${progress.done} / ${progress.total}`
                  : "Uploading..."}
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
        Images compressed automatically (max 4MB). Videos up to 2GB, uploaded in chunks and compressed by Cloudinary. JPG, PNG, WebP, AVIF, MP4, WebM, MOV.
      </p>
    </div>
  )
}
