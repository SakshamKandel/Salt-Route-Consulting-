"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { hash, compare } from "bcryptjs"
import { createAuditLog } from "@/lib/audit"
import { z } from "zod"

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export async function changeAdminPasswordAction(data: z.infer<typeof changePasswordSchema>) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") return { error: "Unauthorized" }

  try {
    const validated = changePasswordSchema.parse(data)

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user?.hashedPassword) return { error: "No password set for this account." }

    const isValid = await compare(validated.currentPassword, user.hashedPassword)
    if (!isValid) return { error: "Incorrect current password." }

    const newHash = await hash(validated.newPassword, 12)
    await prisma.user.update({ where: { id: user.id }, data: { hashedPassword: newHash } })

    await createAuditLog({
      action: "PASSWORD_CHANGE",
      entity: "USER",
      entityId: user.id,
      userId: user.id,
    })

    return { success: "Password updated successfully." }
  } catch {
    return { error: "Failed to update password." }
  }
}
