import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { propertyId } = await params
  const userId = session.user.id

  const existing = await prisma.wishlist.findUnique({
    where: { userId_propertyId: { userId, propertyId } },
  })

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } })
    return NextResponse.json({ wishlisted: false })
  }

  await prisma.wishlist.create({ data: { userId, propertyId } })
  return NextResponse.json({ wishlisted: true })
}
