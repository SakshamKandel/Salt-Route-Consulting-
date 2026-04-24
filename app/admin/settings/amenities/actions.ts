"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function addAmenityToAllPropertiesAction(amenity: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  const name = z.string().min(2).max(60).parse(amenity.trim())

  const properties = await prisma.property.findMany({ select: { id: true, amenities: true } })

  await Promise.all(
    properties
      .filter((p) => !p.amenities.includes(name))
      .map((p) =>
        prisma.property.update({
          where: { id: p.id },
          data: { amenities: { push: name } },
        })
      )
  )

  revalidatePath("/admin/settings/amenities")
  return { success: `"${name}" added to all properties.` }
}

export async function removeAmenityFromAllPropertiesAction(amenity: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  const properties = await prisma.property.findMany({ select: { id: true, amenities: true } })

  await Promise.all(
    properties
      .filter((p) => p.amenities.includes(amenity))
      .map((p) =>
        prisma.property.update({
          where: { id: p.id },
          data: { amenities: p.amenities.filter((a) => a !== amenity) },
        })
      )
  )

  revalidatePath("/admin/settings/amenities")
  return { success: `"${amenity}" removed from all properties.` }
}
