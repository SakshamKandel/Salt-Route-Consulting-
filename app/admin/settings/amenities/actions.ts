"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function addAmenityToAllPropertiesAction(amenity: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  const name = z.string().min(2).max(60).parse(amenity.trim())

  await prisma.$executeRaw`
    UPDATE properties
    SET amenities = array_append(amenities, ${name})
    WHERE NOT (${name} = ANY(amenities))
  `

  revalidatePath("/admin/settings/amenities")
  return { success: `"${name}" added to all properties.` }
}

export async function removeAmenityFromAllPropertiesAction(amenity: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  await prisma.$executeRaw`
    UPDATE properties
    SET amenities = array_remove(amenities, ${amenity})
    WHERE ${amenity} = ANY(amenities)
  `

  revalidatePath("/admin/settings/amenities")
  return { success: `"${amenity}" removed from all properties.` }
}
