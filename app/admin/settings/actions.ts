"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { hash, compare } from "bcryptjs"
import { createAuditLog } from "@/lib/audit"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional().nullable(),
})

export async function updateAdminProfileAction(data: z.infer<typeof profileSchema>) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  const parsed = profileSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, phone: parsed.data.phone ?? null },
  })

  revalidatePath("/admin/settings")
  return { success: "Profile updated." }
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export async function changeAdminPasswordAction(data: z.infer<typeof passwordSchema>) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  const parsed = passwordSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user?.hashedPassword) return { error: "No password set for this account." }

  const valid = await compare(parsed.data.currentPassword, user.hashedPassword)
  if (!valid) return { error: "Current password is incorrect." }

  const hashed = await hash(parsed.data.newPassword, 12)
  await prisma.user.update({ where: { id: session.user.id }, data: { hashedPassword: hashed } })

  await createAuditLog({
    action: "PASSWORD_CHANGE",
    entity: "USER",
    entityId: session.user.id,
    userId: session.user.id,
  })

  return { success: "Password updated successfully." }
}
