import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

const MAX_BYTES = 4 * 1024 * 1024

export const maxDuration = 30

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET ?? process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    console.error("[upload/direct] missing cloudinary config", {
      hasCloudName: !!cloudName,
      hasUploadPreset: !!uploadPreset,
    })
    return NextResponse.json(
      {
        error:
          "Cloudinary upload is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET on Vercel. The preset must be created as 'unsigned' in your Cloudinary console.",
      },
      { status: 500 }
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch (err) {
    console.error("[upload/direct] formData parse failed:", err)
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const file = formData.get("file")

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large. Max ${Math.round(MAX_BYTES / 1024 / 1024)}MB.` },
      { status: 413 }
    )
  }

  const folder = typeof formData.get("folder") === "string" ? (formData.get("folder") as string) : "salt-route"
  const resourceType = file.type.startsWith("video/") ? "video" : "image"

  // Forward to Cloudinary's unsigned upload endpoint
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`

  const cldForm = new FormData()
  cldForm.append("file", file, file instanceof File ? file.name : "upload")
  cldForm.append("upload_preset", uploadPreset)
  if (folder) cldForm.append("folder", folder)

  console.log("[upload/direct] forwarding to cloudinary", {
    cloudName,
    preset: uploadPreset,
    size: file.size,
    type: file.type,
    folder,
    resourceType,
  })

  try {
    const res = await fetch(cloudinaryUrl, {
      method: "POST",
      body: cldForm,
    })

    const json = (await res.json().catch(() => null)) as
      | {
          secure_url?: string
          public_id?: string
          width?: number
          height?: number
          bytes?: number
          resource_type?: string
          error?: { message: string }
        }
      | null

    if (!res.ok || !json?.secure_url || !json?.public_id) {
      const message = json?.error?.message ?? `Cloudinary returned ${res.status}`
      console.error("[upload/direct] cloudinary rejected:", message, json)
      return NextResponse.json({ error: message }, { status: 502 })
    }

    console.log("[upload/direct] success", { publicId: json.public_id, bytes: json.bytes })

    return NextResponse.json({
      url: json.secure_url,
      publicId: json.public_id,
      width: json.width,
      height: json.height,
      bytes: json.bytes,
      resourceType: json.resource_type,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed"
    console.error("[upload/direct] network error:", message, err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
