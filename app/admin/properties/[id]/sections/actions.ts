"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createAuditLog } from "@/lib/audit"

const sectionSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(160),
  subtitle: z.string().trim().max(160).optional(),
  body: z.string().trim().min(10, "Body must be at least 10 characters").max(5000),
  imageUrl: z.string().url().optional().or(z.literal("")),
})

export type SectionInput = z.input<typeof sectionSchema>

async function revalidateProperty(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { slug: true },
  })
  revalidatePath(`/admin/properties/${propertyId}/sections`)
  revalidatePath(`/admin/properties/${propertyId}`)
  if (property?.slug) revalidatePath(`/properties/${property.slug}`)
}

export async function upsertSectionAction(propertyId: string, data: SectionInput, sectionId?: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  try {
    const validated = sectionSchema.parse(data)
    const payload = {
      title: validated.title,
      subtitle: validated.subtitle || null,
      body: validated.body,
      imageUrl: validated.imageUrl || null,
    }

    if (sectionId) {
      await prisma.propertySection.update({
        where: { id: sectionId, propertyId },
        data: payload,
      })
    } else {
      const count = await prisma.propertySection.count({ where: { propertyId } })
      await prisma.propertySection.create({
        data: { ...payload, propertyId, order: count },
      })
    }

    await createAuditLog({
      action: sectionId ? "UPDATE" : "CREATE",
      entity: "PROPERTY_SECTION",
      entityId: sectionId,
      details: { title: validated.title, propertyId },
      userId: session.user.id,
    })

    await revalidateProperty(propertyId)
    return { success: true }
  } catch (err) {
    console.error("[SECTION_UPSERT]", err)
    if (err instanceof z.ZodError) {
      const first = err.issues[0]
      return { error: `${first?.path?.join(".") || "Field"}: ${first?.message || "invalid"}` }
    }
    return { error: "Failed to save section." }
  }
}

export async function deleteSectionAction(propertyId: string, sectionId: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  try {
    await prisma.propertySection.delete({ where: { id: sectionId, propertyId } })
    await createAuditLog({
      action: "DELETE",
      entity: "PROPERTY_SECTION",
      entityId: sectionId,
      details: { propertyId },
      userId: session.user.id,
    })
    await revalidateProperty(propertyId)
    return { success: true }
  } catch (err) {
    console.error("[SECTION_DELETE]", err)
    return { error: "Failed to delete section." }
  }
}

export async function moveSectionAction(propertyId: string, sectionId: string, direction: "up" | "down") {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  try {
    const sections = await prisma.propertySection.findMany({
      where: { propertyId },
      orderBy: { order: "asc" },
      select: { id: true },
    })
    const index = sections.findIndex((s) => s.id === sectionId)
    if (index < 0) return { error: "Section not found." }
    const swapWith = direction === "up" ? index - 1 : index + 1
    if (swapWith < 0 || swapWith >= sections.length) return { success: true }

    const ordered = [...sections]
    ;[ordered[index], ordered[swapWith]] = [ordered[swapWith], ordered[index]]

    await prisma.$transaction(
      ordered.map((s, i) =>
        prisma.propertySection.update({ where: { id: s.id }, data: { order: i } })
      )
    )

    await revalidateProperty(propertyId)
    return { success: true }
  } catch (err) {
    console.error("[SECTION_MOVE]", err)
    return { error: "Failed to reorder sections." }
  }
}
