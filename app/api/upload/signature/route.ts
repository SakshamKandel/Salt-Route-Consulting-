import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// 10.6 — Allowed image formats and max file size
const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp", "avif"]
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

export async function POST() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const timestamp = Math.round(new Date().getTime() / 1000)

  // Sign with explicit constraints so Cloudinary rejects anything else
  const params = {
    timestamp,
    folder: "salt_route_properties",
    allowed_formats: ALLOWED_FORMATS.join(","),
    max_file_size: MAX_FILE_SIZE_BYTES,
    // Enforce image resource type at API level
    resource_type: "image",
  }

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  )

  return NextResponse.json({
    timestamp,
    signature,
    folder: params.folder,
    allowed_formats: ALLOWED_FORMATS,
    max_file_size: MAX_FILE_SIZE_BYTES,
    api_key: process.env.CLOUDINARY_API_KEY,
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  })
}
