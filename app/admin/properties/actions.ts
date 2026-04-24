"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { PropertyStatus } from "@prisma/client"
import { createAuditLog } from "@/lib/audit"

const propertySchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  location: z.string().min(3),
  address: z.string().optional(),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  maxGuests: z.number().min(1),
  pricePerNight: z.number().min(0),
  status: z.nativeEnum(PropertyStatus),
  ownerId: z.string().min(1),
  highlights: z.array(z.string()).optional(),
})

export async function upsertPropertyAction(data: z.infer<typeof propertySchema>, id?: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  try {
    const validated = propertySchema.parse(data)

    if (id) {
      await prisma.property.update({
        where: { id },
        data: validated,
      })

      await createAuditLog({
        action: "UPDATE",
        entity: "PROPERTY",
        entityId: id,
        details: { title: validated.title, status: validated.status },
        userId: session.user.id,
      })

      revalidatePath(`/admin/properties/${id}`)
    } else {
      const newProperty = await prisma.property.create({
        data: validated,
      })
      id = newProperty.id

      await createAuditLog({
        action: "CREATE",
        entity: "PROPERTY",
        entityId: newProperty.id,
        details: { title: validated.title, status: validated.status },
        userId: session.user.id,
      })
    }

    revalidatePath("/admin/properties")
    return { success: true, id }
  } catch (error) {
    console.error("[PROPERTY_UPSERT]", error)
    return { error: "Failed to save property." }
  }
}
