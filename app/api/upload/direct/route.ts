import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Vercel serverless functions cap payload at 4.5MB. We cap at 4MB to leave
// headroom for multipart overhead.
const MAX_BYTES = 4 * 1024 * 1024

export const maxDuration = 30

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    console.warn("[upload/direct] unauthorized")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("[upload/direct] missing cloudinary env", {
      hasCloudName: !!cloudName,
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
    })
    return NextResponse.json(
      { error: "Cloudinary is not configured on the server. Check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET on Vercel." },
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
      { error: `File too large after compression. Max ${Math.round(MAX_BYTES / 1024 / 1024)}MB.` },
      { status: 413 }
    )
  }

  const folder = typeof formData.get("folder") === "string" ? (formData.get("folder") as string) : "salt-route"
  const resourceType = file.type.startsWith("video/") ? "video" : "image"

  console.log("[upload/direct] uploading", {
    name: file instanceof File ? file.name : "blob",
    size: file.size,
    type: file.type,
    folder,
    resourceType,
  })

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
        },
        (err, res) => {
          if (err || !res) return reject(err ?? new Error("Empty response"))
          resolve(res)
        }
      )
      stream.end(buffer)
    })

    console.log("[upload/direct] success", { publicId: result.public_id, bytes: result.bytes })

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      resourceType: result.resource_type,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed"
    console.error("[upload/direct] cloudinary error:", message, err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
