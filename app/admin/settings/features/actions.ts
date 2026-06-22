"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function getPropertyFeaturesAction() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  const features = await prisma.propertyFeature.findMany({
    orderBy: { order: "asc" },
  })
  return { features }
}

export async function addPropertyFeatureAction(name: string, iconKey: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  const trimmedName = z.string().min(2).max(80).parse(name.trim())
  const trimmedIcon = z.string().min(1).max(40).parse(iconKey.trim())

  const count = await prisma.propertyFeature.count()

  try {
    await prisma.propertyFeature.create({
      data: { name: trimmedName, iconKey: trimmedIcon, order: count },
    })
    revalidatePath("/admin/settings/features")
    return { success: `"${trimmedName}" added.` }
  } catch (e) {
    if (e instanceof Error && e.message.includes("unique")) {
      return { error: "A feature with that name already exists." }
    }
    return { error: "Failed to add feature." }
  }
}

export async function removePropertyFeatureAction(id: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  await prisma.propertyFeature.delete({ where: { id } })
  revalidatePath("/admin/settings/features")
  return { success: "Feature removed." }
}

export async function reorderPropertyFeaturesAction(ids: string[]) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.propertyFeature.update({
        where: { id },
        data: { order: index },
      })
    )
  )
  revalidatePath("/admin/settings/features")
  return { success: "Order updated." }
}
