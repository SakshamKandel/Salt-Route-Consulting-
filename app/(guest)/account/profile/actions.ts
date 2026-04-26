"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const updateProfileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
})

export async function updateProfileAction(data: z.infer<typeof updateProfileSchema>) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    const validated = updateProfileSchema.parse(data)
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validated.name,
        phone: validated.phone,
        image: validated.image,
      }
    })

    return { success: "Profile updated successfully" }
  } catch {
    return { error: "We could not update your profile yet." }
  }
}
