import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const apiKey = process.env.CLOUDINARY_API_KEY

  if (!apiSecret || !apiKey || !CLOUD_NAME) {
    return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 500 })
  }

  const body = (await req.json().catch(() => ({}))) as { folder?: string }
  const folder = typeof body.folder === "string" && body.folder ? body.folder : undefined

  // Generate the timestamp and sign server-side so the api_key, timestamp, and
  // signature ALWAYS come from the same runtime env. This avoids the build-time
  // NEXT_PUBLIC_* key drifting out of sync with the server's secret.
  const timestamp = Math.round(Date.now() / 1000)
  const paramsToSign: Record<string, string | number> = { timestamp }
  if (folder) paramsToSign.folder = folder

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret)

  return NextResponse.json({ signature, timestamp, apiKey, cloudName: CLOUD_NAME, folder })
}
