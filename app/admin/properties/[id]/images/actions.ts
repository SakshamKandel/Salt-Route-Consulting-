"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { v2 as cloudinary } from "cloudinary"
import { getCloudinaryResourceType, isVideoUrl } from "@/lib/property-media"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function assertCanManage(propertyId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Please sign in to manage property media." }
  }

  if (session.user.role === "ADMIN") {
    return { ok: true, session }
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { ownerId: true },
  })

  if (property && property.ownerId === session.user.id) {
    return { ok: true, session }
  }

  return { error: "Unauthorized. Admin or property manager access required." }
}

async function revalidatePropertyMedia(propertyId: string) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { slug: true },
    })

    if (property?.slug) {
      revalidatePath(`/properties/${property.slug}`)
    }
    revalidatePath(`/admin/properties/${propertyId}/images`)
    revalidatePath(`/admin/properties/${propertyId}`)
    revalidatePath(`/admin/dashboard`)
    revalidatePath("/properties")
    revalidatePath("/")
  } catch (e) {
    console.error("[revalidatePropertyMedia] error:", e)
  }
}

export async function addPropertyImageAction(
  propertyId: string,
  url: string,
  publicId: string,
  alt?: string
) {
  const check = await assertCanManage(propertyId)
  if (check.error) return { error: check.error }

  const count = await prisma.propertyImage.count({ where: { propertyId } })
  const imageCount = await prisma.propertyImage.count({
    where: { propertyId, NOT: [{ url: { contains: "/video/upload/" } }] },
  })
  const isVideo = isVideoUrl(url)
  const isPrimary = !isVideo && imageCount === 0

  const created = await prisma.propertyImage.create({
    data: {
      propertyId,
      url,
      publicId,
      alt: alt || null,
      order: count,
      isPrimary,
      isBanner: false,
    },
  })

  await revalidatePropertyMedia(propertyId)

  return {
    ok: true,
    image: {
      id: created.id,
      url: created.url,
      publicId: created.publicId,
      alt: created.alt,
      order: created.order,
      isPrimary: created.isPrimary,
      isBanner: created.isBanner,
    },
  }
}

export async function deletePropertyImageAction(imageId: string, propertyId: string) {
  const check = await assertCanManage(propertyId)
  if (check.error) return { error: check.error }

  const image = await prisma.propertyImage.findFirst({
    where: { id: imageId, propertyId },
  })
  if (!image) return { error: "Image not found." }

  // Delete from Cloudinary
  try {
    await cloudinary.uploader.destroy(image.publicId, {
      resource_type: getCloudinaryResourceType(image.url),
    })
  } catch {
    // continue even if Cloudinary delete fails
  }

  await prisma.propertyImage.delete({ where: { id: imageId } })

  // If deleted image was primary, promote the next one
  if (image.isPrimary) {
    const next = await prisma.propertyImage.findFirst({
      where: {
        propertyId,
        NOT: [{ url: { contains: "/video/upload/" } }],
      },
      orderBy: { order: "asc" },
    })
    if (next) {
      await prisma.propertyImage.update({ where: { id: next.id }, data: { isPrimary: true } })
    }
  }

  // If deleted image was banner, promote the primary or first image to banner
  if (image.isBanner) {
    const nextBanner = await prisma.propertyImage.findFirst({
      where: {
        propertyId,
        NOT: [{ url: { contains: "/video/upload/" } }],
      },
      orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
    })
    if (nextBanner) {
      await prisma.propertyImage.update({ where: { id: nextBanner.id }, data: { isBanner: true } })
    }
  }

  await revalidatePropertyMedia(propertyId)
  return { ok: true }
}

export async function setPrimaryImageAction(imageId: string, propertyId: string) {
  const check = await assertCanManage(propertyId)
  if (check.error) return { error: check.error }

  const image = await prisma.propertyImage.findFirst({
    where: { id: imageId, propertyId },
  })
  if (!image) {
    return { error: "Image not found." }
  }
  if (isVideoUrl(image.url)) {
    return { error: "Videos cannot be set as the thumbnail." }
  }

  await prisma.$transaction([
    prisma.propertyImage.updateMany({ where: { propertyId }, data: { isPrimary: false } }),
    prisma.propertyImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
  ])

  await revalidatePropertyMedia(propertyId)
  return { ok: true }
}

export async function setBannerImageAction(imageId: string, propertyId: string) {
  const check = await assertCanManage(propertyId)
  if (check.error) return { error: check.error }

  const image = await prisma.propertyImage.findFirst({
    where: { id: imageId, propertyId },
  })
  if (!image) {
    return { error: "Image not found." }
  }
  if (isVideoUrl(image.url)) {
    return { error: "Videos cannot be set as the banner." }
  }

  // Toggle: If currently banner, toggle off; otherwise set as exclusive banner
  const newBannerState = !image.isBanner

  await prisma.$transaction([
    prisma.propertyImage.updateMany({ where: { propertyId }, data: { isBanner: false } }),
    ...(newBannerState
      ? [prisma.propertyImage.update({ where: { id: imageId }, data: { isBanner: true } })]
      : []),
  ])

  await revalidatePropertyMedia(propertyId)
  return { ok: true, isBanner: newBannerState }
}

export async function reorderImagesAction(propertyId: string, orderedIds: string[]) {
  const check = await assertCanManage(propertyId)
  if (check.error) return { error: check.error }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.propertyImage.update({ where: { id }, data: { order: index } })
    )
  )

  await revalidatePropertyMedia(propertyId)
  return { ok: true }
}
