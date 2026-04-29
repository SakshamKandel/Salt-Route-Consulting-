"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional().nullable(),
})

export async function updateOwnerProfileAction(data: z.infer<typeof profileSchema>) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "OWNER") return { error: "Unauthorized" }

  const parsed = profileSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, phone: parsed.data.phone ?? null },
  })

  revalidatePath("/owner/profile")
  return { success: "Profile updated." }
}
