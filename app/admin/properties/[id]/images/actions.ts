"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function assertAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized")
  return session
}

export async function addPropertyImageAction(
  propertyId: string,
  url: string,
  publicId: string,
  alt?: string
) {
  await assertAdmin()

  const count = await prisma.propertyImage.count({ where: { propertyId } })
  const isPrimary = count === 0

  await prisma.propertyImage.create({
    data: {
      propertyId,
      url,
      publicId,
      alt: alt || null,
      order: count,
      isPrimary,
    },
  })

  revalidatePath(`/admin/properties/${propertyId}/images`)
  revalidatePath(`/admin/properties/${propertyId}`)
}

export async function deletePropertyImageAction(imageId: string, propertyId: string) {
  await assertAdmin()

  const image = await prisma.propertyImage.findUnique({ where: { id: imageId } })
  if (!image) return { error: "Image not found" }

  // Delete from Cloudinary
  try {
    await cloudinary.uploader.destroy(image.publicId)
  } catch {
    // continue even if Cloudinary delete fails
  }

  await prisma.propertyImage.delete({ where: { id: imageId } })

  // If deleted image was primary, promote the next one
  if (image.isPrimary) {
    const next = await prisma.propertyImage.findFirst({
      where: { propertyId },
      orderBy: { order: "asc" },
    })
    if (next) {
      await prisma.propertyImage.update({ where: { id: next.id }, data: { isPrimary: true } })
    }
  }

  revalidatePath(`/admin/properties/${propertyId}/images`)
  revalidatePath(`/admin/properties/${propertyId}`)
}

export async function setPrimaryImageAction(imageId: string, propertyId: string) {
  await assertAdmin()

  await prisma.$transaction([
    prisma.propertyImage.updateMany({ where: { propertyId }, data: { isPrimary: false } }),
    prisma.propertyImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
  ])

  revalidatePath(`/admin/properties/${propertyId}/images`)
}

export async function reorderImagesAction(propertyId: string, orderedIds: string[]) {
  await assertAdmin()

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.propertyImage.update({ where: { id }, data: { order: index } })
    )
  )

  revalidatePath(`/admin/properties/${propertyId}/images`)
}
