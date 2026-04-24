"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function toggleFeaturedAction(propertyId: string, featured: boolean) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  try {
    await prisma.property.update({
      where: { id: propertyId },
      data: { featured },
    })
    revalidatePath("/admin/settings/homepage")
    revalidatePath("/")
    return { success: true }
  } catch (err) {
    console.error("[TOGGLE_FEATURED]", err)
    return { error: "Failed to update property." }
  }
}
