import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!apiSecret) {
    return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 500 })
  }

  // The Cloudinary upload widget POSTs the params it wants signed in `paramsToSign`.
  // We must sign exactly those params (in the order/shape Cloudinary expects) so the
  // resulting signature matches what the widget sends with the upload request.
  const body = (await req.json().catch(() => ({}))) as {
    paramsToSign?: Record<string, string | number>
  }

  const paramsToSign = body.paramsToSign ?? {
    timestamp: Math.round(new Date().getTime() / 1000),
  }

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret)

  return NextResponse.json({ signature })
}
